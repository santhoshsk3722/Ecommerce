/**
 * @file index.js
 * @description Main Entry Point for the Backend Server.
 * 
 * This file configures and runs the Express application, handling:
 * - API Routes for Products, Users, Orders, Payments, and more.
 * - Middleware configuration (CORS, Rate Limiting, Security headers).
 * - Database connection and static file serving (if applicable).
 * - Integration with Stripe for payments and EmailJS (client-side fallback).
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.set('trust proxy', 1); // Required for Render/Vercel behind load balancers
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow resources to be loaded from other domains (e.g. images)
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

app.use(cors());
app.use(express.json());

// --- Payment Routes ---
app.post('/api/create-payment-intent', async (req, res) => {
    const { amount, currency = 'usd' } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            payment_method_types: ['card'],
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- Products Routes ---

// Get all products (with search and filter)
app.get('/api/products', (req, res) => {
    let sql = "SELECT * FROM products";
    const params = [];
    const { search, category, page = 1, limit = 100, excludeId, minPrice, maxPrice, sortBy } = req.query;
    const offset = (page - 1) * limit;

    sql += " WHERE 1=1"; // Always start with valid WHERE for easier appending

    if (search) {
        sql += " AND (title LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
        sql += " AND category = ?";
        params.push(category);
    }
    if (excludeId) {
        sql += " AND id != ?";
        params.push(excludeId);
    }
    if (minPrice) {
        sql += " AND price >= ?";
        params.push(minPrice);
    }
    if (maxPrice) {
        sql += " AND price <= ?";
        params.push(maxPrice);
    }

    // Sorting Logic
    if (sortBy === 'price_asc') {
        sql += " ORDER BY price ASC";
    } else if (sortBy === 'price_desc') {
        sql += " ORDER BY price DESC";
    } else if (sortBy === 'newest') {
        sql += " ORDER BY created_at DESC";
    } else {
        // Default sort
        sql += " ORDER BY id DESC";
    }

    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Get Categories
app.get('/api/categories', (req, res) => {
    const sql = "SELECT DISTINCT category FROM products";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows.map(r => r.category).filter(Boolean)
        });
    });
});

// Get single product
// Get single product (with Average Rating)
app.get('/api/products/:id', (req, res) => {
    const sql = `
        SELECT p.*, 
        (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as average_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
        FROM products p 
        WHERE p.id = ?
    `;
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

// --- Auth Routes ---

// Login (Simplified)
// Login (Updated with Role)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    db.get(sql, [email], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (row && row.password === password) {
            // Return role and address info in user object
            res.json({
                "message": "success",
                "user": {
                    id: row.id,
                    name: row.name,
                    email: row.email,
                    role: row.role,
                    address: row.address,
                    city: row.city,
                    zip: row.zip,
                    country: row.country,
                    avatar: row.avatar // Include avatar in response
                }
            });
        } else {
            res.status(401).json({ "message": "Invalid credentials" });
        }
    });
});

// Signup (Default to 'user')
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    const role = 'user'; // Default role
    const sql = "INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)";
    db.run(sql, [name, email, password, role], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "user": { id: this.lastID, name, email, role }
        });
    });
});

// Google Login / Signup
app.post('/api/google-login', (req, res) => {
    const { email, name } = req.body;
    const role = 'user';

    // Check if user exists
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(400).json({ "error": err.message });

        if (row) {
            // User exists. Check if they have an avatar.
            let userAvatar = row.avatar;

            // If DB avatar is empty but Google provides one, update it!
            if (!userAvatar && req.body.picture) {
                userAvatar = req.body.picture;
                db.run("UPDATE users SET avatar = ? WHERE id = ?", [userAvatar, row.id]);
            }

            // Log them in
            res.json({
                "message": "success",
                "user": {
                    id: row.id,
                    name: row.name,
                    email: row.email,
                    role: row.role,
                    address: row.address,
                    city: row.city,
                    zip: row.zip,
                    country: row.country,
                    avatar: userAvatar // Return the (potentially new) avatar
                }
            });
        } else {
            // New user, create account
            constUiAvatar = req.body.picture || ''; // Get picture from Google
            const crypto = require('crypto');
            const password = crypto.randomUUID();
            const insertSql = "INSERT INTO users (name, email, password, role, avatar) VALUES (?,?,?,?,?)";

            db.run(insertSql, [name, email, password, role, constUiAvatar], function (err) {
                if (err) return res.status(400).json({ "error": err.message });

                res.json({
                    "message": "success",
                    "user": {
                        id: this.lastID,
                        name,
                        email,
                        role,
                        avatar: constUiAvatar
                    }
                });
            });
        }
    });
});

// --- Seller Routes ---

// Add Product (Seller only - simplified check, ideally verified by token)
app.post('/api/products', (req, res) => {
    const { title, price, description, category, image, seller_id, stock, variants } = req.body;
    const rating = 0; // New products start with 0 rating
    const stockValue = stock !== undefined ? stock : 10; // Default stock
    const variantsValue = variants ? JSON.stringify(variants) : null;

    const sql = "INSERT INTO products (title, price, description, category, image, rating, seller_id, stock, variants) VALUES (?,?,?,?,?,?,?,?,?)";

    db.run(sql, [title, price, description, category, image, rating, seller_id, stockValue, variantsValue], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "id": this.lastID });
    });
});

// Edit Product (Seller)
app.put('/api/products/:id', (req, res) => {
    const { title, price, description, category, image, stock, variants } = req.body;
    const variantsValue = variants ? JSON.stringify(variants) : null;

    const sql = "UPDATE products SET title = ?, price = ?, description = ?, category = ?, image = ?, stock = ?, variants = ? WHERE id = ?";

    db.run(sql, [title, price, description, category, image, stock, variantsValue, req.params.id], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "updated", changes: this.changes });
    });
});

// Get Products by Seller
app.get('/api/products/seller/:sellerId', (req, res) => {
    const sql = "SELECT * FROM products WHERE seller_id = ?";
    db.all(sql, [req.params.sellerId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": rows });
    });
});

// Delete Product
app.delete('/api/products/:id', (req, res) => {
    const sql = "DELETE FROM products WHERE id = ?";
    db.run(sql, [req.params.id], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// --- Search Routes ---
app.post('/api/search/visual', (req, res) => {
    // Ideally, we would use Multer to upload the file and then send it to OpenAI Vision / Cloud Vision
    // For now, we simulate the analysis delay and result.

    setTimeout(() => {
        const potentialMatches = ['laptop', 'shoes', 'watch', 'camera', 'phone', 'headphones'];
        const identifiedKeyword = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];

        res.json({
            message: "success",
            keyword: identifiedKeyword,
            confidence: 0.95
        });
    }, 2000);
});

// --- AI Routes ---
app.post('/api/ai/generate', (req, res) => {
    const { title, category, keywords } = req.body;

    // Simulate AI Latency
    setTimeout(() => {
        const templates = {
            electronics: `Experience the future with the new ${title}. Featuring state-of-the-art technology, long-lasting battery life, and a sleek design, it is perfect for tech enthusiasts.`,
            fashion: `Elevate your style with the ${title}. Crafted from premium materials, this piece offers both comfort and elegance. Perfect for any occasion.`,
            home: `Transform your living space with the ${title}. Designed for both functionality and aesthetics, it blends seamlessly with modern home decor.`,
            books: `Dive into the captivating world of ${title}. A must-read for anyone interested in this genre, offering deep insights and compelling storytelling.`,
            default: `Discover the unmatched quality of ${title}. Designed to exceed expectations, this product offers great value and performance.`
        };

        const baseDesc = templates[category] || templates.default;
        const extra = keywords ? ` Key highlights include: ${keywords}.` : "";

        res.json({
            message: "success",
            description: `${baseDesc}${extra} (Generated by AI ✨)`
        });
    }, 1500);
});


// --- Admin Routes ---

// Get All Users
app.get('/api/users', (req, res) => {
    const sql = "SELECT id, name, email, role FROM users";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": rows });
    });
});

// Update User Profile
app.put('/api/users/:id', (req, res) => {
    const { name, address, city, zip, country, avatar } = req.body;
    const sql = "UPDATE users SET name = ?, address = ?, city = ?, zip = ?, country = ?, avatar = ? WHERE id = ?";

    db.run(sql, [name, address, city, zip, country, avatar, req.params.id], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "updated", changes: this.changes });
    });
});

// Delete User (Admin)
app.delete('/api/users/:id', (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// Delete User (Admin)
app.delete('/api/users/:id', (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// --- Address Routes ---

app.get('/api/addresses/:userId', (req, res) => {
    db.all("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC", [req.params.userId], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": rows });
    });
});

app.post('/api/addresses', (req, res) => {
    const { user_id, name, address, city, zip, country } = req.body;
    db.run("INSERT INTO addresses (user_id, name, address, city, zip, country) VALUES (?,?,?,?,?,?)",
        [user_id, name, address, city, zip, country],
        function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            res.json({ "message": "success", "id": this.lastID });
        }
    );
});

app.delete('/api/addresses/:id', (req, res) => {
    db.run("DELETE FROM addresses WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// --- Wishlist Routes ---

app.get('/api/wishlist/:userId', (req, res) => {
    const sql = `
        SELECT w.id as wishlist_id, p.* 
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    `;
    db.all(sql, [req.params.userId], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": rows });
    });
});

app.post('/api/wishlist', (req, res) => {
    const { user_id, product_id } = req.body;
    // Check duplicate
    db.get("SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?", [user_id, product_id], (err, row) => {
        if (row) return res.status(400).json({ "error": "Already in wishlist" });

        db.run("INSERT INTO wishlist (user_id, product_id) VALUES (?,?)", [user_id, product_id], function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            res.json({ "message": "success", "id": this.lastID });
        });
    });
});

app.delete('/api/wishlist/:id', (req, res) => {
    db.run("DELETE FROM wishlist WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "deleted" });
    });
});

app.delete('/api/wishlist/remove/:userId/:productId', (req, res) => {
    db.run("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [req.params.userId, req.params.productId], function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "deleted" });
    });
});

// --- Coupon Routes ---

app.post('/api/coupons/validate', (req, res) => {
    const { code, cartTotal } = req.body;
    db.get("SELECT * FROM coupons WHERE code = ? AND is_active = 1", [code], (err, coupon) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!coupon) return res.status(404).json({ error: "Invalid coupon code" });

        // Check Expiry
        if (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) {
            return res.status(400).json({ error: "Coupon expired" });
        }

        // Check Min Purchase
        if (cartTotal < coupon.min_purchase) {
            return res.status(400).json({ error: `Minimum purchase of $${coupon.min_purchase} required` });
        }

        res.json({ message: "success", data: coupon });
    });
});

app.get('/api/admin/coupons', (req, res) => {
    db.all("SELECT * FROM coupons ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});

app.post('/api/admin/coupons', (req, res) => {
    const { code, discount_type, discount_value, min_purchase, expiration_date } = req.body;
    const sql = "INSERT INTO coupons (code, discount_type, discount_value, min_purchase, expiration_date) VALUES (?,?,?,?,?)";
    db.run(sql, [code.toUpperCase(), discount_type, discount_value, min_purchase, expiration_date], function (err) {
        if (err) return res.status(400).json({ error: "Code likely exists already" });
        res.json({ message: "success", id: this.lastID });
    });
});

app.delete('/api/admin/coupons/:id', (req, res) => {
    db.run("DELETE FROM coupons WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "deleted" });
    });
});

// Get Platform Stats with Growth
app.get('/api/stats', async (req, res) => {
    const getCount = (table, where = '') => {
        return new Promise((resolve) => {
            db.get(`SELECT COUNT(*) as count FROM ${table} ${where}`, [], (err, row) => resolve(row ? row.count : 0));
        });
    };

    const getRevenue = (where = '') => {
        return new Promise((resolve) => {
            db.get(`SELECT SUM(total) as revenue FROM orders ${where}`, [], (err, row) => resolve(row ? row.revenue || 0 : 0));
        });
    };

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = startOfCurrentMonth; // Start of current is end of last

    try {
        // 1. Users
        const totalUsers = await getCount('users');
        const currentMonthUsers = await getCount('users', `WHERE created_at >= '${startOfCurrentMonth}'`);
        const lastMonthUsers = await getCount('users', `WHERE created_at >= '${startOfLastMonth}' AND created_at < '${endOfLastMonth}'`);

        // 2. Products
        const totalProducts = await getCount('products');
        const currentMonthProducts = await getCount('products', `WHERE created_at >= '${startOfCurrentMonth}'`);
        const lastMonthProducts = await getCount('products', `WHERE created_at >= '${startOfLastMonth}' AND created_at < '${endOfLastMonth}'`);

        // 3. Orders
        const totalOrders = await getCount('orders');
        const currentMonthOrders = await getCount('orders', `WHERE date >= '${startOfCurrentMonth}'`);
        const lastMonthOrders = await getCount('orders', `WHERE date >= '${startOfLastMonth}' AND date < '${endOfLastMonth}'`);

        // 4. Revenue
        const totalRevenue = await getRevenue();
        const currentMonthRevenue = await getRevenue(`WHERE date >= '${startOfCurrentMonth}'`);
        const lastMonthRevenue = await getRevenue(`WHERE date >= '${startOfLastMonth}' AND date < '${endOfLastMonth}'`);

        const calculateGrowth = (current, last) => {
            if (last === 0) return current > 0 ? '+100%' : '0%';
            const percent = ((current - last) / last) * 100;
            return (percent > 0 ? '+' : '') + percent.toFixed(1) + '%';
        };

        res.json({
            "message": "success",
            "data": {
                users: totalUsers,
                usersChange: calculateGrowth(currentMonthUsers, lastMonthUsers),

                products: totalProducts,
                productsChange: calculateGrowth(currentMonthProducts, lastMonthProducts),

                orders: totalOrders,
                ordersChange: calculateGrowth(currentMonthOrders, lastMonthOrders),

                revenue: totalRevenue,
                revenueChange: calculateGrowth(currentMonthRevenue, lastMonthRevenue)
            }
        });

    } catch (err) {
        res.status(500).json({ "error": err.message });
    }
});

// --- Order Routes ---

// Create Order (Updated with Payment)
app.post('/api/orders', (req, res) => {
    const { user_id, items, total, payment_method, shipping_address } = req.body;

    const insertOrder = "INSERT INTO orders (user_id, total, status, payment_method, payment_status, shipping_address) VALUES (?,?,?,?,?,?)";
    const status = 'Processing';
    const payment_status = 'Paid'; // Simulating successful payment

    db.run(insertOrder, [user_id, total, status, payment_method, payment_status, shipping_address], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        const orderId = this.lastID;

        // Notify Seller (Demo: Notify User ID 2 - the default seller)
        const notifySeller = "INSERT INTO notifications (user_id, message) VALUES (?,?)";
        db.run(notifySeller, [2, `New Order #${orderId} Received!`]);

        const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)");
        const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

        items.forEach(item => {
            insertItem.run(orderId, item.product_id, item.quantity, item.price);
            updateStock.run(item.quantity, item.product_id); // Decrement stock
        });
        insertItem.finalize();
        updateStock.finalize();

        res.json({
            "message": "success",
            "orderId": orderId
        });
    });
});

// Update Order (Logistics)
app.patch('/api/orders/:id', (req, res) => {
    const { status, tracking_id, courier_name, estimated_delivery } = req.body;
    let sql = "UPDATE orders SET status = ?";
    const params = [status];

    if (tracking_id) { sql += ", tracking_id = ?"; params.push(tracking_id); }
    if (courier_name) { sql += ", courier_name = ?"; params.push(courier_name); }
    if (estimated_delivery) { sql += ", estimated_delivery = ?"; params.push(estimated_delivery); }

    sql += " WHERE id = ?";
    params.push(req.params.id);

    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "updated" });
    });
});


// Get User Orders (Alias for compatibility)
app.get('/api/orders/user/:userId', (req, res) => {
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC";
    db.all(sql, [req.params.userId], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": rows });
    });
});

// Get User Orders
app.get('/api/orders/:userId', (req, res) => {
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC";
    db.all(sql, [req.params.userId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Admin Analytics
app.get('/api/admin/analytics', (req, res) => {
    const categorySql = `
        SELECT p.category, COUNT(oi.id) as count, SUM(oi.price) as revenue 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        GROUP BY p.category
    `;

    const topProductsSql = `
        SELECT p.title, COUNT(oi.id) as sold, SUM(oi.price) as revenue 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        GROUP BY p.id 
        ORDER BY sold DESC 
        LIMIT 5
    `;

    const categoryPromise = new Promise((resolve, reject) => {
        db.all(categorySql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    const topProductsPromise = new Promise((resolve, reject) => {
        db.all(topProductsSql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    Promise.all([categoryPromise, topProductsPromise])
        .then(([categories, topProducts]) => {
            res.json({
                message: "success",
                data: {
                    salesByCategory: categories,
                    topProducts: topProducts
                }
            });
        })
        .catch(err => {
            res.status(400).json({ error: err.message });
        });
});

// Get Seller Orders (Orders containing seller's products)
app.get('/api/orders/seller/:sellerId', (req, res) => {
    const sql = `
        SELECT o.*, 
               json_group_array(json_object(
                   'product_id', p.id,
                   'title', p.title,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'image', p.image
               )) as items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.seller_id = ?
        GROUP BY o.id
        ORDER BY o.date DESC
    `;

    // SQLite's json_group_array might differ in older versions, but let's try standard approach or do two queries.
    // Given the environment, let's stick to a simpler JOIN and process in JS if needed, OR simplify the query.
    // Let's try the JOIN and fetch distinct orders, then items.
    // Actually, simpler: Get distinct orders first.

    const orderSql = `
        SELECT DISTINCT o.*, u.name as customer_name, u.email as customer_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.seller_id = ?
        ORDER BY o.date DESC
    `;

    db.all(orderSql, [req.params.sellerId], (err, orders) => {
        if (err) return res.status(400).json({ "error": err.message });

        // For each order, find the relevant items for this seller
        // This is N+1 but safe for small scale. 
        // A better way: Fetch all items for these orders and filter in memory.

        // Let's iterate and fetch items for each order that belong to this seller
        const promises = orders.map(order => new Promise((resolve) => {
            const itemSql = `
                SELECT oi.*, p.title, p.image 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ? AND p.seller_id = ?
            `;
            db.all(itemSql, [order.id, req.params.sellerId], (err, items) => {
                order.items = items || [];
                resolve(order);
            });
        }));

        Promise.all(promises).then(fullOrders => {
            res.json({ "message": "success", "data": fullOrders });
        });
    });
});

// Get Single Order Detail
app.get('/api/orders/detail/:id', (req, res) => {
    const orderSql = "SELECT * FROM orders WHERE id = ?";
    const itemsSql = `
        SELECT oi.*, p.title, p.image 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    `;

    db.get(orderSql, [req.params.id], (err, order) => {
        if (err) return res.status(400).json({ "error": err.message });
        if (!order) return res.status(404).json({ "error": "Order not found" });

        db.all(itemsSql, [req.params.id], (err, items) => {
            if (err) return res.status(400).json({ "error": err.message });
            res.json({ "message": "success", "data": { ...order, items } });
        });
    });
});

// --- Admin Routes ---

// Get all users (Admin only)
app.get('/api/admin/users', (req, res) => {
    // In real app, add middleware to check if req.user.role === 'admin'
    const sql = "SELECT id, name, email, role, address, city FROM users ORDER BY id DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": rows });
    });
});

// Delete user (Admin only)
app.delete('/api/admin/users/:id', (req, res) => {
    const sql = "DELETE FROM users WHERE id = ?";
    db.run(sql, [req.params.id], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// --- Review Routes ---

// Add Review
app.post('/api/reviews', (req, res) => {
    const { user_id, product_id, rating, comment, image } = req.body;

    // Check for existing review
    db.get("SELECT id FROM reviews WHERE user_id = ? AND product_id = ?", [user_id, product_id], (err, row) => {
        if (err) return res.status(400).json({ "error": err.message });
        if (row) return res.status(400).json({ "error": "You have already reviewed this product." });

        const sql = "INSERT INTO reviews (user_id, product_id, rating, comment, image) VALUES (?,?,?,?,?)";
        db.run(sql, [user_id, product_id, rating, comment, image || ''], function (err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({ "message": "success", "id": this.lastID });
        });
    });
});


// Update Review
app.put('/api/reviews', (req, res) => {
    const { user_id, product_id, rating, comment, image } = req.body;
    let sql, params;

    if (image !== undefined) {
        sql = "UPDATE reviews SET rating = ?, comment = ?, image = ?, date = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?";
        params = [rating, comment, image, user_id, product_id];
    } else {
        sql = "UPDATE reviews SET rating = ?, comment = ?, date = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?";
        params = [rating, comment, user_id, product_id];
    }

    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        if (this.changes === 0) return res.status(404).json({ "error": "Review not found" });
        res.json({ "message": "success" });
    });
});

// Get Reviews for Product
app.get('/api/reviews/:productId', (req, res) => {
    const sql = `
        SELECT r.*, u.name as user_name 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.product_id = ? 
        ORDER BY r.date DESC
    `;
    db.all(sql, [req.params.productId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": rows });
    });
});

// --- Wishlist Routes ---

// Toggle Wishlist (Add or Remove)
app.post('/api/wishlist', (req, res) => {
    const { user_id, product_id } = req.body;

    // Check if exists
    db.get("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?", [user_id, product_id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        if (row) {
            // Exists -> Remove
            db.run("DELETE FROM wishlist WHERE id = ?", [row.id], function (err) {
                if (err) res.status(400).json({ "error": err.message });
                else res.json({ "message": "removed" });
            });
        } else {
            // Not Exists -> Add
            db.run("INSERT INTO wishlist (user_id, product_id) VALUES (?,?)", [user_id, product_id], function (err) {
                if (err) res.status(400).json({ "error": err.message });
                else res.json({ "message": "added" });
            });
        }
    });
});

// Get User Wishlist
app.get('/api/wishlist/:userId', (req, res) => {
    const sql = `
        SELECT p.* 
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ?
    `;
    db.all(sql, [req.params.userId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "data": rows });
    });
});
// --- Notification Routes ---

app.get('/api/notifications/:userId', (req, res) => {
    db.all("SELECT * FROM notifications WHERE user_id = ? ORDER BY date DESC", [req.params.userId], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": rows });
    });
});

app.patch('/api/notifications/read/:id', (req, res) => {
    db.run("UPDATE notifications SET is_read = 1 WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "marked read" });
    });
});

// Validate Coupon
// Validate Coupon (Removed hardcoded version)

app.get('/api/debug/seed-coupons', (req, res) => {
    const coupons = [
        { code: 'WELCOME10', type: 'percent', val: 10, min: 0 },
        { code: 'SAVE20', type: 'percent', val: 20, min: 50 }
    ];
    let results = [];
    coupons.forEach(c => {
        db.run("INSERT OR IGNORE INTO coupons (code, discount_type, discount_value, min_purchase) VALUES (?,?,?,?)",
            [c.code, c.type, c.val, c.min], function (err) {
                if (!err) results.push(`Added ${c.code}`);
            });
    });
    setTimeout(() => res.json({ message: "Seeding attempted", results }), 500);
});

// Forgot Password (Generate Token)
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) return res.status(500).json({ "error": err.message });
        if (!user) return res.status(404).json({ "error": "User not found" });

        // Generate simple token (in production use crypto)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

        db.run("INSERT INTO password_resets (email, token, expires_at) VALUES (?,?,?)", [email, token, expiresAt], (err) => {
            if (err) return res.status(500).json({ "error": err.message });

            // In a real app, SEND EMAIL here.
            // For now, return token for demo purposes (or log it)
            console.log(`[DEMO] Reset Token for ${email}: ${token}`);
            res.json({ "message": "success", "demo_token": token });
        });
    });
});

// Reset Password
app.post('/api/reset-password', (req, res) => {
    const { token, newPassword } = req.body;

    db.get("SELECT * FROM password_resets WHERE token = ?", [token], (err, row) => {
        if (err) return res.status(500).json({ "error": err.message });
        if (!row) return res.status(400).json({ "error": "Invalid or expired token" });

        if (new Date(row.expires_at) < new Date()) {
            return res.status(400).json({ "error": "Token expired" });
        }

        // Update User Password
        db.run("UPDATE users SET password = ? WHERE email = ?", [newPassword, row.email], (err) => {
            if (err) return res.status(500).json({ "error": err.message });

            // Delete used token
            db.run("DELETE FROM password_resets WHERE token = ?", [token]);
            res.json({ "message": "success" });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

