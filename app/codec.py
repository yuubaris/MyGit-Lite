"""JSON 报文传输混淆（换表 Base64）。

只做混淆，不做加密：真正的保密由反向代理的 SSL 终结负责。

线格式（b64s1）：

- 编码：JSON 字节 -> 标准 Base64 -> 64 字符换表替换。
- 解码：换表还原 -> 标准 Base64 解码 -> JSON 字节。
- 换表由访问令牌确定性派生，客户端持有同一令牌即可解码。

只作用于 JSON 报文；文件上传、文件/归档下载等字节流保持原样。
"""

import base64
import hashlib
import io

from flask import abort, request as flask_request

HEADER = "X-MyGit-Codec"
CODEC_NAME = "b64s1"

_STD = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
_SEED_PREFIX = b"mygit-b64s1:"


class CodecError(ValueError):
    """输入不是合法的混淆文本。"""


class Codec:
    """换表 Base64 编解码器，换表从访问令牌派生。"""

    def __init__(self, token: str):
        seed = hashlib.sha256(_SEED_PREFIX + token.encode("utf-8")).digest()
        chars = sorted(
            _STD,
            key=lambda c: (hashlib.sha256(seed + c.encode("ascii")).digest(), c),
        )
        self.alphabet = "".join(chars)
        self._enc = bytes.maketrans(_STD.encode("ascii"), self.alphabet.encode("ascii"))
        self._dec = bytes.maketrans(self.alphabet.encode("ascii"), _STD.encode("ascii"))

    def encode(self, data: bytes) -> bytes:
        return base64.b64encode(data).translate(self._enc)

    def decode(self, data: bytes) -> bytes:
        try:
            return base64.b64decode(data.translate(self._dec), validate=True)
        except ValueError as exc:  # 含 binascii.Error
            raise CodecError("invalid obfuscated body") from exc


class CodecMiddleware:
    """在 Flask 解析前解码 JSON 请求体。"""

    def __init__(self, wsgi_app, codec: Codec):
        self.wsgi_app = wsgi_app
        self.codec = codec

    def __call__(self, environ, start_response):
        content_type = environ.get("CONTENT_TYPE", "").split(";", 1)[0].strip().lower()
        if environ.get("HTTP_X_MYGIT_CODEC") == CODEC_NAME and content_type == "application/json":
            try:
                length = int(environ.get("CONTENT_LENGTH") or 0)
            except ValueError:
                length = 0
            if length > 0:
                raw = environ["wsgi.input"].read(length)
            elif environ.get("wsgi.input_terminated"):
                raw = environ["wsgi.input"].read()
            else:
                raw = b""
            if raw:
                try:
                    decoded = self.codec.decode(raw)
                except CodecError:
                    environ["mygit.codec_error"] = True
                    decoded = b""
                environ["wsgi.input"] = io.BytesIO(decoded)
                environ["CONTENT_LENGTH"] = str(len(decoded))
        return self.wsgi_app(environ, start_response)


def init_app(app, codec: Codec):
    app.extensions["mygit_codec"] = codec
    app.wsgi_app = CodecMiddleware(app.wsgi_app, codec)

    @app.before_request
    def reject_bad_body():
        if flask_request.environ.get("mygit.codec_error"):
            abort(400, "invalid obfuscated body")

    @app.after_request
    def encode_response(response):
        if (
            flask_request.headers.get(HEADER) == CODEC_NAME
            and response.mimetype == "application/json"
        ):
            body = response.get_data()
            if body:
                response.set_data(codec.encode(body))
            response.headers[HEADER] = CODEC_NAME
        return response
