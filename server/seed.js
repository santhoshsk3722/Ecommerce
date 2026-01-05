const db = require('./db');

const serializePromise = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const setupDatabase = async () => {
    console.log('🌱 Seeding database...');

    try {
        // Drop tables
        await serializePromise(`DROP TABLE IF EXISTS notifications`);
        await serializePromise(`DROP TABLE IF EXISTS wishlist`);
        await serializePromise(`DROP TABLE IF EXISTS reviews`);
        await serializePromise(`DROP TABLE IF EXISTS order_items`);
        await serializePromise(`DROP TABLE IF EXISTS orders`);
        await serializePromise(`DROP TABLE IF EXISTS products`);
        await serializePromise(`DROP TABLE IF EXISTS users`);

        // Create Users Table
        await serializePromise(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user'
            )
        `);

        // Create Products Table
        await serializePromise(`
            CREATE TABLE products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                price REAL NOT NULL,
                description TEXT,
                category TEXT,
                image TEXT,
                rating REAL,
                seller_id INTEGER,
                FOREIGN KEY(seller_id) REFERENCES users(id)
            )
        `);

        // Create Orders Table (Updated for Logistics)
        await serializePromise(`
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                total REAL NOT NULL,
                status TEXT DEFAULT 'Processing',
                payment_method TEXT, 
                payment_status TEXT DEFAULT 'Pending',
                tracking_id TEXT,
                courier_name TEXT,
                estimated_delivery TEXT,
                shipping_address TEXT,
                date TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        // Create Notifications Table
        await serializePromise(`
            CREATE TABLE notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                message TEXT,
                is_read INTEGER DEFAULT 0,
                date TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        // Create Order Items Table
        await serializePromise(`
            CREATE TABLE order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                product_id INTEGER,
                quantity INTEGER,
                price REAL,
                FOREIGN KEY(order_id) REFERENCES orders(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            )
        `);

        // Create Reviews Table
        await serializePromise(`
            CREATE TABLE reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                product_id INTEGER,
                rating INTEGER,
                comment TEXT,
                date TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            )
        `);

        // Create Wishlist Table
        await serializePromise(`
            CREATE TABLE wishlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                product_id INTEGER,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            )
        `);

        // Seed Users
        const users = [
            { name: 'Admin User', email: 'admin@techorbit.com', password: 'admin123', role: 'admin' },
            { name: 'Demo Seller', email: 'seller@techorbit.com', password: 'seller123', role: 'seller' },
            { name: 'Demo User', email: 'user@techorbit.com', password: 'user123', role: 'user' }
        ];

        const insertUser = db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`);
        for (const u of users) {
            await new Promise((resolve, reject) => {
                insertUser.run(u.name, u.email, u.password, u.role, function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        insertUser.finalize();

        const sellerId = 2; // Demo Seller ID

        // Seed Products
        const products = [
            {
                title: "iPhone 15 Pro Max",
                price: 1299.99,
                description: "The ultimate iPhone. Titanium design, A17 Pro chip, and the most advanced camera system ever in an iPhone.",
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
                rating: 4.8,
                seller_id: sellerId
            },
            {
                title: "Samsung Galaxy S24 Ultra",
                price: 1199.99,
                description: "Galaxy AI is here. Epic titanium design. Note Assist. Photo Assist. Circle to Search.",
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1610945265078-3858a0828671?auto=format&fit=crop&w=800&q=80",
                rating: 4.7,
                seller_id: sellerId
            },
            {
                title: "Sony WH-1000XM5",
                price: 348.00,
                description: "Industry Leading Noise Canceling Wireless Headphones with Auto Noise Canceling Optimizer.",
                category: "Audio",
                image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
                rating: 4.6,
                seller_id: sellerId
            },
            {
                title: "MacBook Air M3",
                price: 1099.00,
                description: "Lean. Mean. M3 machine. Supercharged by the next-generation M3 chip.",
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800&q=80",
                rating: 4.9,
                seller_id: sellerId
            },
            {
                title: "PlayStation 5 Slim",
                price: 499.99,
                description: "The PS5 console unleashes new gaming possibilities that you never anticipated.",
                category: "Gaming",
                image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
                rating: 4.9,
                seller_id: sellerId
            },
            {
                title: "Nike Air Force 1 '07",
                price: 115.00,
                description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best.",
                category: "Fashion",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
                rating: 4.5,
                seller_id: sellerId
            },
            {
                title: "Adidas Ultraboost Light",
                price: 190.00,
                description: "Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever.",
                category: "Fashion",
                image: "https://images.unsplash.com/photo-1608231387637-bf17b075e533?auto=format&fit=crop&w=800&q=80",
                rating: 4.7,
                seller_id: sellerId
            },
            {
                title: "Instant Pot Duo 7-in-1",
                price: 99.95,
                description: "Electric Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker, Warmer & Sterilizer.",
                category: "Home",
                image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
                rating: 4.8,
                seller_id: sellerId
            },
            {
                title: "Dyson V15 Detect",
                price: 749.99,
                description: "Dyson's most powerful, intelligent cordless vacuum. Laser reveals microscopic dust.",
                category: "Home",
                image: "https://images.unsplash.com/photo-1558317374-a3593912094c?auto=format&fit=crop&w=800&q=80",
                rating: 4.6,
                seller_id: sellerId
            },
            {
                title: "Kindle Paperwhite",
                price: 139.99,
                description: "Now with a 6.8” display and thinner borders, adjustable warm light, up to 10 weeks of battery life.",
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
                rating: 4.7,
                seller_id: sellerId
            }
        ];

        const insertProduct = db.prepare(`INSERT INTO products (title, price, description, category, image, rating, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        for (const p of products) {
            await new Promise((resolve, reject) => {
                insertProduct.run(p.title, p.price, p.description, p.category, p.image, p.rating, p.seller_id, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        insertProduct.finalize();

        // Verify count
        await new Promise((resolve, reject) => {
            db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
                if (err) console.error(err);
                else console.log(`✅ Verified: ${row.count} products found in DB.`);
                resolve();
            });
        });

        console.log('✅ Database seeded successfully!');
    } catch (err) {
        console.error('❌ Error seeding database:', err);
    } finally {
        db.close();
    }
};

setupDatabase();
