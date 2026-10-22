import re

MAX_PATH_LENGTH = 1024


class PathError(ValueError):
    pass


def validate_repo_path(path: str | None, allow_empty: bool = True) -> str:
    if path is None:
        path = ""
    if not isinstance(path, str):
        raise PathError("path must be a string")
    if path == "":
        if allow_empty:
            return ""
        raise PathError("path is required")
    if len(path) > MAX_PATH_LENGTH:
        raise PathError("path is too long")
    if "\x00" in path:
        raise PathError("path contains NUL")
    if "\\" in path:
        raise PathError("backslash is not allowed")
    if path.startswith("/"):
        raise PathError("absolute path is not allowed")
    if re.match(r"^[A-Za-z]:", path):
        raise PathError("drive letter is not allowed")
    parts = path.split("/")
    if any(part in ("", ".", "..") for part in parts):
        raise PathError("path contains an invalid segment")
    return path
