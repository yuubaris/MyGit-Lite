import os


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None or raw.strip() == "":
        return default
    return int(raw)


def load_config() -> dict:
    """Read configuration from environment variables with Linux defaults."""
    data_dir = os.environ.get("MYGIT_DATA_DIR", "/var/lib/mygit/data")
    return {
        "DATA_DIR": data_dir,
        "REPOS_DIR": os.path.join(data_dir, "repos"),
        "TEMP_DIR": os.path.join(data_dir, "tmp"),
        "DB_PATH": os.environ.get("MYGIT_DB", "/var/lib/mygit/mygit.db"),
        "TOKEN_FILE": os.environ.get("MYGIT_TOKEN_FILE", "/var/lib/mygit/token"),
        "TOKEN": os.environ.get("MYGIT_TOKEN") or None,
        "AUTHOR": os.environ.get("MYGIT_AUTHOR", "admin"),
        "MAX_UPLOAD_MB": _env_int("MYGIT_MAX_UPLOAD_MB", 200),
        "MAX_FILES": _env_int("MYGIT_MAX_FILES", 20000),
        "MAX_UNCOMPRESSED_MB": _env_int("MYGIT_MAX_UNCOMPRESSED_MB", 500),
        "GC_GRACE_H": _env_int("MYGIT_GC_GRACE_H", 24),
        "SCHEMA_PATH": os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "schema.sql",
        ),
    }
