-- Database structure. One section per table.
-- Every record has an integer id that SQLite assigns automatically.

-- ===== TOPICS (Glossary) =====
CREATE TABLE IF NOT EXISTS topics (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  slug     TEXT UNIQUE,
  title    TEXT NOT NULL,
  category TEXT NOT NULL,
  summary  TEXT NOT NULL
);

-- Each paragraph of a topic's full text
CREATE TABLE IF NOT EXISTS topic_paragraphs (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  body     TEXT NOT NULL
);

-- Each source cited by a topic
CREATE TABLE IF NOT EXISTS topic_sources (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  source   TEXT NOT NULL
);

-- ===== COMMENTS (on topics) =====
CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id   INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  author     TEXT NOT NULL DEFAULT 'Anonymous',
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===== RESOURCES =====
CREATE TABLE IF NOT EXISTS resources (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  url         TEXT NOT NULL
);

-- ===== CENTERS (map) =====
CREATE TABLE IF NOT EXISTS centers (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT NOT NULL,
  address TEXT NOT NULL,
  city    TEXT NOT NULL,
  state   TEXT NOT NULL,
  zip     TEXT NOT NULL DEFAULT '',
  lat     REAL NOT NULL,
  lng     REAL NOT NULL,
  phone   TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  notes   TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS center_services (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  center_id INTEGER NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  service   TEXT NOT NULL
);

-- ===== SETTINGS (small app values, grouped by section) =====
CREATE TABLE IF NOT EXISTS settings (
  section       TEXT NOT NULL,
  setting_key   TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  PRIMARY KEY (section, setting_key)
);

-- ===== INDEXES =====
-- SQLite does not index foreign key columns on its own. These let it jump straight
-- to a topic's paragraphs, sources and comments (and a center's services) instead of
-- scanning the whole table, which also speeds up ON DELETE CASCADE.
CREATE INDEX IF NOT EXISTS idx_topic_paragraphs_topic ON topic_paragraphs (topic_id, position);
CREATE INDEX IF NOT EXISTS idx_topic_sources_topic    ON topic_sources (topic_id, position);
CREATE INDEX IF NOT EXISTS idx_comments_topic         ON comments (topic_id);
CREATE INDEX IF NOT EXISTS idx_center_services_center ON center_services (center_id);