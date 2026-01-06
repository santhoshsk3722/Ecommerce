const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'shop.db');
const db = new sqlite3.Database(dbPath);

const products = [
    {
        title: "Sony WH-1000XM5 Wireless Headphones",
        price: 348.00,
        description: "Industry-leading noise canceling with two processors control 8 microphones for unprecedented noise cancellation.",
        category: "audio",
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80",
        stock: 15,
        seller_id: 1
    },
    {
        title: "MacBook Air M2",
        price: 1199.00,
        description: "Redesigned around the next-generation M2 chip, MacBook Air is strikingly thin and brings exceptional speed and power efficiency.",
        category: "laptops",
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=500&q=80",
        stock: 5,
        seller_id: 1
    },
    {
        title: "Nike Air Zoom Pegasus 39",
        price: 129.99,
        description: "Running shoes that energize your stride. Lightweight and durable mesh.",
        category: "fashion",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
        stock: 20,
        seller_id: 1
    },
    {
        title: "Logitech MX Master 3S",
        price: 99.99,
        description: "Performance wireless mouse. 8000 DPI tracking on glass, quiet clicks, and USB-C recharging.",
        category: "accessories",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80",
        stock: 30,
        seller_id: 1
    },
    {
        title: "Samsung Galaxy S24 Ultra",
        price: 1299.00,
        description: "Galaxy AI is here. Epic titanium design, 200MP camera, and built-in S Pen.",
        category: "smartphones",
        image: "https://images.unsplash.com/photo-1610945415295-d96bf067d9e4?auto=format&fit=crop&w=500&q=80",
        stock: 8,
        seller_id: 1
    },
    {
        title: "Kindle Paperwhite (16 GB)",
        price: 149.99,
        description: "Now with a 6.8” display and adjustable warm light.",
        category: "electronics",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80",
        stock: 25,
        seller_id: 1
    },
    {
        title: "Herman Miller Aeron Chair",
        price: 1695.00,
        description: "The benchmark for ergonomic seating. Graphite color, size B.",
        category: "home",
        image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=500&q=80",
        stock: 3,
        seller_id: 1
    },
    {
        title: "PlayStation 5 Console",
        price: 499.99,
        description: "Experience lightning fast loading with an ultra-high speed SSD.",
        category: "gaming",
        image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=500&q=80",
        stock: 0,
        seller_id: 1
    },
    {
        title: "Instant Pot Duo 7-in-1",
        price: 89.95,
        description: "Electric pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.",
        category: "home",
        image: "https://images.unsplash.com/photo-1588625293290-77647230191c?auto=format&fit=crop&w=500&q=80",
        stock: 12,
        seller_id: 1
    },
    {
        title: "Ray-Ban Aviator Classic",
        price: 163.00,
        description: "Timeless style, authenticity and freedom of expression.",
        category: "fashion",
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80",
        stock: 18,
        seller_id: 1
    },
    {
        title: "Canon EOS R6 Mark II",
        price: 2499.00,
        description: "Full-frame mirrorless camera for photography and hybrid content creation.",
        category: "cameras",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80",
        stock: 4,
        seller_id: 1
    }
];

db.serialize(() => {
    // Check if products exist to avoid duplicates if run multiple times
    db.get("SELECT count(*) as count FROM products", (err, row) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(`Current product count: ${row.count}`);

        const stmt = db.prepare("INSERT INTO products (title, price, description, category, image, stock, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?)");

        let added = 0;
        products.forEach((p) => {
            stmt.run(p.title, p.price, p.description, p.category, p.image, p.stock, p.seller_id, (err) => {
                if (err) console.error("Error inserting", p.title, err.message);
                else {
                    added++;
                    process.stdout.write(".");
                }
            });
        });

        stmt.finalize(() => {
            console.log(`\nSeeding process initiated for ${products.length} products.`);
            // Wait a bit for async inserts
            setTimeout(() => {
                console.log("Done.");
                db.close();
            }, 1000);
        });
    });
});
