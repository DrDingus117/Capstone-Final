// Reads config.ini (sections in [brackets], key = value lines).
const fs = require('fs');
const path = require('path');

function parseIni(text) {
  const result = {};
  let section = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    const header = line.match(/^\[(.+)\]$/);
    if (header) {
      section = header[1].trim();
      result[section] = result[section] || {};
      continue;
    }
    const eq = line.indexOf('=');
    if (eq === -1 || section === null) continue;
    result[section][line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return result;
}

const ini = parseIni(fs.readFileSync(path.join(__dirname, 'config.ini'), 'utf8'));
const here = (p) => path.resolve(__dirname, p);

module.exports = {
  server: {
    port: Number(process.env.PORT || ini.server?.port || 3000),
    host: ini.server?.host || '0.0.0.0',
  },
  database: {
    // DB_FILE lets a hosting server (like IIS) point at a different location.
    file: process.env.DB_FILE ? path.resolve(process.env.DB_FILE) : here(ini.database?.file || 'data/app.db'),
    schema: here(ini.database?.schema || 'schema.sql'),
  },
  seed: {
    content: here(ini.seed?.content || 'data/content.js'),
    resources: here(ini.seed?.resources || 'data/resources.js'),
    centers: here(ini.seed?.centers || 'data/centers.js'),
  },
};
