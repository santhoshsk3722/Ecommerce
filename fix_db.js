const db = require('./server/db');

// Update all products to belong to User ID 1
setTimeout(() => {
    db.run("UPDATE products SET seller_id = 1", (err) => {
        if (err) console.error(err);
        else console.log("SUCCESS: All products reassigned to User ID 1.");
    });
}, 1000);
