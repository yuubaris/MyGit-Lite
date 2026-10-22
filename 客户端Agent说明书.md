# MyGit Lite 客户端 Agent 说明书

- 适用服务端：MyGit Lite（单用户版，`PRAGMA user_version = 1`）
- 文档版本：v1.1
- 更新日期：2026-10-22
- 协议：HTTPS（反向代理终结）+ REST API；JSON 报文走 b64s1 混淆
- 默认地址：`https://www.sample.com`

本文写给负责实现或操作客户端的 Agent。服务端只提供 API，不包含 UI。所有接口、字段、边界行为以本文为准，不要按 Git 协议或 Git 命令行语义假设。

---

## 1. 快速开始

当前实际部署：

| 项目 | 值 |
|---|---|
| 服务地址 | `https://www.sample.com` |
| 健康检查 | `GET https://www.sample.com/health`（不带混淆头时返回明文） |
| 认证 | `Authorization: Bearer <token>` |
| TLS 证书 | 由反向代理提供，按正常 HTTPS 校验即可 |
| 传输混淆 | JSON 报文 b64s1（换表 Base64），见 2.3 |
| 令牌文件 | 容器内 `/var/lib/mygit/token` |

```text
1. GET /health                     确认服务可用（无需令牌）
2. GET /api/repos                  确认目标仓库是否存在
3. POST /api/repos                 不存在则创建
4. POST /api/repos/{slug}/commits  上传 zip 完成提交
5. GET  /api/repos/{slug}/tree     校验提交结果
```

最小可用请求（不带混淆头，走明文 JSON 调试模式）：

```bash
BASE=https://www.sample.com
TOKEN=<服务端 /var/lib/mygit/token 的内容>

curl "$BASE/health"

curl \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE/api/repos"
```

正式客户端请按 2.3 实现 JSON 混淆收发；文件上传、文件/归档下载不需要编码。

获取令牌（Docker 部署）：

```bash
docker compose exec mygit cat /var/lib/mygit/token
```

---

## 2. 认证与传输

### 2.1 Bearer 令牌

除 `GET /health` 外，所有接口都必须携带：

```http
Authorization: Bearer <token>
```

规则：

- 只有一个令牌，没有用户、角色、权限概念。
- 令牌比较使用常量时间实现，客户端不需要做任何特殊处理。
- 令牌不要放进 URL、日志或提交信息。
- 返回 `401` 表示缺少令牌或令牌错误，不要通过重试解决，检查令牌来源。

### 2.2 HTTPS

- 生产地址 `https://www.sample.com` 的 HTTPS 由前置反向代理（Nginx、Caddy 等）提供，证书由反代管理，按正常 HTTPS 流程校验即可。
- 服务端应用本身不生成、不加载证书（Gunicorn 明文监听 `8443`），该端口只供反代转发，客户端不要绕过反代直连。
- 不需要再信任自签名 `server.crt`，也不要全局关闭证书校验。
- 混淆不是加密：链路上的机密性和完整性由这段 HTTPS 提供。

### 2.3 传输混淆（b64s1）

JSON 报文在传输时做换表 Base64 混淆：客户端发送前编码，收到后解码。只是混淆，不是加密。

范围：

- 混淆：JSON 请求体和响应体，包括错误响应。
- 不混淆：multipart 上传体、`/file` 与 `/archive` 的下载体（保持原始字节）、`Authorization`、URL 和 query 参数。
- `Content-Type` 不变：JSON 响应仍标 `application/json`，描述的是解码后的内容。

判断响应是否需要解码：**看响应头 `X-MyGit-Codec: b64s1` 是否存在**。存在才解码；不要假设"我发了头就一定收到编码"。

#### 算法：换表 Base64

