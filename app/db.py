import os
import sqlite3
from contextlib import contextmanager

from flask import current_app, g


def connect(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path, timeout=5, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA busy_timeout=5000")
    conn.execute("PRAGMA synchronous=FULL")
    return conn


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = connect(current_app.config["DB_PATH"])
    return g.db


def close_db(exc=None):
    conn = g.pop("db", None)
    if conn is not None:
        conn.close()


def init_app(app):
    app.teardown_appcontext(close_db)


def init_db(db_path: str, schema_path: str):
    """Create the database file and apply schema.sql. Safe to run repeatedly."""
    parent = os.path.dirname(os.path.abspath(db_path))
    os.makedirs(parent, mode=0o700, exist_ok=True)
    conn = sqlite3.connect(db_path, isolation_level=None)
    try:
        with open(schema_path, encoding="utf-8") as f:
            conn.executescript(f.read())
    finally:
        conn.close()
    try:
        os.chmod(db_path, 0o600)
    except OSError:
        pass


@contextmanager
def transaction():
    db = get_db()
    db.execute("BEGIN IMMEDIATE")
    try:
        yield db
    except BaseException:
        db.execute("ROLLBACK")
        raise
    else:
        db.execute("COMMIT")
