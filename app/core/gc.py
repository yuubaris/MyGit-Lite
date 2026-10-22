import json
import os
import time

from .objects import ObjectError, read_object


def collect_reachable(repo_dir: str, seed_commits) -> set[str]:
    reachable: set[str] = set()
    stack = list(seed_commits)
    while stack:
        oid = stack.pop()
        if not oid or oid in reachable:
            continue
        try:
            type_name, content = read_object(repo_dir, oid)
        except (ObjectError, OSError):
            continue
        reachable.add(oid)
        try:
            if type_name == "commit":
                data = json.loads(content.decode("utf-8"))
                stack.append(data.get("tree"))
                stack.append(data.get("parent"))
            elif type_name == "tree":
                data = json.loads(content.decode("utf-8"))
                for entry in data.get("entries", []):
                    stack.append(entry.get("hash"))
        except (ValueError, UnicodeDecodeError):
            continue
    return reachable


def gc_objects(
    repo_dir: str, reachable: set[str], grace_hours: float
) -> tuple[int, int]:
    objects_dir = os.path.join(repo_dir, "objects")
    if not os.path.isdir(objects_dir):
        return 0, 0
    cutoff = time.time() - grace_hours * 3600
    deleted = 0
    kept = 0
    for root, dirs, files in os.walk(objects_dir):
        for name in files:
            path = os.path.join(root, name)
            if name in reachable:
                kept += 1
                continue
            try:
                if os.path.getmtime(path) < cutoff:
                    os.unlink(path)
                    deleted += 1
            except OSError:
                continue
        for name in dirs:
            path = os.path.join(root, name)
            try:
                if not os.listdir(path):
                    os.rmdir(path)
            except OSError:
                pass
    return deleted, kept