- 标准字母表 `STD`：`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`，填充符 `=` 不参与换表。
- 派生种子：`seed = SHA-256("mygit-b64s1:" + token_utf8)`。
- 派生换表：把 64 个标准字符按 `SHA-256(seed + char)` 的字节序从小到大排序，哈希相同则按字符本身排序，得到 64 字符的乱序字母表。
- 编码：对原文做标准 Base64，然后每个字符按 `STD -> 乱序字母表` 替换。
- 解码：按 `乱序字母表 -> STD` 反向替换，再做标准 Base64 解码。
- 换表由访问令牌确定性派生，客户端持有同一个令牌即可还原，不需要额外配置；换令牌后换表自动变化。

Python 参考实现：

```python
import base64
import hashlib

STD = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

def make_codec(token):
    seed = hashlib.sha256(b"mygit-b64s1:" + token.encode("utf-8")).digest()
    alphabet = "".join(
        sorted(STD, key=lambda c: (hashlib.sha256(seed + c.encode()).digest(), c))
    )
    enc = bytes.maketrans(STD.encode(), alphabet.encode())
    dec = bytes.maketrans(alphabet.encode(), STD.encode())

    def encode(data: bytes) -> bytes:
        return base64.b64encode(data).translate(enc)

    def decode(text: bytes) -> bytes:
        return base64.b64decode(text.translate(dec), validate=True)

    return encode, decode
```

JavaScript（Node）参考实现：

```js
const crypto = require("crypto");
const STD = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function makeCodec(token) {
  const seed = crypto.createHash("sha256").update("mygit-b64s1:" + token, "utf8").digest();
  const chars = [...STD].sort((a, b) => {
    const ha = crypto.createHash("sha256").update(Buffer.concat([seed, Buffer.from(a)])).digest();
    const hb = crypto.createHash("sha256").update(Buffer.concat([seed, Buffer.from(b)])).digest();
    return Buffer.compare(ha, hb) || (a < b ? -1 : 1);
  });
  const alphabet = chars.join("");
  const toCustom = new Map([...STD].map((c, i) => [c, alphabet[i]]));
  const toStd = new Map([...alphabet].map((c, i) => [c, STD[i]]));

  return {
    encode(buf) {                       // Buffer -> string
      return Buffer.from(buf).toString("base64").split("").map(c => toCustom.get(c) ?? c).join("");
    },
    decode(text) {                      // string -> Buffer
      return Buffer.from([...text].map(c => toStd.get(c) ?? c).join(""), "base64");
    },
  };
}
```

#### 协商规则（`X-MyGit-Codec` 头）

- 请求头带 `X-MyGit-Codec: b64s1`：表示 JSON 请求体已按 b64s1 编码，服务端先解码再解析。**正式客户端必须带**。
- 不带该头：服务端按明文 JSON 解析、返回明文 JSON，仅用于 curl 调试。
- 响应：请求带了该头时，`application/json` 的响应（含错误响应）编码后返回，并附响应头 `X-MyGit-Codec: b64s1`；请求没带则返回明文。
- `GET /health` 同样适用：不带头时是明文 `{"status":"ok"}`，适合探活。
- multipart 上传请求带该头不影响上传体（保持原样），但它的 JSON 响应会按协商规则编码。
- JSON 请求体解码失败返回 `400 {"error":"invalid obfuscated body"}`，该响应也按协商规则编码。
- 换表只作用于 JSON 报文体，不防重放、不防篡改；这些由 HTTPS 和令牌负责。

#### 命令行辅助

调试或脚本场景可用一个小工具做编解码：

```python
#!/usr/bin/env python3
"""mygit_codec.py：用法 mygit_codec.py encode|decode，stdin 进 stdout 出"""
import base64, hashlib, os, sys

STD = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
TOKEN = os.environ["MYGIT_TOKEN"]

seed = hashlib.sha256(b"mygit-b64s1:" + TOKEN.encode("utf-8")).digest()
alphabet = "".join(sorted(STD, key=lambda c: (hashlib.sha256(seed + c.encode()).digest(), c)))
enc = bytes.maketrans(STD.encode(), alphabet.encode())
dec = bytes.maketrans(alphabet.encode(), STD.encode())

data = sys.stdin.buffer.read()
if sys.argv[1] == "encode":
    out = base64.b64encode(data).translate(enc)
else:
    out = base64.b64decode(data.translate(dec), validate=True)
sys.stdout.buffer.write(out)
```

