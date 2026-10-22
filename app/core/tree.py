import json

from .objects import canonical_json, read_object, write_object


def tree_entries(repo_dir: str, tree_hash: str) -> list[dict]:
    type_name, content = read_object(repo_dir, tree_hash)
    if type_name != "tree":
        raise ValueError(f"not a tree: {tree_hash}")
    return json.loads(content.decode("utf-8"))["entries"]


def build_tree(repo_dir: str, file_map: dict[str, tuple[str, str]]) -> str:
    """Build nested tree objects from {path: (mode, blob_hash)} and return root hash."""
    root: dict = {}
    for path, value in file_map.items():
        parts = path.split("/")
        node = root
        for part in parts[:-1]:
            child = node.get(part)
            if child is None:
                child = {}
                node[part] = child
            node = child
        node[parts[-1]] = value

    def write_dir(node: dict) -> str:
        entries = []
        for name, value in node.items():
            if isinstance(value, tuple):
                mode, oid = value
                entries.append(
                    {"name": name, "type": "blob", "mode": mode, "hash": oid}
                )
            else:
                entries.append(
                    {
                        "name": name,
                        "type": "tree",
                        "mode": "040000",
                        "hash": write_dir(value),
                    }
                )
        entries.sort(key=lambda e: e["name"].encode("utf-8"))
        return write_object(repo_dir, "tree", canonical_json({"entries": entries}))

    return write_dir(root)


def flatten_tree(
    repo_dir: str, tree_hash: str, prefix: str = ""
) -> dict[str, tuple[str, str]]:
    out: dict[str, tuple[str, str]] = {}
    for entry in tree_entries(repo_dir, tree_hash):
        path = f"{prefix}{entry['name']}"
        if entry["type"] == "tree":
            out.update(flatten_tree(repo_dir, entry["hash"], f"{path}/"))
        else:
            out[path] = (entry["mode"], entry["hash"])
    return out
