import json
import os
import shutil
import tempfile

from flask import Blueprint, abort, current_app, jsonify, request

from ..core.diff import diff_trees
from ..core.ignore import IgnoreMatcher
from ..core.objects import read_object, write_blob_from_path
from ..core.tree import build_tree, flatten_tree
from ..core.upload import UploadError, extract_zip
from ..db import transaction
from .common import (
    check_path,
    create_commit_row,
    get_branch,
    get_commit,
    get_repo,
    now_iso,
    repo_dir,
    resolve_ref,
)

bp = Blueprint("commits", __name__)


def _int_arg(name: str, default: int, minimum: int, maximum: int) -> int:
    raw = request.args.get(name)
    if raw is None or raw == "":
        return default
    try:
        value = int(raw)
    except ValueError:
        abort(400, f"invalid {name}")
    return max(minimum, min(maximum, value))


def _base_ignore_files(repo_dir_path: str, base_map: dict, deletions: list[str]):
    out = {}
    for path, (_, oid) in base_map.items():
        if path != ".gitignore" and not path.endswith("/.gitignore"):
            continue
        if any(path == d or path.startswith(d + "/") for d in deletions):
            continue
        type_name, content = read_object(repo_dir_path, oid)
        if type_name != "blob":
            continue
        directory = path.rsplit("/", 1)[0] if "/" in path else ""
        out[directory] = content
    return out


def _uploaded_ignore_files(uploaded: dict) -> dict:
    out = {}
    for path, item in uploaded.items():
        if path != ".gitignore" and not path.endswith("/.gitignore"):
            continue
        with open(item.temp_path, "rb") as f:
            directory = path.rsplit("/", 1)[0] if "/" in path else ""
            out[directory] = f.read()
    return out


def _is_deleted(path: str, deletions: list[str]) -> bool:
    return any(path == d or path.startswith(d + "/") for d in deletions)


def _check_map_conflicts(file_map: dict) -> None:
    paths = set(file_map)
    for path in paths:
        parts = path.split("/")
        for index in range(1, len(parts)):
            if "/".join(parts[:index]) in paths:
                abort(400, "file and directory path conflict")


@bp.post("/api/repos/<slug>/commits")
def create_commit(slug):
    repo = get_repo(slug)
    repo_dir_path = repo_dir(slug)

    mode = request.form.get("mode") or "snapshot"
    if mode not in ("snapshot", "patch"):
        abort(400, "invalid mode")

    branch_name = request.form.get("branch") or repo["default_branch"]
    branch = get_branch(repo["id"], branch_name)
    parent = branch["head"]

    message = (request.form.get("message") or "").strip()
    if not message:
        abort(400, "message is required")

    raw_deletions = request.form.get("deletions")
    deletions: list[str] = []
    if raw_deletions:
        try:
            parsed = json.loads(raw_deletions)
        except json.JSONDecodeError:
            abort(400, "invalid deletions")
        if not isinstance(parsed, list) or not all(isinstance(p, str) for p in parsed):
            abort(400, "invalid deletions")
        deletions = [check_path(p, allow_empty=False) for p in parsed]
    if mode == "snapshot":
        deletions = []

    file = request.files.get("file")
    if mode == "snapshot" and (file is None or not file.filename):
        abort(400, "file is required for snapshot mode")

    temp_dir = tempfile.mkdtemp(dir=current_app.config["TEMP_DIR"], prefix="upload-")
    try:
        uploaded = {}
        if file is not None and file.filename:
            try:
                uploaded = extract_zip(
                    file.stream,
                    os.path.join(temp_dir, "files"),
                    current_app.config["MAX_FILES"],
                    current_app.config["MAX_UNCOMPRESSED_MB"] * 1024 * 1024,
                )
            except UploadError as exc:
                abort(400, str(exc))

        base_map: dict[str, tuple[str, str]] = {}
        if parent:
            parent_commit = get_commit(repo_dir_path, parent)
            base_map = flatten_tree(repo_dir_path, parent_commit["tree"])

        uploaded_ignore = _uploaded_ignore_files(uploaded)
        if mode == "snapshot":
            ignore_files = uploaded_ignore
        else:
            ignore_files = _base_ignore_files(repo_dir_path, base_map, deletions)
            ignore_files.update(uploaded_ignore)
        matcher = IgnoreMatcher(ignore_files)

        ignored: list[str] = []
        new_map: dict[str, tuple[str, str]] = {}

        if mode == "patch":
            new_map = dict(base_map)
            for path in list(new_map):
                if _is_deleted(path, deletions):
                    del new_map[path]

        for path, item in uploaded.items():
            tracked = path in base_map
            if not tracked and matcher.is_ignored(path):
                ignored.append(path)
                continue
            new_map[path] = (
                item.mode,
                write_blob_from_path(repo_dir_path, item.temp_path),
            )

        if mode == "snapshot":
            for path, entry in base_map.items():
                if path in uploaded:
                    continue
                if matcher.is_ignored(path):
                    new_map[path] = entry

        _check_map_conflicts(new_map)
        tree = build_tree(repo_dir_path, new_map)
        author = current_app.config["AUTHOR"]
        with transaction() as db:
            commit = create_commit_row(
                repo["id"], repo_dir_path, tree, parent, message, author
            )
            db.execute(
                "UPDATE branches SET head = ?, updated_at = ? WHERE repo_id = ? AND name = ?",
                (commit["hash"], commit["created_at"], repo["id"], branch_name),
            )

        return jsonify(
            {
                "commit": commit["hash"],
                "branch": branch_name,
                "parent": parent,
                "files": len(new_map),
                "ignored": sorted(ignored)[:100],
            }
        )
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