```bash
BODY=$(printf '{"slug":"demo","name":"Demo"}' | MYGIT_TOKEN=$TOKEN python3 mygit_codec.py encode)

curl -X POST "$BASE/api/repos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-MyGit-Codec: b64s1" \
  -H "Content-Type: application/json" \
  -d "$BODY" | MYGIT_TOKEN=$TOKEN python3 mygit_codec.py decode
```

---

## 3. 通用约定

### 3.1 请求与响应

- JSON 请求使用 `Content-Type: application/json`。
- JSON 响应使用 `application/json; charset=utf-8`。
- JSON 请求体和响应体按 2.3 的 b64s1 混淆收发（不带 `X-MyGit-Codec` 头走明文，仅用于调试）。
- 文件上传使用 `multipart/form-data`，上传体不混淆。
- 单文件下载返回 `application/octet-stream`。
- 归档下载返回 `application/zip`。
- 所有时间都是 UTC，格式 `YYYY-MM-DDTHH:MM:SSZ`。
- 哈希是 SHA-256 的 64 位小写十六进制字符串。

### 3.2 成功状态码

所有成功请求统一返回 `200`。创建仓库、提交、创建分支/标签也返回 `200`，不是 `201`。

### 3.3 错误响应

所有错误统一为：

```json
{"error": "简要错误信息"}
```

| HTTP | 含义 |
|---|---|
| 400 | 参数错误、zip 不合法、路径非法、ref 前缀歧义、空仓库创建分支/标签 |
| 401 | 缺少或错误的 Bearer 令牌 |
| 404 | 仓库、分支、标签、commit、文件路径不存在；分支为空 |
| 409 | 仓库 slug、分支名、标签名冲突；删除默认分支 |
| 413 | 请求体、zip 条目数、解压总量或压缩比超过限制 |
| 500 | 服务端未预期错误 |

客户端不要依赖 `error` 的文案做分支判断，使用状态码。

错误响应也是 JSON，同样按 2.3 的协商规则编码；客户端应以响应头 `X-MyGit-Codec` 判断是否解码。

### 3.4 命名与路径规则

仓库 slug：

- 只允许小写字母、数字、连字符。
- 长度 1-64。
- 不能以连字符开头或结尾。
- 创建后不可改名。

分支名、标签名：

- 长度 1-128。
- 禁止空格、`~ ^ : ? * [ \`。
- 禁止 `..`。
- 不能以 `/` 开头或结尾，不能包含 `//`。
- 可以包含内部 `/`，例如 `feature/login`；URL 中使用时按正常路径处理或编码。

`path` 参数：

- 使用 POSIX 风格 `/` 分隔，相对于仓库根目录。
- 禁止绝对路径、盘符、`..`、`.`、空段、NUL、反斜杠。
- 单路径最大 1024 字符。
- 根目录用空字符串 `""` 或省略 `path`。

### 3.5 ref 解析

所有接受 `ref` 的接口（`tree`、`file`、`archive`、`commits`、`diff`、`reset`）按以下顺序解析：

```text
分支名 → 标签名 → 完整 64 位 commit 哈希 → 唯一短哈希前缀（至少 7 位）
```

规则：

- 分支名优先于标签名。
- 短前缀只匹配 commit 对象，不匹配 blob/tree。
- 前缀匹配到多个 commit 时返回 `400 ambiguous commit prefix`。
- 省略 `ref` 时使用仓库默认分支（当前固定为 `main`）。
- 分支存在但 head 为空时返回 `404 branch is empty`。

### 3.6 历史与分页

`GET /api/repos/{slug}/commits`：

