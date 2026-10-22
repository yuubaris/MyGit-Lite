# MyGit Lite

一个轻量级、单用户的私有 Git 仓库服务。服务端只提供 REST API，不包含 Web UI，适合自建代码备份、配置同步或客户端 Agent 自动提交。

- 单令牌认证，无用户/角色体系
- 仓库、提交、分支、标签、diff、文件浏览与 zip 归档
- 兼容 `.gitignore` 语义
- 基于文件系统的对象存储 + SQLite 元数据
- JSON 报文可选 `b64s1` 换表 Base64 混淆（仅混淆，不是加密）
- 支持 Docker 与裸机（Gunicorn + systemd）部署

完整的接口与客户端实现细节见 [客户端Agent说明书.md](客户端Agent说明书.md)。

---

## 目录

- [架构与目录结构](#架构与目录结构)
- [环境要求](#环境要求)
- [方式一：Docker Compose 部署（推荐）](#方式一docker-compose-部署推荐)
- [方式二：Linux 服务器裸机部署](#方式二linux-服务器裸机部署)
- [反向代理与 HTTPS](#反向代理与-https)
- [配置项](#配置项)
- [数据、备份与升级](#数据备份与升级)
- [垃圾回收（GC）](#垃圾回收gc)
- [API 速览](#api-速览)
- [安全建议](#安全建议)
- [常见问题](#常见问题)

---

## 架构与目录结构

```text
.
├── app/
│   ├── __init__.py       Flask 应用工厂、/health、统一错误处理
│   ├── config.py         从环境变量加载配置
│   ├── auth.py           Bearer 令牌校验（常量时间比较）
│   ├── codec.py          b64s1 JSON 报文编解码中间件
│   ├── db.py             SQLite 连接、建表、事务
│   ├── api/              仓库 / 提交 / 文件 / 分支标签接口
│   └── core/             对象存储、树、路径校验、ignore、diff、GC、上传
├── schema.sql            数据库结构
├── manage.py             init（初始化目录/数据库/令牌）、gc（回收对象）
├── wsgi.py               WSGI 入口
├── gunicorn.conf.py      Gunicorn 配置
├── Dockerfile
├── docker-compose.yml
└── docker-entrypoint.sh  容器启动时执行 manage.py init
```

运行时数据默认位于 `/var/lib/mygit`：

```text
/var/lib/mygit/
├── mygit.db               SQLite 数据库（WAL 模式）
├── token                  访问令牌（0600，首次启动自动生成）
└── data/
    ├── repos/<slug>/objects/   仓库对象文件
    └── tmp/                    上传临时目录
```

---

## 环境要求

| 部署方式 | 要求 |
|---|---|
| Docker | Docker Engine 24+，Docker Compose v2 |
| 裸机 | Linux、Python 3.11+、可用的反向代理（Nginx/Caddy） |
| 对外访问 | 必须经反向代理提供 HTTPS，应用本身只监听明文 HTTP |

默认端口为 `8443`，默认上传请求体上限 `200 MB`。

---

## 方式一：Docker Compose 部署（推荐）

### 1. 获取代码并构建

```bash
git clone <your-repo-url> mygit-lite
cd mygit-lite
docker compose up -d --build
```

首次启动会自动创建目录、数据库和随机令牌，数据保存在命名卷 `mygit-data` 中。

### 2. 验证服务

```bash
curl http://127.0.0.1:8443/health
# {"status":"ok"}
```

### 3. 获取访问令牌

```bash
docker compose exec mygit cat /var/lib/mygit/token
```

之后所有接口（`/health` 除外）都需要携带：

```bash
TOKEN=<上一步输出的令牌>
curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8443/api/repos
```

### 4. 修改端口与配置

推荐在同目录创建 `.env`（已被 `.gitignore` 忽略）：

```dotenv
# 只监听本机，由反向代理对外提供 HTTPS
MYGIT_PORT=127.0.0.1:8443
MYGIT_AUTHOR=admin
MYGIT_MAX_UPLOAD_MB=200
MYGIT_MAX_FILES=20000
MYGIT_MAX_UNCOMPRESSED_MB=500
MYGIT_WORKERS=1
MYGIT_THREADS=4
```

修改后重建容器：

```bash
docker compose up -d
```

> 生产环境不要把 `8443` 直接暴露到公网；`MYGIT_PORT` 建议绑定 `127.0.0.1:8443`。

### 5. 常用运维命令

```bash
docker compose logs -f mygit        # 查看日志
docker compose restart mygit        # 重启
docker compose exec mygit python manage.py gc   # 手动回收对象
docker compose down                 # 停止并移除容器（保留数据卷）
```

数据卷只有在执行 `docker compose down -v` 时才会删除，请谨慎使用。

---

## 方式二：Linux 服务器裸机部署

以 `/opt/mygit` 为安装目录、`mygit` 为运行用户、`/var/lib/mygit` 为数据目录为例。

### 1. 创建用户与目录

```bash
sudo useradd -r -s /usr/sbin/nologin mygit
sudo mkdir -p /opt/mygit /var/lib/mygit
sudo chown -R mygit:mygit /opt/mygit /var/lib/mygit
```

### 2. 上传代码并安装依赖

```bash
cd /opt/mygit
sudo -u mygit python3 -m venv .venv
sudo -u mygit .venv/bin/pip install -r requirements.txt
```

### 3. 初始化目录、数据库与令牌

```bash
sudo -u mygit env \
  MYGIT_DATA_DIR=/var/lib/mygit/data \
  MYGIT_DB=/var/lib/mygit/mygit.db \
  MYGIT_TOKEN_FILE=/var/lib/mygit/token \
  .venv/bin/python manage.py init
```

该命令是幂等的：已存在的数据和令牌不会被覆盖。

### 4. 手动启动验证

```bash
sudo -u mygit env \
  MYGIT_DATA_DIR=/var/lib/mygit/data \
  MYGIT_DB=/var/lib/mygit/mygit.db \
  MYGIT_TOKEN_FILE=/var/lib/mygit/token \
  MYGIT_BIND=127.0.0.1:8443 \
  .venv/bin/gunicorn -c gunicorn.conf.py wsgi:app
```

另开终端验证：

```bash
curl http://127.0.0.1:8443/health
```

### 5. 配置 systemd

创建 `/etc/systemd/system/mygit.service`：

```ini
[Unit]
Description=MyGit Lite
After=network.target

[Service]
Type=simple
User=mygit
Group=mygit
WorkingDirectory=/opt/mygit
Environment=MYGIT_DATA_DIR=/var/lib/mygit/data
Environment=MYGIT_DB=/var/lib/mygit/mygit.db
Environment=MYGIT_TOKEN_FILE=/var/lib/mygit/token
Environment=MYGIT_BIND=127.0.0.1:8443
Environment=MYGIT_WORKERS=1
Environment=MYGIT_THREADS=4
Environment=MYGIT_LOG_LEVEL=info
ExecStart=/opt/mygit/.venv/bin/gunicorn -c /opt/mygit/gunicorn.conf.py wsgi:app
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

启用并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mygit
sudo systemctl status mygit
sudo journalctl -u mygit -f
```

获取令牌：

```bash
sudo cat /var/lib/mygit/token
```

---

## 反向代理与 HTTPS

应用只监听明文 HTTP，HTTPS 必须由前置反向代理终结。代理到应用的超时时间应不小于 Gunicorn 的 `timeout = 120`，请求体上限应不小于 `MYGIT_MAX_UPLOAD_MB`。

### Nginx 示例

```nginx
server {
    listen 80;
    server_name git.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name git.example.com;

    ssl_certificate     /etc/letsencrypt/live/git.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/git.example.com/privkey.pem;

    # 与 MYGIT_MAX_UPLOAD_MB 保持一致或更大
    client_max_body_size 200m;

    location / {
        proxy_pass http://127.0.0.1:8443;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
```

### Caddy 示例

```caddyfile
git.example.com {
    reverse_proxy 127.0.0.1:8443
    request_body {
        max_size 200MB
    }
}
```

Caddy 会自动申请并续期证书。证书配置完成后，客户端只需访问 `https://git.example.com`，不要绕过代理直连 `8443`。

### 防火墙建议

```bash
# 仅放行反向代理需要的端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# 不要放行 8443
sudo ufw enable
```

---

## 配置项

所有配置通过环境变量提供。

| 变量 | 默认值 | 说明 |
|---|---|---|
| `MYGIT_DATA_DIR` | `/var/lib/mygit/data` | 仓库对象与临时目录的根目录 |
| `MYGIT_DB` | `/var/lib/mygit/mygit.db` | SQLite 数据库路径 |
| `MYGIT_TOKEN_FILE` | `/var/lib/mygit/token` | 令牌文件路径，不存在时由 `manage.py init` 生成 |
| `MYGIT_TOKEN` | 空 | 直接指定令牌，优先级高于令牌文件，适合容器 Secret 注入 |
| `MYGIT_AUTHOR` | `admin` | 提交作者名 |
| `MYGIT_MAX_UPLOAD_MB` | `200` | multipart 请求体上限（MB） |
| `MYGIT_MAX_FILES` | `20000` | 单个 zip 允许的最大条目数 |
| `MYGIT_MAX_UNCOMPRESSED_MB` | `500` | 解压后总大小上限（MB） |
| `MYGIT_GC_GRACE_H` | `24` | GC 保留最近多少小时的对象 |
| `MYGIT_BIND` | `0.0.0.0:8443` | Gunicorn 监听地址 |
| `MYGIT_WORKERS` | `1` | Gunicorn worker 数量 |
| `MYGIT_THREADS` | `4` | 每个 worker 的线程数 |
| `MYGIT_LOG_LEVEL` | `info` | Gunicorn 日志级别 |
| `MYGIT_PORT` | `8443` | 仅 Docker Compose 使用，宿主端口映射，可写 `127.0.0.1:8443` |

> SQLite 为单写者模型，建议保持 `MYGIT_WORKERS=1`，通过 `MYGIT_THREADS` 提升并发。

---

## 数据、备份与升级

### Docker 备份

```bash
docker compose stop
docker cp mygit:/var/lib/mygit ./mygit-backup
docker compose start
```

### Docker 恢复

```bash
docker compose down
docker run --rm -v mygit-data:/data -v "$PWD/mygit-backup":/backup alpine \
  sh -c "rm -rf /data/* && cp -a /backup/. /data/"
docker compose up -d
```

> 备份文件包含令牌，请按敏感数据保管。恢复后令牌保持不变；删除令牌文件后执行 `manage.py init`（容器重启也会自动执行）会生成新令牌，所有客户端需同步更新。

### 裸机备份与恢复

```bash
sudo systemctl stop mygit
sudo tar czf mygit-backup.tar.gz -C /var/lib mygit
sudo systemctl start mygit
```

恢复时停止服务，解压回 `/var/lib/mygit`，确认属主为 `mygit` 后启动。

### 升级

```bash
# Docker
git pull
docker compose up -d --build

# 裸机
sudo systemctl stop mygit
git pull
sudo -u mygit .venv/bin/pip install -r requirements.txt
sudo systemctl start mygit
```

升级前先备份数据目录。容器重建不会影响命名卷中的数据。

---

## 垃圾回收（GC）

以下对象会被视为不可达并回收：

- 分支被删除或 `force reset` 丢弃的提交
- 没有提交继续引用的 tree/blob

```bash
# Docker
docker compose exec mygit python manage.py gc

# 裸机
sudo -u mygit env \
  MYGIT_DATA_DIR=/var/lib/mygit/data \
  MYGIT_DB=/var/lib/mygit/mygit.db \
  .venv/bin/python manage.py gc
```

默认保留最近 `24` 小时的对象，可用 `--grace-hours` 覆盖：

```bash
python manage.py gc --grace-hours 72
```

建议通过 cron 定期执行，例如每天凌晨：

```cron
0 3 * * * docker compose -f /opt/mygit/docker-compose.yml exec -T mygit python manage.py gc
```

---

## API 速览

所有成功请求返回 `200`；错误统一为 `{"error": "..."}`。除 `GET /health` 外均需 `Authorization: Bearer <token>`。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/health` | 健康检查，无需认证 |
| GET | `/api/repos` | 仓库列表 |
| POST | `/api/repos` | 创建仓库 |
| DELETE | `/api/repos/{slug}` | 删除仓库及全部数据 |
| POST | `/api/repos/{slug}/commits` | 上传 zip 提交（snapshot / patch） |
| GET | `/api/repos/{slug}/commits` | 提交历史 |
| GET | `/api/repos/{slug}/diff` | 两次提交之间的 diff |
| GET | `/api/repos/{slug}/tree` | 目录浏览 |
| GET | `/api/repos/{slug}/file` | 单文件下载 |
| GET | `/api/repos/{slug}/archive` | 目录/整库 zip 下载 |
| GET/POST | `/api/repos/{slug}/branches` | 分支列表 / 创建 |
| DELETE | `/api/repos/{slug}/branches/{name}` | 删除分支 |
| GET/POST | `/api/repos/{slug}/tags` | 标签列表 / 创建 |
| DELETE | `/api/repos/{slug}/tags/{name}` | 删除标签 |
| POST | `/api/repos/{slug}/reset` | 恢复或强制移动分支 |

最小示例：

```bash
BASE=http://127.0.0.1:8443
TOKEN=$(cat /var/lib/mygit/token)

curl "$BASE/health"

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

正式客户端应使用 `X-MyGit-Codec: b64s1` 对 JSON 报文做混淆，算法与示例见 [客户端Agent说明书.md](客户端Agent说明书.md) 第 2.3 节。

---

## 安全建议

- 应用只监听 `127.0.0.1:8443`（或容器内网），对外仅暴露反向代理的 443 端口。
- 令牌文件权限保持 `0600`，不要提交到代码仓库、写入 URL、命令行历史或日志。
- 使用正规 CA 证书，不要在生产客户端关闭证书校验。
- 反向代理的 `client_max_body_size` 与应用上传上限保持一致，避免出现 `413`。
- 定期备份 `/var/lib/mygit`，并对备份文件做访问控制。
- `b64s1` 只是混淆，不提供加密或防篡改能力，机密性与完整性依赖 HTTPS。

---

## 常见问题

**启动时报 `access token not initialized`**

先执行 `python manage.py init`（裸机）或确认容器已正常启动。应用启动时需要读取令牌文件。

**请求返回 `401`**

令牌缺失或错误。重新执行 `docker compose exec mygit cat /var/lib/mygit/token`，并确认请求头格式为 `Authorization: Bearer <token>`。

**上传返回 `413`**

同时检查 `MYGIT_MAX_UPLOAD_MB`、`MYGIT_MAX_FILES`、`MYGIT_MAX_UNCOMPRESSED_MB`，以及反向代理的 `client_max_body_size`。

**反向代理返回 `502`**

确认 Gunicorn 正在监听 `127.0.0.1:8443`，并检查 `docker compose logs -f mygit` 或 `journalctl -u mygit`。

**`/health` 正常但业务接口很慢**

`gunicorn.conf.py` 的 `timeout` 为 120 秒；大仓库上传或归档下载耗时较长时，同步调大反向代理的 `proxy_read_timeout`。

**如何更换令牌**

删除令牌文件后执行 `manage.py init` 重新生成（Docker 容器重启时会自动执行），再重启服务，所有客户端需同步更新令牌。若使用 `MYGIT_TOKEN` 环境变量，直接修改该变量并重启。
