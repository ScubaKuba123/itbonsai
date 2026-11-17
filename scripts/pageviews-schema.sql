CREATE TABLE IF NOT EXISTS studio_pageviews (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
  started_at TEXT NOT NULL
);
INSERT OR IGNORE INTO studio_pageviews (id, total, started_at)
VALUES (1, 0, strftime('%Y-%m-%dT%H:%M:%SZ','now'));