- 从分支 head 沿 `parent` 链回溯，按链顺序返回，最新在前。
- `limit` 默认 50，最大 200。
- `offset` 默认 0。
- 不支持按作者、时间、关键字过滤。

---

## 4. 数据模型

### 4.1 对象

服务端内部使用三类对象：

| 类型 | 内容 |
|---|---|
| blob | 文件原始字节 |
| tree | 目录条目列表 |
| commit | tree、父提交、提交说明、作者、时间 |

客户端只需要关心 commit 哈希和路径，不需要直接操作对象文件。

### 4.2 提交链

- 每个 commit 最多一个父提交。
- 提交只能追加到分支 head，客户端不能指定 `parent`。
- 不支持 merge、rebase、cherry-pick。
- `reset --force` 会移动分支指针，历史可能被覆盖。
- 删除分支或被 force reset 丢弃的 commit 会被 GC 回收。

### 4.3 文件模式

支持：

- 普通文件 `100644`
- 可执行文件 `100755`
- 目录 `040000`（仅内部 tree 使用）

不支持：

- 符号链接、硬链接、设备文件、子模块。
- 空目录（不会进入版本库）。
- Git LFS。

---

## 5. 接口参考

共 17 个接口。

### 5.1 运维

#### GET /health

无需认证。

```json
{"status": "ok"}
```

只用于判断进程是否可用，不检查数据库或磁盘。不带 `X-MyGit-Codec` 头时返回明文，适合探活；带该头时按 2.3 协商规则编码。

---

### 5.2 仓库

#### GET /api/repos

返回仓库列表。

```json
{
  "repos": [
    {
      "slug": "demo",
      "name": "Demo",
      "description": "个人项目",
      "default_branch": "main",
      "head": "c3d4...",
      "created_at": "2026-10-21T10:00:00Z"
    }
  ]
}
```

- `head` 为空表示默认分支还没有提交。

#### POST /api/repos

```json
{
  "slug": "demo",
  "name": "Demo",
  "description": "个人项目"
}
```

- `slug` 必填。
- `name` 可省略，默认等于 slug。
- `description` 可省略。
- 默认分支固定为 `main`，创建时 head 为空。
- 重复 slug 返回 `409`。

成功响应：

```json
{
  "slug": "demo",
  "name": "Demo",
  "description": "个人项目",
  "default_branch": "main",
  "head": null,
  "created_at": "2026-10-21T10:00:00Z"
}
```

#### DELETE /api/repos/{slug}

删除仓库、数据库记录和全部对象文件，不可恢复。

```json
{"deleted": true, "slug": "demo"}
```

客户端必须二次确认后再调用。

---

### 5.3 提交

#### POST /api/repos/{slug}/commits

`multipart/form-data`。

| 字段 | 必填 | 说明 |
|---|---|---|
| `file` | snapshot 必填，patch 可选 | zip 文件，zip 根目录就是仓库根目录 |
| `message` | 是 | 提交说明，不能为空 |
| `branch` | 否 | 默认仓库默认分支 `main` |
| `mode` | 否 | `snapshot`（默认）或 `patch` |
| `deletions` | 否 | patch 模式下的删除路径，JSON 数组字符串 |

响应：

```json
{
  "commit": "fe9061e61406edd08ab0fdbc30e09d8481d433110ab114a604f1b13b1cffd499",
  "branch": "main",
  "parent": "a1b2...",
  "files": 12,
  "ignored": ["build/out.bin", "debug.log"]
}
```

- `parent` 是提交时分支的 head，首次提交为 `null`。
- `files` 是新 tree 中的文件总数。
- `ignored` 是被忽略且未跟踪的上传文件，最多返回 100 条。

行为：

- 服务端以提交时分支 head 为父提交，客户端不能也不能指定 `parent`。
- 允许空提交：patch 模式没有实际变更时仍会生成 commit。
- 同一仓库内相同 commit 哈希重复写入时幂等，不会报 500。
- 不提供提交预览、暂存区、changeset。

