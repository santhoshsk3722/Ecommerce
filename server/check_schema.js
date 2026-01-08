const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'shop.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("PRAGMA table_info(users)", (err, rows) => {
        console.log("USERS:", rows.map(r => `${r.name}(${r.type})`).join(', '));
    });
    db.all("PRAGMA table_info(products)", (err, rows) => {
        console.log("PRODUCTS:", rows.map(r => `${r.name}(${r.type})`).join(', '));
    });
    db.all("PRAGMA table_info(orders)", (err, rows) => {
        console.log("ORDERS:", rows.map(r => `${r.name}(${r.type})`).join(', '));
    });
});
