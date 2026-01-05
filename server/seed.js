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

        // Create Orders Table
        await serializePromise(`
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                total REAL NOT NULL,
                status TEXT DEFAULT 'Processing',
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
            { name: 'Admin User', email: 'admin@shop.com', password: 'admin123', role: 'admin' },
            { name: 'Demo Seller', email: 'seller@shop.com', password: 'seller123', role: 'seller' },
            { name: 'Demo User', email: 'demo@example.com', password: 'password123', role: 'user' }
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
                image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-select?wid=512&hei=512&fmt=jpeg&qlt=90&.v=1692879663718",
                rating: 4.8
            },
            {
                title: "Samsung Galaxy S24 Ultra",
                price: 1199.99,
                description: "Galaxy AI is here. Epic titanium design. Note Assist. Photo Assist. Circle to Search.",
                category: "Electronics",
                image: "https://images.samsung.com/is/image/samsung/p6pim/uk/2401/gallery/uk-galaxy-s24-s928-sm-s928bztpeub-539659392?$512_512_PNG$",
                rating: 4.7
            },
            {
                title: "Sony WH-1000XM5",
                price: 348.00,
                description: "Industry Leading Noise Canceling Wireless Headphones with Auto Noise Canceling Optimizer.",
                category: "Audio",
                image: "https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_SL1000_.jpg",
                rating: 4.6
            },
            {
                title: "MacBook Air M3",
                price: 1099.00,
                description: "Lean. Mean. M3 machine. Supercharged by the next-generation M3 chip.",
                category: "Electronics",
                image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-m3-midnight-select-202402?wid=512&hei=512&fmt=jpeg&qlt=90&.v=1708367688034",
                rating: 4.9
            },
            {
                title: "PlayStation 5 Slim",
                price: 499.99,
                description: "The PS5 console unleashes new gaming possibilities that you never anticipated.",
                category: "Gaming",
                image: "https://m.media-amazon.com/images/I/31CwPNErDGL._AC_SY450_.jpg",
                rating: 4.9
            },
            {
                title: "Nike Air Force 1 '07",
                price: 115.00,
                description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best.",
                category: "Fashion",
                image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/3cc96f43-47b6-43cb-951d-d8f73bb2f912/air-force-1-07-mens-shoes-jBrhbr.png",
                rating: 4.5
            },
            {
                title: "Adidas Ultraboost Light",
                price: 190.00,
                description: "Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever.",
                category: "Fashion",
                image: "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/2544222da5904aa7964ead5c00d83296_9366/Ultraboost_Light_Running_Shoes_Black_HQ6339_01_standard.jpg",
                rating: 4.7
            },
            {
                title: "Instant Pot Duo 7-in-1",
                price: 99.95,
                description: "Electric Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker, Warmer & Sterilizer.",
                category: "Home",
                image: "https://m.media-amazon.com/images/I/71WtwEvYDOS._AC_SL1500_.jpg",
                rating: 4.8
            },
            {
                title: "Dyson V15 Detect",
                price: 749.99,
                description: "Dyson's most powerful, intelligent cordless vacuum. Laser reveals microscopic dust.",
                category: "Home",
                image: "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/368340-01.png?$responsive$&cropPathE=desktop&fit=constrain,1&wid=512",
                rating: 4.6
            },
            {
                title: "Kindle Paperwhite",
                price: 139.99,
                description: "Now with a 6.8” display and thinner borders, adjustable warm light, up to 10 weeks of battery life.",
                category: "Electronics",
                image: "https://m.media-amazon.com/images/I/51p4-EA+lBL._AC_SL1000_.jpg",
                rating: 4.7
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

        console.log('✅ Database seeded successfully!');
    } catch (err) {
        console.error('❌ Error seeding database:', err);
    } finally {
        db.close();
    }
};

setupDatabase();
