const db = require('./server/db');

// Wait for migrations to likely finish
setTimeout(() => {
    console.log("\n\n=== DEBUG OUTPUT START ===");

    db.all("SELECT id, name, email, role FROM users", [], (err, users) => {
        if (err) console.error(err);
        else {
            console.log("Users:");
            users.forEach(u => console.log(`[ID: ${u.id}] ${u.email} (${u.role})`));
        }

        db.all("SELECT id, title, seller_id FROM products LIMIT 5", [], (err, products) => {
            if (err) console.error(err);
            else {
                console.log("\nProducts (First 5):");
                products.forEach(p => console.log(`[ID: ${p.id}] ${p.title} (Seller ID: ${p.seller_id})`));
            }
            console.log("=== DEBUG OUTPUT END ===\n");
        });
    });
}, 2000);
