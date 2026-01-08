const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/products',
    method: 'HEAD'
};

const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
});

req.on('error', (e) => console.error(e));
req.end();
