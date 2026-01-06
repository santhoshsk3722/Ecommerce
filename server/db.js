const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'shop.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database at: ' + dbPath);

        // Auto-migration for Inventory Tracking
        db.run("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 10", (err) => {
            if (!err) {
                console.log("Migration: Added 'stock' column to products table.");
            }
            // Ignore error if column already exists
        });
    }
});

module.exports = db;
