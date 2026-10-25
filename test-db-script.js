const Database = require('better-sqlite3');
const db = new Database(':memory:');
db.exec('CREATE TABLE flags (id TEXT PRIMARY KEY, name TEXT, description TEXT, enabled INTEGER, rolloutPercentage INTEGER, rules TEXT, createdAt TEXT, updatedAt TEXT);');
const stmt = db.prepare('INSERT INTO flags (id, name, enabled, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)');
stmt.run('test-id', 'test-name', 1, new Date().toISOString(), new Date().toISOString());
const row = db.prepare('SELECT * FROM flags WHERE id = ?').get('test-id');
console.log(row);
