// Opens the SQLite database and makes sure the tables exist.
// Uses the SQLite built into Node (node:sqlite), so there is nothing to install.
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const config = require('./config');

fs.mkdirSync(path.dirname(config.database.file), { recursive: true });

const db = new DatabaseSync(config.database.file);
db.exec('PRAGMA foreign_keys = ON'); // makes ON DELETE CASCADE work
db.exec(fs.readFileSync(config.database.schema, 'utf8'));

module.exports = db;