@bp.get("/api/repos/<slug>/commits")
def list_commits(slug):
    repo = get_repo(slug)
    repo_dir_path = repo_dir(slug)
    ref = request.args.get("ref")
    limit = _int_arg("limit", 50, 1, 200)
    offset = _int_arg("offset", 0, 0, 10**9)
    head = resolve_ref(repo["id"], repo_dir_path, repo["default_branch"], ref)

    commits = []
    seen = set()
    current = head
    skipped = 0
    while current and len(commits) < limit:
        if current in seen:
            break
        seen.add(current)
        info = get_commit(repo_dir_path, current)
        if skipped < offset:
            skipped += 1
        else:
            commits.append(
                {
                    "hash": current,
                    "tree": info.get("tree"),
                    "parent": info.get("parent"),
                    "message": info.get("message", ""),
                    "author": info.get("author", ""),
                    "created_at": info.get("created_at", ""),
                }
            )
        current = info.get("parent")
    return jsonify({"commits": commits})


@bp.get("/api/repos/<slug>/diff")
def diff(slug):
    repo = get_repo(slug)
    repo_dir_path = repo_dir(slug)
    head_ref = request.args.get("head")
    head_hash = resolve_ref(repo["id"], repo_dir_path, repo["default_branch"], head_ref)
    head_commit = get_commit(repo_dir_path, head_hash)

    base_ref = request.args.get("base")
    if base_ref:
        base_hash = resolve_ref(repo["id"], repo_dir_path, repo["default_branch"], base_ref)
        base_commit = get_commit(repo_dir_path, base_hash)
        base_tree = base_commit["tree"]
    else:
        base_hash = head_commit.get("parent")
        base_tree = get_commit(repo_dir_path, base_hash)["tree"] if base_hash else None

    result = diff_trees(repo_dir_path, base_tree, head_commit["tree"])
    return jsonify(
        {
            "base": base_hash,
            "head": head_hash,
            "files": result["files"],
            "truncated": result["truncated"],
        }
    )


@bp.post("/api/repos/<slug>/reset")
def reset(slug):
    repo = get_repo(slug)
    repo_dir_path = repo_dir(slug)
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        abort(400, "invalid JSON body")

    branch_name = data.get("branch") or repo["default_branch"]
    branch = get_branch(repo["id"], branch_name)

    target_ref = data.get("commit")
    if not isinstance(target_ref, str) or not target_ref:
        abort(400, "commit is required")
    target_hash = resolve_ref(repo["id"], repo_dir_path, repo["default_branch"], target_ref)
    target_commit = get_commit(repo_dir_path, target_hash)

    mode = data.get("mode") or "restore"
    if mode not in ("restore", "force"):
        abort(400, "invalid mode")

    author = current_app.config["AUTHOR"]
    if mode == "force":
        head = target_hash
        updated_at = now_iso()
        with transaction() as db:
            db.execute(
                "UPDATE branches SET head = ?, updated_at = ? WHERE repo_id = ? AND name = ?",
                (head, updated_at, repo["id"], branch_name),
            )
    else:
        with transaction() as db:
            commit = create_commit_row(
                repo["id"],
                repo_dir_path,
                target_commit["tree"],
                branch["head"],
                f"reset to {target_hash[:12]}",
                author,
            )
            head = commit["hash"]
            db.execute(
                "UPDATE branches SET head = ?, updated_at = ? WHERE repo_id = ? AND name = ?",
                (head, commit["created_at"], repo["id"], branch_name),
            )

    return jsonify(
        {
            "branch": branch_name,
            "mode": mode,
            "commit": target_hash,
            "head": head,
        }
    )
