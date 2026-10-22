import json
import os
import re
from datetime import datetime, timezone

from flask import abort, current_app

from ..core.objects import (
    ObjectError,
    ObjectNotFound,
    read_commit,
    read_object_header,
    write_commit,
)
from ..core.paths import PathError, validate_repo_path
from ..core.tree import tree_entries
from ..db import get_db

SLUG_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$")
FULL_HASH_RE = re.compile(r"^[0-9a-f]{64}$")
SHORT_HASH_RE = re.compile(r"^[0-9a-f]{7,63}$")
FORBIDDEN_REF_CHARS = set(" ~^:?*[\\")


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def repo_dir(slug: str) -> str:
    return os.path.join(current_app.config["REPOS_DIR"], slug)


def validate_slug(slug: str) -> str:
    if not isinstance(slug, str) or not 1 <= len(slug) <= 64 or not SLUG_RE.match(slug):
        abort(400, "invalid repository slug")
    return slug


def validate_ref_name(name: str) -> str:
    if not isinstance(name, str) or not 1 <= len(name) <= 128:
        abort(400, "invalid ref name")
    if name.startswith("/") or name.endswith("/") or "//" in name:
        abort(400, "invalid ref name")
    if ".." in name or any(ch in FORBIDDEN_REF_CHARS for ch in name):
        abort(400, "invalid ref name")
    if any(ord(ch) < 32 for ch in name):
        abort(400, "invalid ref name")
    return name


def check_path(path: str | None, allow_empty: bool = True) -> str:
    try:
        return validate_repo_path(path, allow_empty=allow_empty)
    except PathError as exc:
        abort(400, str(exc))


def get_repo(slug: str):
    row = get_db().execute("SELECT * FROM repos WHERE slug = ?", (slug,)).fetchone()
    if row is None:
        abort(404, "repository not found")
    return row


def get_branch(repo_id: int, name: str):
    row = get_db().execute(
        "SELECT * FROM branches WHERE repo_id = ? AND name = ?", (repo_id, name)
    ).fetchone()
    if row is None:
        abort(404, "branch not found")
    return row


def get_commit(repo_dir_path: str, oid: str) -> dict:
    try:
        data = read_commit(repo_dir_path, oid)
    except (ObjectError, OSError, json.JSONDecodeError, UnicodeDecodeError):
        abort(404, "commit not found")
    data["hash"] = oid
    return data


def _prefix_matches(repo_dir_path: str, prefix: str) -> list[str]:
    directory = os.path.join(repo_dir_path, "objects", prefix[:2])
    if not os.path.isdir(directory):
        return []
    matches = []
    for name in os.listdir(directory):
        if not name.startswith(prefix) or len(name) != 64:
            continue
        try:
            type_name, _ = read_object_header(repo_dir_path, name)
        except (ObjectError, OSError):
            continue
        if type_name == "commit":
            matches.append(name)
    return matches


def resolve_ref(repo_id: int, repo_dir_path: str, default_branch: str, ref: str | None) -> str:
    """Resolve branch -> tag -> full hash -> unique short prefix (>= 7 chars)."""
    if not ref:
        ref = default_branch

    row = get_db().execute(
        "SELECT head FROM branches WHERE repo_id = ? AND name = ?", (repo_id, ref)
    ).fetchone()
    if row is not None:
        if row["head"] is None:
            abort(404, "branch is empty")
        return row["head"]

    row = get_db().execute(
        "SELECT commit_hash FROM tags WHERE repo_id = ? AND name = ?", (repo_id, ref)
    ).fetchone()
    if row is not None:
        return row["commit_hash"]

    if FULL_HASH_RE.match(ref):
        try:
            type_name, _ = read_object_header(repo_dir_path, ref)
        except ObjectNotFound:
            abort(404, "commit not found")
        except ObjectError:
            abort(404, "commit not found")
        if type_name != "commit":
            abort(404, "commit not found")
        return ref

    if SHORT_HASH_RE.match(ref):
        matches = _prefix_matches(repo_dir_path, ref)
        if len(matches) == 1:
            return matches[0]
        if len(matches) > 1:
            abort(400, "ambiguous commit prefix")
        abort(404, "commit not found")

    abort(404, "ref not found")


def find_entry(repo_dir_path: str, root_tree: str, path: str):
    if path == "":
        return None
    current = root_tree
    parts = path.split("/")
    for index, part in enumerate(parts):
        entry = next(
            (e for e in tree_entries(repo_dir_path, current) if e["name"] == part),
            None,
        )
        if entry is None:
            return None
        if index < len(parts) - 1:
            if entry["type"] != "tree":
                return None
            current = entry["hash"]
        else:
            return entry
    return None


def create_commit_row(
    repo_id: int,
    repo_dir_path: str,
    tree: str,
    parent: str | None,
    message: str,
    author: str,
) -> dict:
    created_at = now_iso()
    oid = write_commit(repo_dir_path, tree, parent, message, author, created_at)
    get_db().execute(
        "INSERT INTO commits (repo_id, hash, tree, parent, message, author, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?) "
        "ON CONFLICT (repo_id, hash) DO NOTHING",
        (repo_id, oid, tree, parent, message, author, created_at),
    )
    return {
        "hash": oid,
        "tree": tree,
        "parent": parent,
        "message": message,
        "author": author,
        "created_at": created_at,
    }


def repo_has_commits(repo_id: int) -> bool:
    row = get_db().execute(
        "SELECT 1 FROM branches WHERE repo_id = ? AND head IS NOT NULL LIMIT 1",
        (repo_id,),
    ).fetchone()
    return row is not None
