import difflib

from .objects import read_object
from .tree import flatten_tree

BINARY_PROBE = 8192
MAX_DIFF_BYTES = 2 * 1024 * 1024
MAX_DIFF_LINES = 5000


def _is_binary(data: bytes) -> bool:
    return b"\x00" in data[:BINARY_PROBE]


def _read_blob(repo_dir: str, oid: str) -> bytes:
    type_name, content = read_object(repo_dir, oid)
    if type_name != "blob":
        raise ValueError(f"not a blob: {oid}")
    return content


def _text_diff(path: str, old: bytes, new: bytes):
    old_lines = old.decode("utf-8", errors="replace").splitlines()
    new_lines = new.decode("utf-8", errors="replace").splitlines()
    lines = list(
        difflib.unified_diff(
            old_lines,
            new_lines,
            fromfile=f"a/{path}",
            tofile=f"b/{path}",
            lineterm="",
        )
    )
    truncated = False
    if len(lines) > MAX_DIFF_LINES:
        lines = lines[:MAX_DIFF_LINES]
        truncated = True
    text = "\n".join(lines)
    encoded = text.encode("utf-8")
    if len(encoded) > MAX_DIFF_BYTES:
        text = encoded[:MAX_DIFF_BYTES].decode("utf-8", errors="ignore")
        truncated = True
    return text, truncated


def diff_trees(repo_dir: str, base_tree: str | None, head_tree: str | None) -> dict:
    old = flatten_tree(repo_dir, base_tree) if base_tree else {}
    new = flatten_tree(repo_dir, head_tree) if head_tree else {}

    files = []
    any_truncated = False
    for path in sorted(set(old) | set(new), key=lambda p: p.encode("utf-8")):
        old_entry = old.get(path)
        new_entry = new.get(path)
        if old_entry and new_entry and old_entry[1] == new_entry[1]:
            continue
        if old_entry is None:
            status = "added"
            old_data = b""
            new_data = _read_blob(repo_dir, new_entry[1])
        elif new_entry is None:
            status = "deleted"
            old_data = _read_blob(repo_dir, old_entry[1])
            new_data = b""
        else:
            status = "modified"
            old_data = _read_blob(repo_dir, old_entry[1])
            new_data = _read_blob(repo_dir, new_entry[1])

        item = {"path": path, "status": status}
        if _is_binary(old_data) or _is_binary(new_data):
            item["binary"] = True
        else:
            text, truncated = _text_diff(path, old_data, new_data)
            item["diff"] = text
            if truncated:
                item["truncated"] = True
                any_truncated = True
        files.append(item)

    return {"files": files, "truncated": any_truncated}
