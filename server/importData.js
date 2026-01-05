const db = require('./db');
const https = require('https');

const fetchProducts = () => {
    return new Promise((resolve, reject) => {
        https.get('https://dummyjson.com/products?limit=100', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
            res.on('error', err => reject(err));
        });
    });
};

const importData = async () => {
    console.log('📦 Fetching products from external source...');
    try {
        const response = await fetchProducts();
        const externalProducts = response.products;

        console.log(`✓ Fetched ${externalProducts.length} products.`);
        console.log('🌱 Seeding database with new products...');

        // Clear existing products first? Maybe keep them or clear. 
        // Let's clear to have a clean "Real Store" feel as per request.
        // But we need to keep the Demo Seller (user_id=2).

        await new Promise((resolve, reject) => {
            db.run("DELETE FROM products", (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const insertProduct = db.prepare(`INSERT INTO products (title, price, description, category, image, rating, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?)`);

        const sellerId = 2; // Demo Seller

        for (const p of externalProducts) {
            // Map DummyJSON fields to our schema
            const title = p.title;
            const price = p.price;
            const description = p.description;
            const category = p.category; // DummyJSON categories are good
            const image = p.thumbnail; // or p.images[0]
            const rating = p.rating;

            await new Promise((resolve, reject) => {
                insertProduct.run(title, price, description, category, image, rating, sellerId, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        insertProduct.finalize();

        console.log('✅ Successfully imported 100+ products!');

    } catch (error) {
        console.error('❌ Error importing data:', error);
    }
};

importData();
