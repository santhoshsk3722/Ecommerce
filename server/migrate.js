const db = require('./db');

const serializePromise = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                // Ignore "duplicate column name" error if migration ran twice
                if (err.message.includes('duplicate column name')) {
                    resolve(this);
                } else {
                    reject(err);
                }
            }
            else resolve(this);
        });
    });
};

const migrate = async () => {
    console.log('🔄 Running migration...');
    try {
        // Users: Add address fields
        try {
            await serializePromise(`ALTER TABLE users ADD COLUMN address TEXT`);
            console.log('✅ Added address to users');
        } catch (e) { } // Catch duplicate column errors silently

        try {
            await serializePromise(`ALTER TABLE users ADD COLUMN city TEXT`);
            console.log('✅ Added city to users');
        } catch (e) { }

        try {
            await serializePromise(`ALTER TABLE users ADD COLUMN zip TEXT`);
            console.log('✅ Added zip to users');
        } catch (e) { }

        try {
            await serializePromise(`ALTER TABLE users ADD COLUMN country TEXT`);
            console.log('✅ Added country to users');
        } catch (e) { }

        // Orders: Add shipping address
        try {
            await serializePromise(`ALTER TABLE orders ADD COLUMN shipping_address TEXT`);
            console.log('✅ Added shipping_address to orders');
        } catch (e) { }

        console.log('✅ Migration complete!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        db.close();
    }
};

migrate();
