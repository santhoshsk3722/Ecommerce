const db = require('./server/db');

const dummyVariants = JSON.stringify([
    { name: "Size", options: ["S", "M", "L", "XL"] },
    { name: "Color", options: ["Red", "Blue", "Black"] }
]);

setTimeout(() => {
    console.log("Injecting dummy variants into the latest product...");
    db.run("UPDATE products SET variants = ? WHERE id = (SELECT MAX(id) FROM products)", [dummyVariants], function (err) {
        if (err) console.error(err);
        else console.log(`SUCCESS: Updated Product ID (latest) with variants.`);
    });
}, 1000);
