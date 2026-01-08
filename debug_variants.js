const db = require('./server/db');

setTimeout(() => {
    console.log("--- LATEST PRODUCTS ---");
    db.all("SELECT id, title, variants FROM products ORDER BY id DESC LIMIT 3", [], (err, rows) => {
        if (err) console.error(err);
        else console.log(JSON.stringify(rows, null, 2));
    });
}, 1000);