---

### 5.4 snapshot 与 patch

| 模式 | 语义 |
|---|---|
| `snapshot` | zip 代表新的完整目录树；未出现在 zip 中的文件（保留集合除外）视为删除 |
| `patch` | 只应用 zip 中的文件；未出现的文件保持不变；删除由 `deletions` 指定 |

`deletions` 示例：

```json
["old/file.txt", "dist"]
```

- 删除路径不存在时静默忽略。
- 删除目录路径会删除其下全部文件。
- snapshot 模式会忽略 `deletions`。

snapshot 的保留集合：

- base commit 中已跟踪、命中 `.gitignore`、且没有出现在 zip 中的文件，会继续保留。
- 这条规则用于避免新增忽略规则后，历史已跟踪文件突然消失。
- 要删除这类文件，使用 patch 模式并在 `deletions` 中列出。

客户端选择建议：

| 场景 | 推荐模式 |
|---|---|
| 首次提交、完整同步工作区 | snapshot |
| 只上传改动文件、保留远端其他文件 | patch |
| 删除少量文件 | patch + deletions |
| 用不完整 zip 做 snapshot | 禁止，会删除远端大量文件 |

---

### 5.5 .gitignore 行为

服务端使用 Git gitignore 语义，支持：

- 根目录和任意子目录的 `.gitignore`。
- `!` 否定规则。
- `*`、`**`、`?`、字符组。
- 锚定规则 `/foo`。
- 目录规则 `build/`。
- 越深的 `.gitignore` 优先级越高。

限制：

- `.git/` 永远排除，不能通过 `!` 重新包含。
- 父目录已被排除时，子文件的 `!` 不能重新包含它。
- 只读取仓库内的 `.gitignore`，不读取全局 excludes。
- `.gitignore` 本身是普通文件，参与版本管理。

不同模式下的规则来源：

- `snapshot`：只使用本次 zip 中的 `.gitignore`。zip 中缺失的 `.gitignore` 不再生效。
- `patch`：base 中已有且未被删除的 `.gitignore` 继续生效，本次上传的同名文件覆盖。

过滤规则：

- 被忽略且未跟踪的文件不进入新 tree，并出现在 `ignored` 中。
- 已跟踪文件即使命中忽略规则也会保留。
- 客户端可以把被忽略文件一起打进 zip，服务端会过滤；但排除 `.git` 和明显的大文件可以减少上传量。

---

### 5.6 历史

#### GET /api/repos/{slug}/commits

查询参数：

| 参数 | 默认 | 说明 |
|---|---|---|
| `ref` | 默认分支 | 分支、标签、提交哈希或短前缀 |
| `limit` | 50 | 最大 200 |
| `offset` | 0 | 跳过链上的前 N 个提交 |

响应：

```json
{
  "commits": [
    {
      "hash": "c3d4...",
      "tree": "e5f6...",
      "parent": "a1b2...",
      "message": "feat: first commit",
      "author": "admin",
      "created_at": "2026-10-21T10:00:00Z"
    }
  ]
}
```

- 返回的是分支链上的历史，不是 `commits` 表中的全部行。
- force reset 后，被丢弃的提交不会出现在历史中，除非用其哈希直接查询。

---

### 5.7 diff

#### GET /api/repos/{slug}/diff

| 参数 | 默认 | 说明 |
|---|---|---|
| `base` | `head` 的父提交 | 基线 ref |
| `head` | 默认分支 | 目标 ref |

- 根提交省略 `base` 时，`base` 为 `null`，所有文件按新增处理。
- 文件状态只有 `added`、`modified`、`deleted`，不做重命名识别。

响应：

```json
{
  "base": "a1b2...",
  "head": "c3d4...",
  "files": [
    {
      "path": "src/app.py",
      "status": "modified",
      "diff": "@@ -1,3 +1,4 @@\n..."
    },
    {
      "path": "logo.png",
      "status": "added",
      "binary": true
    }
  ],
  "truncated": false
}
```

