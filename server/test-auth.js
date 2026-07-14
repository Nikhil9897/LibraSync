const http = require('http');

const data = JSON.stringify({
    name: 'John Doe',
    email: 'john@test.com',
    password: 'Password123'
});

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            console.log('Response JSON:', JSON.stringify(JSON.parse(body), null, 2));
        } catch {
            console.log('Response:', body);
        }
    });
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
