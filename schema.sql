PRAGMA user_version = 1;

CREATE TABLE IF NOT EXISTS repos (
    id             INTEGER PRIMARY KEY,
    slug           TEXT NOT NULL UNIQUE,
    name           TEXT NOT NULL,
    description    TEXT NOT NULL DEFAULT '',
    default_branch TEXT NOT NULL DEFAULT 'main',
    created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS branches (
    repo_id    INTEGER NOT NULL,
    name       TEXT NOT NULL,
    head       TEXT,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (repo_id, name),
    FOREIGN KEY (repo_id) REFERENCES repos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS commits (
    id         INTEGER PRIMARY KEY,
    repo_id    INTEGER NOT NULL,
    hash       TEXT NOT NULL,
    tree       TEXT NOT NULL,
    parent     TEXT,
    message    TEXT NOT NULL,
    author     TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE (repo_id, hash),
    FOREIGN KEY (repo_id) REFERENCES repos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
    repo_id     INTEGER NOT NULL,
    name        TEXT NOT NULL,
    commit_hash TEXT NOT NULL,
    message     TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL,
    PRIMARY KEY (repo_id, name),
    FOREIGN KEY (repo_id) REFERENCES repos(id) ON DELETE CASCADE
);
