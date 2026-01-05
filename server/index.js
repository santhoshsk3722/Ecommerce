const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Products Routes ---

// Get all products (with search and filter)
app.get('/api/products', (req, res) => {
    let sql = "SELECT * FROM products";
    const params = [];
    const { search, category } = req.query;

    if (search || category) {
        sql += " WHERE 1=1";
        if (search) {
            sql += " AND (title LIKE ? OR description LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            sql += " AND category = ?";
            params.push(category);
        }
    }

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
            // Return role in user object
            res.json({ "message": "success", "user": { id: row.id, name: row.name, email: row.email, role: row.role } });
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
    const { title, price, description, category, image, seller_id } = req.body;
    const rating = 0; // New products start with 0 rating
    const sql = "INSERT INTO products (title, price, description, category, image, rating, seller_id) VALUES (?,?,?,?,?,?,?)";

    db.run(sql, [title, price, description, category, image, rating, seller_id], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success", "id": this.lastID });
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

// Create Order
app.post('/api/orders', (req, res) => {
    const { user_id, items, total } = req.body; // items: [{product_id, quantity, price}]

    // 1. Create Order
    const insertOrder = "INSERT INTO orders (user_id, total, status) VALUES (?,?,?)";
    const status = 'Processing'; // Default status
    db.run(insertOrder, [user_id, total, status], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        const orderId = this.lastID;

        // 2. Insert Items (Simplified, no transaction safety in this basic snippet but works for demo)
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