规则：

- 前 8 KB 含 NUL 字节视为二进制，只返回 `binary: true`，不返回 `diff`。
- 文本使用 unified diff。
- 单文件 diff 超过 2 MB 或 5000 行时截断，文件带 `truncated: true`。
- 顶层 `truncated` 表示至少一个文件被截断。

---

### 5.8 文件浏览与下载

#### GET /api/repos/{slug}/tree

参数：`ref`、`path`。

```json
{
  "ref": "main",
  "path": "src",
  "entries": [
    {
      "name": "app.py",
      "type": "file",
      "mode": "100644",
      "hash": "...",
      "size": 1234
    },
    {
      "name": "utils",
      "type": "dir",
      "mode": "040000",
      "hash": "..."
    }
  ]
}
```

- `path` 省略或为空时列出根目录。
- `path` 指向文件时返回 `400`。
- 路径不存在返回 `404`。
- 条目按名称字节序排序。
- `size` 只对文件返回。

#### GET /api/repos/{slug}/file

参数：`ref`、`path`（必填）。

返回 `application/octet-stream`，`Content-Disposition: attachment`。

- `path` 指向目录返回 `400`。
- 不存在返回 `404`。

#### GET /api/repos/{slug}/archive

参数：`ref`、`path`（可选，子目录）。

- 返回 zip。
- `path` 为空时打包整棵树。
- `path` 指向文件返回 `400`。
- 归档内路径相对于所选目录。
- 空目录不会出现在归档中。

---

### 5.9 分支

#### GET /api/repos/{slug}/branches

```json
{
  "branches": [
    {
      "name": "main",
      "head": "c3d4...",
      "updated_at": "2026-10-21T10:00:00Z",
      "default": true
    }
  ]
}
```

#### POST /api/repos/{slug}/branches

```json
{"name": "feature/login", "from": "main"}
```

- `from` 可省略，默认默认分支。
- `from` 可以是分支、标签、提交哈希或短前缀。
- 空仓库返回 `400`。
- 同名分支返回 `409`。

成功响应：

```json
{
  "name": "feature/login",
  "head": "c3d4...",
  "updated_at": "2026-10-21T10:00:00Z"
}
```

#### DELETE /api/repos/{slug}/branches/{name}

- 默认分支不能删除，返回 `409`。
- 不存在返回 `404`。
- 删除分支不会删除 commit 对象，未引用的对象后续由 GC 清理。

---

### 5.10 标签

轻量标签，只能指向 commit。

#### GET /api/repos/{slug}/tags

```json
{
  "tags": [
    {
      "name": "v1.0",
      "commit": "c3d4...",
      "message": "first release",
      "created_at": "2026-10-21T10:00:00Z"
    }
  ]
}
```

#### POST /api/repos/{slug}/tags

```json
{"name": "v1.0", "commit": "main", "message": "first release"}
```

- `commit` 可省略，默认默认分支 head。
- 空仓库返回 `400`。
- 同名标签返回 `409`。

#### DELETE /api/repos/{slug}/tags/{name}

删除标签不影响 commit 和对象。

---

### 5.11 恢复

#### POST /api/repos/{slug}/reset

```json
{"branch": "main", "commit": "v1.0", "mode": "restore"}
```

| 字段 | 默认 | 说明 |
|---|---|---|
| `branch` | 默认分支 | 要移动的分支 |
| `commit` | 必填 | 分支、标签、提交哈希或短前缀 |
| `mode` | `restore` | `restore` 或 `force` |

模式：

| 模式 | 行为 |
|---|---|
| `restore` | 以目标 commit 的 tree 创建新 commit，父提交为当前 head，历史保留 |
| `force` | 直接把分支 head 移到目标 commit，丢弃当前链上的后续提交 |

响应：

```json
{
  "branch": "main",
  "mode": "force",
  "commit": "a1b2...",
  "head": "a1b2..."
}
```

