import os
import tempfile

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

from . import auth, codec, db
from .config import load_config


def create_app(overrides: dict | None = None) -> Flask:
    app = Flask(__name__)

    config = load_config()
    if overrides:
        config.update(overrides)

    token = config.get("TOKEN")
    if not token:
        try:
            with open(config["TOKEN_FILE"], encoding="utf-8") as f:
                token = f.read().strip()
        except FileNotFoundError as exc:
            raise RuntimeError(
                "access token not initialized; run `python manage.py init` first"
            ) from exc
    if not token:
        raise RuntimeError("access token is empty")
    config["TOKEN"] = token

    app.config.update(config)
    app.config["MAX_CONTENT_LENGTH"] = config["MAX_UPLOAD_MB"] * 1024 * 1024

    os.makedirs(app.config["TEMP_DIR"], mode=0o700, exist_ok=True)
    tempfile.tempdir = app.config["TEMP_DIR"]

    db.init_app(app)
    auth.init_app(app)
    codec.init_app(app, codec.Codec(token))

    from .api import commits, files, refs, repos

    app.register_blueprint(repos.bp)
    app.register_blueprint(commits.bp)
    app.register_blueprint(files.bp)
    app.register_blueprint(refs.bp)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        return jsonify({"error": error.description}), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        if isinstance(error, HTTPException):
            return jsonify({"error": error.description}), error.code
        app.logger.exception("unhandled error")
        return jsonify({"error": "internal server error"}), 500

    return app
