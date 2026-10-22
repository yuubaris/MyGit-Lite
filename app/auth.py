import hmac

from flask import current_app, jsonify, request


def check_request():
    if request.path == "/health":
        return None
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return jsonify({"error": "missing or invalid authorization"}), 401
    provided = header[len("Bearer "):]
    expected = current_app.config["TOKEN"]
    if not hmac.compare_digest(provided.encode("utf-8"), expected.encode("utf-8")):
        return jsonify({"error": "invalid token"}), 401
    return None


def init_app(app):
    app.before_request(check_request)