- `commit` 是目标提交。
- `head` 是操作后的分支 head。
- `restore` 时 `head` 是新生成的提交，不等于 `commit`。
- `force` 是高危操作，客户端需要明确确认。

---

## 6. 客户端打包规范

### 6.1 zip 结构

- zip 根目录必须直接对应仓库根目录。
- 不要把项目父目录作为顶层目录打进去，例如不要出现 `demo/src/app.py`；除非仓库根就是 `demo`。
- 目录条目会被忽略，空目录不会保存。
- 路径使用 `/`。
- 不要包含符号链接、设备文件。
- 可以包含 `.gitignore`，服务端会把它当普通文件。
- `.git` 目录服务端会强制排除，客户端可以不打进去以减小体积。

示例（在项目根目录执行）：

```bash
zip -r snapshot.zip . -x '.git/*' -x '.git'
```

### 6.2 上传限制

| 项目 | 限制 |
|---|---|
| 请求体 | 默认 200 MB（multipart 整体） |
| zip 条目数 | 默认 20000 |
| 解压后总大小 | 默认 500 MB |
| 压缩比 | 不超过 100:1 |
| 单路径长度 | 1024 字符 |

超过请求体、条目数、解压总量或压缩比限制返回 `413`；zip 结构、路径、重复路径不合法返回 `400`。snapshot 不能把一次提交拆成多个请求。

### 6.3 可执行文件

zip 条目里的 Unix 权限位会被读取：

- 有任一执行位 → `100755`
- 否则 → `100644`

Windows 打包通常不保留执行位。如果仓库包含脚本，客户端应在创建 zip 时显式设置模式，或接受文件变为普通文件。

### 6.4 大小写与重复路径

- zip 中仅大小写不同的重复路径会被拒绝。
- 文件与目录前缀冲突（例如同时有 `a` 和 `a/b`）会被拒绝。
- 服务端按 Linux 大小写敏感处理。

---

## 7. 客户端实现建议

### 7.1 提交流程

```text
1. 确认仓库存在；404 则创建
2. 确认分支存在；不存在则从目标 ref 创建
3. 生成 zip
4. POST commits
5. 用返回的 commit 查询 history/tree 做校验
```

### 7.2 snapshot / patch 选择

- 首次提交用 snapshot。
- 日常增量同步优先 patch，避免误删远端文件。
- 只有确定本地是完整工作区时，才用 snapshot。
- snapshot 的 zip 必须包含所有需要保留的已跟踪文件。
- 如果客户端根据 `.gitignore` 排除文件，注意：已跟踪但被忽略的文件会被服务端保留，不会因为没上传而删除；其他已跟踪文件如果没上传，会被删除。

### 7.3 重试

- `401`、`400`、`409`、`413` 不要盲目重试，先修正请求。
- 网络超时后不要直接重提：提交可能已经成功，先查 `GET /commits` 确认。
- 提交接口只对相同哈希做幂等处理，普通重试通常会生成新的 commit。
- 不要并发向同一分支提交；服务端没有锁，后写会覆盖前写。

### 7.4 校验

提交后建议：

1. `GET /commits?ref=<branch>&limit=1` 确认 head 是返回的 commit。
2. `GET /tree?ref=<branch>&path=<关键目录>` 确认文件存在。
3. 对关键文件 `GET /file` 或 `GET /archive` 做抽样校验。

### 7.5 下载

- 单文件用 `/file`，适合脚本。
- 目录或整库用 `/archive`。
- 归档不包含空目录。
- 大仓库下载时客户端应流式写盘，不要在内存中拼接整个响应。

### 7.6 安全

- 只通过 `https://www.sample.com`（反代 HTTPS）访问，不要绕过反代直连 `8443` 明文端口。
- 按正常 HTTPS 流程校验反代证书，不要在生产客户端禁用证书校验。
- JSON 报文按 2.3 的 b64s1 混淆收发；混淆不是加密，机密性依赖 HTTPS。
- 令牌只放在请求头，不要写进 URL、命令行历史或日志。
- 提交说明中不要包含令牌。

