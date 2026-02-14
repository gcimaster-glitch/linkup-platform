const API_URL = "https://linkup-backend.gcimaster.workers.dev";

// テスト結果を保存
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

function log(message, type = 'info') {
  const prefix = {
    'info': 'ℹ️',
    'success': '✅',
    'error': '❌',
    'warning': '⚠️'
  }[type];
  console.log(`${prefix} ${message}`);
}

// 1. ログインテスト
async function testLogin(email, password, role) {
  console.log(`\n========== ${role}ログインテスト: ${email} ==========`);
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok && data.success && data.token) {
      log(`${role} ログイン成功`, 'success');
      log(`  User ID: ${data.user.id}`);
      log(`  Name: ${data.user.name}`);
      log(`  Role: ${data.user.role}`);
      testResults.passed.push(`${role} login`);
      return { success: true, token: data.token, user: data.user };
    } else {
      log(`${role} ログイン失敗: ${data.error || 'Unknown error'}`, 'error');
      testResults.failed.push(`${role} login: ${data.error}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    log(`${role} ログインエラー: ${error.message}`, 'error');
    testResults.failed.push(`${role} login: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 2. プロフィール取得テスト
async function testProfileFetch(token, role) {
  console.log(`\n---------- ${role}プロフィール取得テスト ----------`);
  
  try {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (response.ok && data.id) {
      log(`${role} プロフィール取得成功`, 'success');
      log(`  Name: ${data.name}`);
      log(`  Email: ${data.email}`);
      log(`  Role: ${data.role}`);
      log(`  Avatar: ${data.avatar_url ? '✅' : '❌'}`);
      testResults.passed.push(`${role} profile fetch`);
      return { success: true, profile: data };
    } else {
      log(`${role} プロフィール取得失敗: ${data.error || 'Unknown error'}`, 'error');
      testResults.failed.push(`${role} profile fetch: ${data.error}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    log(`${role} プロフィール取得エラー: ${error.message}`, 'error');
    testResults.failed.push(`${role} profile fetch: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 3. イベント一覧取得テスト
async function testEventsList() {
  console.log(`\n========== イベント一覧取得テスト ==========`);
  
  try {
    const response = await fetch(`${API_URL}/api/events`);
    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      log(`イベント一覧取得成功: ${data.length}件`, 'success');
      testResults.passed.push('events list');
      return { success: true, events: data };
    } else {
      log(`イベント一覧取得失敗`, 'error');
      testResults.failed.push('events list');
      return { success: false };
    }
  } catch (error) {
    log(`イベント一覧取得エラー: ${error.message}`, 'error');
    testResults.failed.push(`events list: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 4. ユーザー注文履歴取得テスト
async function testOrderHistory(token, role) {
  console.log(`\n---------- ${role}注文履歴取得テスト ----------`);
  
  try {
    const response = await fetch(`${API_URL}/api/user/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      log(`${role} 注文履歴取得成功: ${Array.isArray(data) ? data.length : 0}件`, 'success');
      testResults.passed.push(`${role} order history`);
      return { success: true, orders: data };
    } else {
      log(`${role} 注文履歴取得失敗`, 'warning');
      testResults.warnings.push(`${role} order history: endpoint may not exist`);
      return { success: false };
    }
  } catch (error) {
    log(`${role} 注文履歴取得エラー: ${error.message}`, 'warning');
    testResults.warnings.push(`${role} order history: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 5. オーガナイザーイベント一覧テスト (organizer only)
async function testOrganizerEvents(token) {
  console.log(`\n---------- オーガナイザーイベント一覧テスト ----------`);
  
  try {
    const response = await fetch(`${API_URL}/api/organizer/events`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      log(`オーガナイザーイベント一覧取得成功: ${Array.isArray(data) ? data.length : 0}件`, 'success');
      testResults.passed.push('organizer events list');
      return { success: true, events: data };
    } else {
      log(`オーガナイザーイベント一覧取得失敗`, 'warning');
      testResults.warnings.push('organizer events list: endpoint may not exist');
      return { success: false };
    }
  } catch (error) {
    log(`オーガナイザーイベント一覧取得エラー: ${error.message}`, 'warning');
    testResults.warnings.push(`organizer events list: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// テストサマリー表示
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('テスト結果サマリー');
  console.log('='.repeat(60));
  
  const total = testResults.passed.length + testResults.failed.length + testResults.warnings.length;
  const passRate = total > 0 ? Math.round((testResults.passed.length / total) * 100) : 0;
  
  console.log(`\n📊 統計:`);
  console.log(`  合計テスト数: ${total}`);
  console.log(`  ✅ 合格: ${testResults.passed.length}`);
  console.log(`  ❌ 不合格: ${testResults.failed.length}`);
  console.log(`  ⚠️  警告: ${testResults.warnings.length}`);
  console.log(`  成功率: ${passRate}%`);
  
  if (testResults.passed.length > 0) {
    console.log(`\n✅ 合格したテスト:`);
    testResults.passed.forEach(test => console.log(`  - ${test}`));
  }
  
  if (testResults.failed.length > 0) {
    console.log(`\n❌ 不合格のテスト:`);
    testResults.failed.forEach(test => console.log(`  - ${test}`));
  }
  
  if (testResults.warnings.length > 0) {
    console.log(`\n⚠️  警告:`);
    testResults.warnings.forEach(test => console.log(`  - ${test}`));
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (testResults.failed.length === 0) {
    console.log('🎉 全テスト合格！');
  } else {
    console.log('⚠️  一部のテストが失敗しました。');
  }
  console.log('='.repeat(60) + '\n');
}

// メインテスト実行
async function runAllTests() {
  console.log('🚀 LinkUp Platform 統合テスト開始');
  console.log('API URL:', API_URL);
  console.log('テスト日時:', new Date().toLocaleString('ja-JP'));
  
  const testAccounts = [
    { email: "admin@linkup.live", password: "Admin@2026!", role: "admin" },
    { email: "organizer@linkup.live", password: "Organizer@2026!", role: "organizer" },
    { email: "user@linkup.live", password: "User@2026!", role: "user" }
  ];
  
  // イベント一覧取得テスト（認証不要）
  await testEventsList();
  
  // 各ロールでテスト
  for (const account of testAccounts) {
    const loginResult = await testLogin(account.email, account.password, account.role);
    
    if (loginResult.success) {
      // プロフィール取得テスト
      await testProfileFetch(loginResult.token, account.role);
      
      // 注文履歴取得テスト
      await testOrderHistory(loginResult.token, account.role);
      
      // オーガナイザー専用テスト
      if (account.role === 'organizer') {
        await testOrganizerEvents(loginResult.token);
      }
    }
  }
  
  printSummary();
}

// テスト実行
runAllTests().catch(error => {
  console.error('テスト実行中に予期しないエラーが発生しました:', error);
  process.exit(1);
});
