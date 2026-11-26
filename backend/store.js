// All database reads and writes live here. server.js only handles HTTP.
const db = require('./db');

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function tx(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// ---------- validation helpers ----------
const isText = (v) => typeof v === 'string' && v.trim() !== '';
const text = (v) => (typeof v === 'string' ? v.trim() : '');
const list = (v) => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : []);

function need(data, fields) {
  for (const f of fields) {
    if (!isText(data?.[f])) throw new ApiError(400, `"${f}" is required`);
  }
}

function needNumber(data, field, min, max) {
  const n = Number(data?.[field]);
  if (data?.[field] === '' || data?.[field] == null || !Number.isFinite(n) || n < min || n > max) {
    throw new ApiError(400, `"${field}" must be a number between ${min} and ${max}`);
  }
  return n;
}

// ==================== TOPICS ====================
function loadTopic(row) {
  const body = db.prepare('SELECT body FROM topic_paragraphs WHERE topic_id = ? ORDER BY position').all(row.id).map((r) => r.body);
  const sources = db.prepare('SELECT source FROM topic_sources WHERE topic_id = ? ORDER BY position').all(row.id).map((r) => r.source);
  return { ...row, body, sources };
}

function listTopics({ category, q } = {}) {
  const where = [];
  const params = [];
  if (category) { where.push('category = ? COLLATE NOCASE'); params.push(category); }
  if (q) { where.push('(title LIKE ? OR summary LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
  const sql = `SELECT id, slug, title, category, summary FROM topics ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id`;
  return db.prepare(sql).all(...params).map(loadTopic);
}

function getTopic(id) {
  const row = db.prepare('SELECT id, slug, title, category, summary FROM topics WHERE id = ?').get(id);
  if (!row) throw new ApiError(404, 'Topic not found');
  return loadTopic(row);
}

function writeTopicChildren(topicId, data) {
  list(data.body).forEach((p, i) => db.prepare('INSERT INTO topic_paragraphs (topic_id, position, body) VALUES (?, ?, ?)').run(topicId, i, p));
  list(data.sources).forEach((s, i) => db.prepare('INSERT INTO topic_sources (topic_id, position, source) VALUES (?, ?, ?)').run(topicId, i, s));
}

function createTopic(data) {
  need(data, ['title', 'category', 'summary']);
  const id = tx(() => {
    const info = db.prepare('INSERT INTO topics (slug, title, category, summary) VALUES (?, ?, ?, ?)').run(
      isText(data.slug) ? data.slug.trim() : null, text(data.title), text(data.category), text(data.summary));
    const newId = Number(info.lastInsertRowid);
    writeTopicChildren(newId, data);
    return newId;
  });
  return getTopic(id);
}

function updateTopic(id, data) {
  getTopic(id); // 404 if missing
  need(data, ['title', 'category', 'summary']);
  tx(() => {
    db.prepare('UPDATE topics SET title = ?, category = ?, summary = ? WHERE id = ?').run(text(data.title), text(data.category), text(data.summary), id);
    db.prepare('DELETE FROM topic_paragraphs WHERE topic_id = ?').run(id);
    db.prepare('DELETE FROM topic_sources WHERE topic_id = ?').run(id);
    writeTopicChildren(id, data);
  });
  return getTopic(id);
}

function deleteTopic(id) {
  const info = db.prepare('DELETE FROM topics WHERE id = ?').run(id);
  if (info.changes === 0) throw new ApiError(404, 'Topic not found');
}

// ==================== COMMENTS ====================
function listComments(topicId) {
  getTopic(topicId);
  return db.prepare('SELECT id, topic_id, author, body, created_at FROM comments WHERE topic_id = ? ORDER BY id').all(topicId);
}

function getComment(id) {
  const row = db.prepare('SELECT id, topic_id, author, body, created_at FROM comments WHERE id = ?').get(id);
  if (!row) throw new ApiError(404, 'Comment not found');
  return row;
}

function createComment(topicId, data) {
  getTopic(topicId);
  need(data, ['body']);
  const info = db.prepare('INSERT INTO comments (topic_id, author, body) VALUES (?, ?, ?)').run(
    topicId, isText(data.author) ? data.author.trim() : 'Anonymous', text(data.body));
  return getComment(Number(info.lastInsertRowid));
}

function updateComment(id, data) {
  getComment(id);
  need(data, ['body']);
  db.prepare('UPDATE comments SET body = ?, author = COALESCE(?, author) WHERE id = ?').run(
    text(data.body), isText(data.author) ? data.author.trim() : null, id);
  return getComment(id);
}

function deleteComment(id) {
  const info = db.prepare('DELETE FROM comments WHERE id = ?').run(id);
  if (info.changes === 0) throw new ApiError(404, 'Comment not found');
}

// ==================== RESOURCES ====================
const RESOURCE_COLS = 'id, name, description, url';

function listResources() {
  return db.prepare(`SELECT ${RESOURCE_COLS} FROM resources ORDER BY id`).all();
}

function getDisclaimer() {
  const row = db.prepare("SELECT setting_value FROM settings WHERE section = 'resources' AND setting_key = 'disclaimer'").get();
  return row ? row.setting_value : '';
}

function getResource(id) {
  const row = db.prepare(`SELECT ${RESOURCE_COLS} FROM resources WHERE id = ?`).get(id);
  if (!row) throw new ApiError(404, 'Resource not found');
  return row;
}

function createResource(data) {
  need(data, ['name', 'description', 'url']);
  const info = db.prepare('INSERT INTO resources (name, description, url) VALUES (?, ?, ?)').run(text(data.name), text(data.description), text(data.url));
  return getResource(Number(info.lastInsertRowid));
}

function updateResource(id, data) {
  getResource(id);
  need(data, ['name', 'description', 'url']);
  db.prepare('UPDATE resources SET name = ?, description = ?, url = ? WHERE id = ?').run(text(data.name), text(data.description), text(data.url), id);
  return getResource(id);
}

function deleteResource(id) {
  const info = db.prepare('DELETE FROM resources WHERE id = ?').run(id);
  if (info.changes === 0) throw new ApiError(404, 'Resource not found');
}

// ==================== CENTERS ====================
const CENTER_COLS = 'c.id, c.name, c.address, c.city, c.state, c.zip, c.lat, c.lng, c.phone, c.website, c.notes';

function loadCenter(row) {
  const services = db.prepare('SELECT service FROM center_services WHERE center_id = ? ORDER BY id').all(row.id).map((r) => r.service);
  return { ...row, services };
}

function listCenters({ city, service } = {}) {
  const where = [];
  const params = [];
  if (city) { where.push('c.city = ? COLLATE NOCASE'); params.push(city); }
  if (service) {
    where.push('EXISTS (SELECT 1 FROM center_services s WHERE s.center_id = c.id AND s.service LIKE ?)');
    params.push(`%${service}%`);
  }
  const sql = `SELECT ${CENTER_COLS} FROM centers c ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY c.id`;
  return db.prepare(sql).all(...params).map(loadCenter);
}

function getCenter(id) {
  const row = db.prepare(`SELECT ${CENTER_COLS} FROM centers c WHERE c.id = ?`).get(id);
  if (!row) throw new ApiError(404, 'Center not found');
  return loadCenter(row);
}

function centerFields(data) {
  need(data, ['name', 'address', 'city', 'state']);
  return {
    name: text(data.name), address: text(data.address), city: text(data.city), state: text(data.state),
    zip: text(data.zip), lat: needNumber(data, 'lat', -90, 90), lng: needNumber(data, 'lng', -180, 180),
    phone: text(data.phone), website: text(data.website), notes: text(data.notes),
  };
}

function writeServices(centerId, data) {
  list(data.services).forEach((s) => db.prepare('INSERT INTO center_services (center_id, service) VALUES (?, ?)').run(centerId, s));
}

function createCenter(data) {
  const f = centerFields(data);
  const id = tx(() => {
    const info = db.prepare('INSERT INTO centers (name, address, city, state, zip, lat, lng, phone, website, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(f.name, f.address, f.city, f.state, f.zip, f.lat, f.lng, f.phone, f.website, f.notes);
    const newId = Number(info.lastInsertRowid);
    writeServices(newId, data);
    return newId;
  });
  return getCenter(id);
}

function updateCenter(id, data) {
  getCenter(id);
  const f = centerFields(data);
  tx(() => {
    db.prepare('UPDATE centers SET name = ?, address = ?, city = ?, state = ?, zip = ?, lat = ?, lng = ?, phone = ?, website = ?, notes = ? WHERE id = ?')
      .run(f.name, f.address, f.city, f.state, f.zip, f.lat, f.lng, f.phone, f.website, f.notes, id);
    db.prepare('DELETE FROM center_services WHERE center_id = ?').run(id);
    writeServices(id, data);
  });
  return getCenter(id);
}

function deleteCenter(id) {
  const info = db.prepare('DELETE FROM centers WHERE id = ?').run(id);
  if (info.changes === 0) throw new ApiError(404, 'Center not found');
}

// ==================== ANALYTICS (SQL aggregates) ====================
const count = (sql) => db.prepare(sql).get().n;

function analyticsSummary() {
  const totalTopics = count('SELECT COUNT(*) AS n FROM topics');
  const words = db.prepare(
    "SELECT COALESCE(SUM(LENGTH(TRIM(body)) - LENGTH(REPLACE(TRIM(body), ' ', '')) + 1), 0) AS n FROM topic_paragraphs WHERE TRIM(body) <> ''"
  ).get().n;
  return {
    totalTopics,
    totalResources: count('SELECT COUNT(*) AS n FROM resources'),
    totalCenters: count('SELECT COUNT(*) AS n FROM centers'),
    totalComments: count('SELECT COUNT(*) AS n FROM comments'),
    categories: count('SELECT COUNT(DISTINCT category) AS n FROM topics'),
    averageWordsPerTopic: totalTopics ? Math.round(words / totalTopics) : 0,
    topicsWithSources: count('SELECT COUNT(DISTINCT topic_id) AS n FROM topic_sources'),
  };
}

const topicsByCategory = () => db.prepare('SELECT category AS label, COUNT(*) AS count FROM topics GROUP BY category ORDER BY count DESC, label').all();
const centersByCity = () => db.prepare('SELECT city AS label, COUNT(*) AS count FROM centers GROUP BY city ORDER BY count DESC, label').all();
const servicesCount = () => db.prepare('SELECT service AS label, COUNT(*) AS count FROM center_services GROUP BY service ORDER BY count DESC, label').all();

module.exports = {
  ApiError, tx,
  listTopics, getTopic, createTopic, updateTopic, deleteTopic,
  listComments, getComment, createComment, updateComment, deleteComment,
  listResources, getResource, getDisclaimer, createResource, updateResource, deleteResource,
  listCenters, getCenter, createCenter, updateCenter, deleteCenter,
  analyticsSummary, topicsByCategory, centersByCity, servicesCount,
};
