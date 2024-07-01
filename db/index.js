const Database = require('better-sqlite3');
const db = new Database('items.db');

module.exports = db;
