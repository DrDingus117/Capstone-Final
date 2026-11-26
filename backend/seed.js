// One-time import of the old JavaScript data files into SQLite.
//   npm run seed            (stops if the database already has data)
//   npm run seed -- --force (wipes topics, resources, centers and comments first)
const db = require('./db');
const config = require('./config');

const force = process.argv.includes('--force');

function load(file, label) {
  try {
    return require(file);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log(`Skipping ${label}: ${file} not found`);
      return null;
    }
    throw err;
  }
}

const n = (table) => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;

if (!force && (n('topics') > 0 || n('resources') > 0 || n('centers') > 0)) {
  console.log('The database already has data. Nothing was changed.');
  console.log('Run "npm run seed -- --force" to wipe it and import again.');
  process.exit(0);
}

const content = load(config.seed.content, 'topics');
const resources = load(config.seed.resources, 'resources');
const centers = load(config.seed.centers, 'centers');

db.exec('BEGIN');
try {
  if (force) {
    for (const t of ['comments', 'topics', 'resources', 'centers']) db.exec(`DELETE FROM ${t}`);
  }

  let topicCount = 0;
  for (const t of content?.topics || []) {
    const info = db.prepare('INSERT INTO topics (slug, title, category, summary) VALUES (?, ?, ?, ?)')
      .run(t.id == null ? null : String(t.id), t.title, t.category, t.summary);
    const id = Number(info.lastInsertRowid);
    (t.body || []).forEach((p, i) => db.prepare('INSERT INTO topic_paragraphs (topic_id, position, body) VALUES (?, ?, ?)').run(id, i, p));
    (t.sources || []).forEach((s, i) => db.prepare('INSERT INTO topic_sources (topic_id, position, source) VALUES (?, ?, ?)').run(id, i, s));
    topicCount++;
  }

  let resourceCount = 0;
  for (const r of resources?.resources || []) {
    db.prepare('INSERT INTO resources (name, description, url) VALUES (?, ?, ?)').run(r.name, r.description, r.url);
    resourceCount++;
  }
  if (resources?.disclaimer) {
    db.prepare(`INSERT INTO settings (section, setting_key, setting_value) VALUES ('resources', 'disclaimer', ?)
                ON CONFLICT(section, setting_key) DO UPDATE SET setting_value = excluded.setting_value`).run(resources.disclaimer);
  }

  let centerCount = 0;
  for (const c of Array.isArray(centers) ? centers : []) {
    db.prepare('INSERT INTO centers (name, address, city, state, zip, lat, lng, phone, website, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(c.name, c.address, c.city, c.state, c.zip || '', c.lat, c.lng, c.phone || '', c.website || '', c.notes || '');
    const id = Number(db.prepare('SELECT last_insert_rowid() AS id').get().id);
    (c.services || []).forEach((s) => db.prepare('INSERT INTO center_services (center_id, service) VALUES (?, ?)').run(id, s));
    centerCount++;
  }

  db.exec('COMMIT');
  console.log(`Imported ${topicCount} topics, ${resourceCount} resources, ${centerCount} centers.`);
  console.log(`Database file: ${config.database.file}`);
} catch (err) {
  db.exec('ROLLBACK');
  console.error('Import failed, nothing was changed:', err.message);
  process.exit(1);
}