---

## 8. 不支持的能力

客户端 Agent 不应尝试以下操作：

- 原生 `git clone/push/pull`，协议不兼容。
- merge、rebase、cherry-pick、多父提交。
- 重命名识别；diff 会把重命名显示为删除 + 新增。
- 符号链接、子模块、Git LFS。
- 空目录版本化。
- 分支保护、成员权限、多用户。
- 提交预览、暂存区、部分提交。
- 按文件路径做服务端搜索、按提交信息搜索。

---

## 9. 典型流程

以下示例不带 `X-MyGit-Codec` 头，走明文 JSON 调试模式，便于阅读；正式客户端按 2.3 混淆后收发。multipart 上传和文件/归档下载本身不需要编码，示例可原样使用。

### 9.1 首次提交

```bash
curl -X POST "$BASE/api/repos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"demo","name":"Demo"}'

zip -r snapshot.zip . -x '.git/*' -x '.git'

curl -X POST "$BASE/api/repos/demo/commits" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@snapshot.zip" \
  -F "message=feat: initial commit" \
  -F "branch=main" \
  -F "mode=snapshot"
```

### 9.2 增量提交

```bash
zip -r patch.zip src/ README.md

curl -X POST "$BASE/api/repos/demo/commits" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@patch.zip" \
  -F "message=fix: update source" \
  -F "branch=main" \
  -F "mode=patch" \
  -F 'deletions=["old/file.txt"]'
```

### 9.3 查询与下载

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "$BASE/api/repos/demo/commits?ref=main&limit=20"

curl -H "Authorization: Bearer $TOKEN" \
  "$BASE/api/repos/demo/diff?base=v1.0&head=main"

curl -H "Authorization: Bearer $TOKEN" \
  "$BASE/api/repos/demo/tree?ref=main&path=src"

curl -H "Authorization: Bearer $TOKEN" \
  "$BASE/api/repos/demo/file?ref=main&path=src/app.py" \
  -o app.py

curl -H "Authorization: Bearer $TOKEN" \
  "$BASE/api/repos/demo/archive?ref=main" \
  -o demo.zip
```

### 9.4 分支、标签、恢复

```bash
curl -X POST "$BASE/api/repos/demo/branches" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"feature/login","from":"main"}'

curl -X POST "$BASE/api/repos/demo/tags" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"v1.0","commit":"main","message":"first release"}'

curl -X POST "$BASE/api/repos/demo/reset" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branch":"main","commit":"v1.0","mode":"restore"}'
```

---

## 10. 自检清单

客户端 Agent 在完成实现前逐项确认：

- [ ] 除 `/health` 外所有请求都带 Bearer 令牌。
- [ ] 通过反代 HTTPS 访问，没有禁用 TLS 证书校验，也没有绕过反代直连 `8443` 明文端口。
- [ ] JSON 请求体按 b64s1 编码并带 `X-MyGit-Codec: b64s1` 头。
- [ ] 响应以 `X-MyGit-Codec` 响应头判断是否解码，没有盲目解码。
- [ ] multipart 上传体和 `/file`、`/archive` 下载体保持原始字节，没有编码。
- [ ] 仓库 slug、分支名、标签名按规则校验。
- [ ] zip 根目录就是仓库根目录，没有多余顶层目录。
- [ ] snapshot 只用于完整工作区，并包含需要保留的全部已跟踪文件。
- [ ] patch 的 `deletions` 是 JSON 数组字符串。
- [ ] 不向提交接口发送 `parent` 字段。
- [ ] 处理了 `400/401/404/409/413`，没有对它们无限重试。
- [ ] 网络超时后先查历史，再决定是否重提。
- [ ] 不并发向同一分支提交。
- [ ] 大文件下载流式写盘。
- [ ] 客户端日志不输出令牌。
