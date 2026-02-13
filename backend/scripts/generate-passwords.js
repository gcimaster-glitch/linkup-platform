// パスワードハッシュ生成スクリプト
// 実行方法: cd backend && node scripts/generate-passwords.js

const bcrypt = require('bcryptjs');

const users = [
    { email: 'admin@linkup.live', password: 'Admin@2026!', role: 'admin' },
    { email: 'organizer@linkup.live', password: 'Organizer@2026!', role: 'organizer' },
    { email: 'user@linkup.live', password: 'User@2026!', role: 'user' }
];

async function generateHashes() {
    console.log('🔐 パスワードハッシュ生成中...\n');
    
    for (const user of users) {
        const hash = await bcrypt.hash(user.password, 10);
        console.log(`${user.role.toUpperCase()} (${user.email})`);
        console.log(`Password: ${user.password}`);
        console.log(`Hash: ${hash}`);
        console.log('---\n');
    }
    
    console.log('✅ 完了！上記のハッシュを0007_create_test_users.sqlに貼り付けてください。\n');
}

generateHashes().catch(console.error);
