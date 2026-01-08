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

        // Auto-migration for Product Variants (JSON stored as TEXT)
        db.run("ALTER TABLE products ADD COLUMN variants TEXT", (err) => {
            if (!err) console.log("Migration: Added 'variants' column to products table.");
        });



        // Auto-migration for Analytics (created_at)
        const timestampTables = ['users', 'products'];
        timestampTables.forEach(table => {
            db.run(`ALTER TABLE ${table} ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
                if (!err) console.log(`Migration: Added 'created_at' column to ${table} table.`);
            });
        });

        // Auto-migration for User Avatar
        db.run("ALTER TABLE users ADD COLUMN avatar TEXT", (err) => {
            if (!err) console.log("Migration: Added 'avatar' column to users table.");
        });
        // Auto-migration for Addresses
        db.run(`CREATE TABLE IF NOT EXISTS addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            address TEXT,
            city TEXT,
            zip TEXT,
            country TEXT,
            is_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) console.log("Migration: 'addresses' table ready.");
        });

        // Auto-migration for Wishlist
        db.run(`CREATE TABLE IF NOT EXISTS wishlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`, (err) => {
            if (!err) console.log("Migration: 'wishlist' table ready.");
        });

        // Auto-migration for Coupons
        db.run(`CREATE TABLE IF NOT EXISTS coupons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE,
            discount_type TEXT, -- 'percent' or 'fixed'
            discount_value REAL,
            min_purchase REAL DEFAULT 0,
            expiration_date DATETIME,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                console.log("Migration: 'coupons' table ready.");
                // Insert a default welcome coupon if empty
                db.get("SELECT count(*) as count FROM coupons", (err, row) => {
                    if (row && row.count === 0) {
                        db.run("INSERT INTO coupons (code, discount_type, discount_value, min_purchase) VALUES ('WELCOME10', 'percent', 10, 0)");
                        console.log("Info: Created default WELCOME10 coupon.");
                    }
                });
            }
        });
    }
});

// Auto-migration for Reviews
db.run(`CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            rating INTEGER,
            comment TEXT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`, (err) => {
    if (!err) console.log("Migration: 'reviews' table ready.");
});

// Auto-migration for Password Resets
db.run(`CREATE TABLE IF NOT EXISTS password_resets(
    email TEXT,
    token TEXT,
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expires_at DATETIME
)`, (err) => {
    if (!err) console.log("Migration: 'password_resets' table ready.");
});


module.exports = db;
