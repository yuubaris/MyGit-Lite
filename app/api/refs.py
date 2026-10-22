from flask import Blueprint, abort, jsonify, request

from ..db import get_db, transaction
from .common import (
    get_repo,
    now_iso,
    repo_dir,
    repo_has_commits,
    resolve_ref,
    validate_ref_name,
)

bp = Blueprint("refs", __name__)


@bp.get("/api/repos/<slug>/branches")
def list_branches(slug):
    repo = get_repo(slug)
    rows = get_db().execute(
        "SELECT name, head, updated_at FROM branches WHERE repo_id = ? ORDER BY name",
        (repo["id"],),
    ).fetchall()
    return jsonify(
        {
            "branches": [
                {
                    "name": row["name"],
                    "head": row["head"],
                    "updated_at": row["updated_at"],
                    "default": row["name"] == repo["default_branch"],
                }
                for row in rows
            ]
        }
    )


@bp.post("/api/repos/<slug>/branches")
def create_branch(slug):
    repo = get_repo(slug)
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        abort(400, "invalid JSON body")
    name = validate_ref_name(data.get("name"))
    if not repo_has_commits(repo["id"]):
        abort(400, "repository has no commits")

    source = data.get("from") or repo["default_branch"]
    if not isinstance(source, str):
        abort(400, "invalid from")
    repo_dir_path = repo_dir(slug)
    head = resolve_ref(repo["id"], repo_dir_path, repo["default_branch"], source)

    with transaction() as db:
        exists = db.execute(
            "SELECT 1 FROM branches WHERE repo_id = ? AND name = ?",
            (repo["id"], name),
        ).fetchone()
        if exists is not None:
            abort(409, "branch already exists")
        updated_at = now_iso()
        db.execute(
            "INSERT INTO branches (repo_id, name, head, updated_at) VALUES (?, ?, ?, ?)",
            (repo["id"], name, head, updated_at),
        )
    return jsonify({"name": name, "head": head, "updated_at": updated_at})


@bp.delete("/api/repos/<slug>/branches/<path:name>")
def delete_branch(slug, name):
    repo = get_repo(slug)
    validate_ref_name(name)
    if name == repo["default_branch"]:
        abort(409, "default branch cannot be deleted")
    with transaction() as db:
        cursor = db.execute(
            "DELETE FROM branches WHERE repo_id = ? AND name = ?",
            (repo["id"], name),
        )
        if cursor.rowcount == 0:
            abort(404, "branch not found")
    return jsonify({"deleted": True, "name": name})


@bp.get("/api/repos/<slug>/tags")
def list_tags(slug):
    repo = get_repo(slug)
    rows = get_db().execute(
        "SELECT name, commit_hash, message, created_at FROM tags WHERE repo_id = ? ORDER BY name",
        (repo["id"],),
    ).fetchall()
    return jsonify(
        {
            "tags": [
                {
                    "name": row["name"],
                    "commit": row["commit_hash"],
                    "message": row["message"],
                    "created_at": row["created_at"],
                }
                for row in rows
            ]
        }
    )


@bp.post("/api/repos/<slug>/tags")
def create_tag(slug):
    repo = get_repo(slug)
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        abort(400, "invalid JSON body")
    name = validate_ref_name(data.get("name"))
    if not repo_has_commits(repo["id"]):
        abort(400, "repository has no commits")
    message = data.get("message") or ""
    if not isinstance(message, str):
        abort(400, "invalid message")

    repo_dir_path = repo_dir(slug)
    commit_ref = data.get("commit")
    if commit_ref is not None and not isinstance(commit_ref, str):
        abort(400, "invalid commit")
    commit_hash = resolve_ref(
        repo["id"], repo_dir_path, repo["default_branch"], commit_ref
    )

    created_at = now_iso()
    with transaction() as db:
        exists = db.execute(
            "SELECT 1 FROM tags WHERE repo_id = ? AND name = ?",
            (repo["id"], name),
        ).fetchone()
        if exists is not None:
            abort(409, "tag already exists")
        db.execute(
            "INSERT INTO tags (repo_id, name, commit_hash, message, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (repo["id"], name, commit_hash, message, created_at),
        )
    return jsonify(
        {"name": name, "commit": commit_hash, "message": message, "created_at": created_at}
    )


@bp.delete("/api/repos/<slug>/tags/<path:name>")
def delete_tag(slug, name):
    repo = get_repo(slug)
    validate_ref_name(name)
    with transaction() as db:
        cursor = db.execute(
            "DELETE FROM tags WHERE repo_id = ? AND name = ?",
            (repo["id"], name),
        )
        if cursor.rowcount == 0:
            abort(404, "tag not found")
    return jsonify({"deleted": True, "name": name})
