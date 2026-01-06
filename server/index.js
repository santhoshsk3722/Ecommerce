const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Payment Routes ---
app.post('/api/create-payment-intent', async (req, res) => {
    const { amount, currency = 'usd' } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            automatic_payment_methods: { enabled: true },
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
    const { search, category, page = 1, limit = 100, excludeId } = req.query;
    const offset = (page - 1) * limit;

    if (search || category || excludeId) {
        sql += " WHERE 1=1";
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
app.get('/api/products/:id', (req, res) => {
    const sql = "SELECT * FROM products WHERE id = ?";
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
                    country: row.country
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

// --- Seller Routes ---

// Add Product (Seller only - simplified check, ideally verified by token)
app.post('/api/products', (req, res) => {
    const { title, price, description, category, image, seller_id, stock } = req.body;
    const rating = 0; // New products start with 0 rating
    const stockValue = stock !== undefined ? stock : 10; // Default stock
    const sql = "INSERT INTO products (title, price, description, category, image, rating, seller_id, stock) VALUES (?,?,?,?,?,?,?,?)";

    db.run(sql, [title, price, description, category, image, rating, seller_id, stockValue], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "id": this.lastID });
    });
});

// Edit Product (Seller)
app.put('/api/products/:id', (req, res) => {
    const { title, price, description, category, image, stock } = req.body;
    const sql = "UPDATE products SET title = ?, price = ?, description = ?, category = ?, image = ?, stock = ? WHERE id = ?";

    db.run(sql, [title, price, description, category, image, stock, req.params.id], function (err) {
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
    const { name, address, city, zip, country } = req.body;
    const sql = "UPDATE users SET name = ?, address = ?, city = ?, zip = ?, country = ? WHERE id = ?";

    db.run(sql, [name, address, city, zip, country, req.params.id], function (err) {
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

// Get Platform Stats
app.get('/api/stats', (req, res) => {
    const stats = {};
    // Parallel queries (simplified callback hell for demo, assume standard nesting)
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        stats.users = row.count;
        db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
            stats.products = row.count;
            db.get("SELECT COUNT(*) as count FROM orders", (err, row) => {
                stats.orders = row.count;
                db.get("SELECT SUM(total) as revenue FROM orders", (err, row) => {
                    stats.revenue = row.revenue || 0;
                    res.json({ "message": "success", "data": stats });
                });
            });
        });
    });
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
        items.forEach(item => {
            insertItem.run(orderId, item.product_id, item.quantity, item.price);
        });
        insertItem.finalize();

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

// --- Review Routes ---

// Add Review
app.post('/api/reviews', (req, res) => {
    const { user_id, product_id, rating, comment } = req.body;
    const sql = "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?,?,?,?)";
    db.run(sql, [user_id, product_id, rating, comment], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "id": this.lastID });
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
app.post('/api/validate-coupon', (req, res) => {
    const { code } = req.body;
    const coupons = {
        'SAVE10': 10,
        'WELCOME20': 20,
        'OFF5': 5
    };

    if (coupons[code]) {
        res.json({
            "message": "success",
            "valid": true,
            "discountType": "percent",
            "value": coupons[code]
        });
    } else {
        res.status(400).json({ "message": "Invalid or expired coupon" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

