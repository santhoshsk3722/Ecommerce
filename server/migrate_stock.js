const db = require('./db');

db.serialize(() => {
    // Add stock column to products table
    db.run("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 10", (err) => {
        if (err) {
            console.log("Stock column might already exist or error:", err.message);
        } else {
            console.log("Successfully added stock column to products table.");
        }
    });
});
