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
            if (!err) console.log("Migration: Added 'stock' column to products table.");
        });

        // Auto-migration for User Profile Fields
        const userFields = ['address', 'city', 'zip', 'country'];
        userFields.forEach(field => {
            db.run(`ALTER TABLE users ADD COLUMN ${field} TEXT`, (err) => {
                if (!err) console.log(`Migration: Added '${field}' column to users table.`);
            });
        });
    }
});

module.exports = db;
