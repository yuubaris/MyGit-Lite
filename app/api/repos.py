import os
import shutil

from flask import Blueprint, abort, jsonify, request

from ..db import get_db, transaction
from .common import now_iso, repo_dir, validate_slug

bp = Blueprint("repos", __name__)


@bp.get("/api/repos")
def list_repos():
    rows = get_db().execute(
        "SELECT r.slug, r.name, r.description, r.default_branch, r.created_at, b.head "
        "FROM repos r "
        "LEFT JOIN branches b ON b.repo_id = r.id AND b.name = r.default_branch "
        "ORDER BY r.slug"
    ).fetchall()
    repos = [
        {
            "slug": row["slug"],
            "name": row["name"],
            "description": row["description"],
            "default_branch": row["default_branch"],
            "head": row["head"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]
    return jsonify({"repos": repos})


@bp.post("/api/repos")
def create_repo():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        abort(400, "invalid JSON body")
    slug = validate_slug(data.get("slug"))
    name = data.get("name") or slug
    description = data.get("description") or ""
    if not isinstance(name, str) or not isinstance(description, str):
        abort(400, "invalid repository fields")

    created_at = now_iso()
    with transaction() as db:
        exists = db.execute("SELECT 1 FROM repos WHERE slug = ?", (slug,)).fetchone()
        if exists is not None:
            abort(409, "repository already exists")
        cursor = db.execute(
            "INSERT INTO repos (slug, name, description, default_branch, created_at) "
            "VALUES (?, ?, ?, 'main', ?)",
            (slug, name, description, created_at),
        )
        repo_id = cursor.lastrowid
        db.execute(
            "INSERT INTO branches (repo_id, name, head, updated_at) VALUES (?, 'main', NULL, ?)",
            (repo_id, created_at),
        )

    path = repo_dir(slug)
    os.makedirs(os.path.join(path, "objects"), mode=0o700, exist_ok=True)
    try:
        os.chmod(path, 0o700)
    except OSError:
        pass

    return jsonify(
        {
            "slug": slug,
            "name": name,
            "description": description,
            "default_branch": "main",
            "head": None,
            "created_at": created_at,
        }
    )


@bp.delete("/api/repos/<slug>")
def delete_repo(slug):
    row = get_db().execute("SELECT * FROM repos WHERE slug = ?", (slug,)).fetchone()
    if row is None:
        abort(404, "repository not found")
    with transaction() as db:
        db.execute("DELETE FROM repos WHERE id = ?", (row["id"],))
    shutil.rmtree(repo_dir(slug), ignore_errors=True)
    return jsonify({"deleted": True, "slug": slug})
