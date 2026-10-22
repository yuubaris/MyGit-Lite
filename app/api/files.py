import io
import os
import posixpath
import tempfile
import time
import zipfile

from flask import Blueprint, abort, current_app, jsonify, request, send_file

from ..core.objects import read_object, read_object_header
from ..core.tree import flatten_tree, tree_entries
from .common import (
    check_path,
    find_entry,
    get_commit,
    get_repo,
    repo_dir,
    resolve_ref,
)

bp = Blueprint("files", __name__)


def _resolve_tree(slug: str):
    repo = get_repo(slug)
    repo_dir_path = repo_dir(slug)
    ref = request.args.get("ref")
    head = resolve_ref(repo["id"], repo_dir_path, repo["default_branch"], ref)
    commit = get_commit(repo_dir_path, head)
    return repo, repo_dir_path, ref or repo["default_branch"], commit["tree"]


@bp.get("/api/repos/<slug>/tree")
def list_directory(slug):
    path = check_path(request.args.get("path", ""))
    repo, repo_dir_path, ref, root_tree = _resolve_tree(slug)
    tree_hash = root_tree
    if path:
        entry = find_entry(repo_dir_path, root_tree, path)
        if entry is None:
            abort(404, "path not found")
        if entry["type"] != "tree":
            abort(400, "path is not a directory")
        tree_hash = entry["hash"]

    entries = []
    for entry in tree_entries(repo_dir_path, tree_hash):
        item = {
            "name": entry["name"],
            "type": "file" if entry["type"] == "blob" else "dir",
            "mode": entry["mode"],
            "hash": entry["hash"],
        }
        if entry["type"] == "blob":
            _, size = read_object_header(repo_dir_path, entry["hash"])
            item["size"] = size
        entries.append(item)
    return jsonify({"ref": ref, "path": path, "entries": entries})


@bp.get("/api/repos/<slug>/file")
def download_file(slug):
    path = check_path(request.args.get("path"), allow_empty=False)
    repo, repo_dir_path, _, root_tree = _resolve_tree(slug)
    entry = find_entry(repo_dir_path, root_tree, path)
    if entry is None:
        abort(404, "file not found")
    if entry["type"] != "blob":
        abort(400, "path is not a file")
    type_name, content = read_object(repo_dir_path, entry["hash"])
    if type_name != "blob":
        abort(404, "file not found")
    return send_file(
        io.BytesIO(content),
        mimetype="application/octet-stream",
        as_attachment=True,
        download_name=posixpath.basename(path),
    )


@bp.get("/api/repos/<slug>/archive")
def download_archive(slug):
    path = check_path(request.args.get("path", ""))
    repo, repo_dir_path, ref, root_tree = _resolve_tree(slug)
    tree_hash = root_tree
    if path:
        entry = find_entry(repo_dir_path, root_tree, path)
        if entry is None:
            abort(404, "path not found")
        if entry["type"] != "tree":
            abort(400, "path is not a directory")
        tree_hash = entry["hash"]

    flat = flatten_tree(repo_dir_path, tree_hash)
    fd, archive_path = tempfile.mkstemp(
        dir=current_app.config["TEMP_DIR"], suffix=".zip"
    )
    os.close(fd)
    try:
        with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
            for relative, (mode, oid) in flat.items():
                _, content = read_object(repo_dir_path, oid)
                info = zipfile.ZipInfo(relative, date_time=time.localtime()[:6])
                info.external_attr = (
                    0o100755 if mode == "100755" else 0o100644
                ) << 16
                info.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(info, content)
    except BaseException:
        try:
            os.unlink(archive_path)
        except OSError:
            pass
        raise

    safe_ref = str(ref).replace("/", "-")
    response = send_file(
        archive_path,
        mimetype="application/zip",
        as_attachment=True,
        download_name=f"{slug}-{safe_ref}.zip",
    )

    def _cleanup():
        try:
            os.unlink(archive_path)
        except OSError:
            pass

    response.call_on_close(_cleanup)
    return response
