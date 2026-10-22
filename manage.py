import argparse
import os
import secrets
import sqlite3
import sys

from app.config import load_config
from app.core.gc import collect_reachable, gc_objects
from app.db import init_db


def _ensure_dir(path: str):
    os.makedirs(path, mode=0o700, exist_ok=True)
    try:
        os.chmod(path, 0o700)
    except OSError:
        pass


def cmd_init(args):
    config = load_config()
    for path in (
        config["DATA_DIR"],
        config["REPOS_DIR"],
        config["TEMP_DIR"],
        os.path.dirname(os.path.abspath(config["DB_PATH"])),
        os.path.dirname(os.path.abspath(config["TOKEN_FILE"])),
    ):
        _ensure_dir(path)

    init_db(config["DB_PATH"], config["SCHEMA_PATH"])
    print(f"database: {config['DB_PATH']}")

    token_path = config["TOKEN_FILE"]
    if not os.path.exists(token_path):
        token = secrets.token_urlsafe(32) + "\n"
        fd = os.open(token_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        try:
            os.write(fd, token.encode("utf-8"))
            os.fsync(fd)
        finally:
            os.close(fd)
        print(f"token created: {token_path}")
    else:
        print(f"token kept: {token_path}")

    print(f"data: {config['DATA_DIR']}")


def cmd_gc(args):
    config = load_config()
    if not os.path.exists(config["DB_PATH"]):
        print(f"database not found: {config['DB_PATH']}", file=sys.stderr)
        raise SystemExit(1)
    grace = args.grace_hours if args.grace_hours is not None else config["GC_GRACE_H"]

    conn = sqlite3.connect(config["DB_PATH"], isolation_level=None)
    conn.row_factory = sqlite3.Row
    try:
        repos = conn.execute("SELECT id, slug FROM repos ORDER BY slug").fetchall()
        for repo in repos:
            repo_dir = os.path.join(config["REPOS_DIR"], repo["slug"])
            if not os.path.isdir(repo_dir):
                continue
            seeds = [
                row["head"]
                for row in conn.execute(
                    "SELECT head FROM branches WHERE repo_id = ? AND head IS NOT NULL",
                    (repo["id"],),
                )
            ]
            seeds += [
                row["commit_hash"]
                for row in conn.execute(
                    "SELECT commit_hash FROM tags WHERE repo_id = ?", (repo["id"],)
                )
            ]
            reachable = collect_reachable(repo_dir, seeds)
            deleted, kept = gc_objects(repo_dir, reachable, grace)

            orphan_rows = 0
            for row in conn.execute(
                "SELECT hash FROM commits WHERE repo_id = ?", (repo["id"],)
            ).fetchall():
                if row["hash"] not in reachable:
                    conn.execute(
                        "DELETE FROM commits WHERE repo_id = ? AND hash = ?",
                        (repo["id"], row["hash"]),
                    )
                    orphan_rows += 1
            print(
                f"{repo['slug']}: deleted={deleted} kept={kept} "
                f"orphan_commits={orphan_rows}"
            )
    finally:
        conn.close()


def build_parser():
    parser = argparse.ArgumentParser(prog="manage.py", description="MyGit Lite maintenance")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("init", help="initialize directories, database and token").set_defaults(func=cmd_init)

    gc = sub.add_parser("gc", help="delete unreachable objects and commit rows")
    gc.add_argument("--grace-hours", type=float, default=None)
    gc.set_defaults(func=cmd_gc)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
