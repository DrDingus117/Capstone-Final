// Opens the SQLite database and makes sure the tables exist.
// Uses the SQLite built into Node (node:sqlite), so there is nothing to install.
const fs = require('fs');
const path = require('path');
const sqlite = require('node:sqlite');
const config = require('./config');

fs.mkdirSync(path.dirname(config.database.file), { recursive: true });

// Newer Node versions renamed DatabaseSync to Database (the old name still works
// but is deprecated). This uses whichever one your Node version has.
const Database = sqlite.Database ?? sqlite.DatabaseSync;

const db = new Database(config.database.file);
db.exec('PRAGMA foreign_keys = ON'); // makes ON DELETE CASCADE work
db.exec(fs.readFileSync(config.database.schema, 'utf8'));

module.exports = db;