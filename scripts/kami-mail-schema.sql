CREATE TABLE IF NOT EXISTS kami_mail (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','sent','failed','unknown')),
  provider_id TEXT
);
CREATE INDEX IF NOT EXISTS kami_mail_ip_time ON kami_mail(ip_hash,created_at);
CREATE INDEX IF NOT EXISTS kami_mail_time ON kami_mail(created_at);
