const https = require('https');

const API_URL = 'https://linkup-backend.gcimaster.workers.dev';

// Test login
async function testLogin() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            email: 'user@linkup.live',
            password: 'User1234!'
        });

        const options = {
            hostname: 'linkup-backend.gcimaster.workers.dev',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('✅ Login successful');
                    console.log('User:', response.user);
                    console.log('Token:', response.token ? 'Present' : 'Missing');
                    resolve(response);
                } catch (e) {
                    console.error('❌ Failed to parse response:', data);
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Test profile API
async function testProfile(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'linkup-backend.gcimaster.workers.dev',
            port: 443,
            path: '/api/auth/profile',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('\n✅ Profile API response:');
                    console.log(JSON.stringify(response, null, 2));
                    resolve(response);
                } catch (e) {
                    console.error('❌ Failed to parse profile response:', data);
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Test orders API
async function testOrders(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'linkup-backend.gcimaster.workers.dev',
            port: 443,
            path: '/api/orders',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log(`\n📦 Orders API Status: ${res.statusCode}`);
                try {
                    const response = JSON.parse(data);
                    console.log('Orders count:', response.orders ? response.orders.length : 0);
                    resolve(response);
                } catch (e) {
                    console.error('❌ Failed to parse orders response:', data);
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Test payment history API
async function testPaymentHistory(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'linkup-backend.gcimaster.workers.dev',
            port: 443,
            path: '/api/user/payment-history',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log(`\n💳 Payment History API Status: ${res.statusCode}`);
                if (res.statusCode === 404) {
                    console.log('⚠️  Payment history endpoint not found (expected, will fallback to orders)');
                } else {
                    try {
                        const response = JSON.parse(data);
                        console.log('Response:', response);
                        resolve(response);
                    } catch (e) {
                        console.error('❌ Failed to parse payment history response:', data);
                        reject(e);
                    }
                }
                resolve(null);
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// Run tests
async function runTests() {
    console.log('🧪 Testing LinkUp Backend API\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
        // Test 1: Login
        console.log('【1】Login Test');
        const loginResult = await testLogin();
        
        if (!loginResult.token) {
            console.error('❌ No token received from login');
            return;
        }
        
        // Test 2: Profile
        console.log('\n【2】Profile API Test');
        await testProfile(loginResult.token);
        
        // Test 3: Orders
        console.log('\n【3】Orders API Test');
        await testOrders(loginResult.token);
        
        // Test 4: Payment History
        console.log('\n【4】Payment History API Test');
        await testPaymentHistory(loginResult.token);
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ All tests completed');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

runTests();
