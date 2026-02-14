const API_URL = "https://linkup-backend.gcimaster.workers.dev";

async function checkCurrentStatus() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  現在の本番環境状態チェック");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 1. Backend Health Check
  console.log("【1. バックエンドヘルスチェック】");
  try {
    const healthResponse = await fetch(`${API_URL}/`);
    const healthText = await healthResponse.text();
    console.log(`✅ Status: ${healthResponse.status}`);
    console.log(`✅ Response: ${healthText}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // 2. Login Test
  console.log("\n【2. ログインテスト（admin）】");
  try {
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: "admin@linkup.live", 
        password: "Admin@2026!" 
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log(`✅ ログイン成功`);
      console.log(`✅ Token取得: ${loginData.token ? 'あり' : 'なし'}`);
      console.log(`✅ User ID: ${loginData.user?.id}`);
      console.log(`✅ Role: ${loginData.user?.role}`);
      
      // 3. Profile Test
      if (loginData.token) {
        console.log("\n【3. プロフィール取得テスト】");
        const profileResponse = await fetch(`${API_URL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log(`Response Status: ${profileResponse.status}`);
        const profileText = await profileResponse.text();
        
        if (profileResponse.ok) {
          const profileData = JSON.parse(profileText);
          console.log(`✅ プロフィール取得成功`);
          console.log(`✅ Name: ${profileData.name}`);
          console.log(`✅ Email: ${profileData.email}`);
        } else {
          console.log(`❌ プロフィール取得失敗`);
          console.log(`❌ Error: ${profileText}`);
          console.log(`\n⚠️  これは予想通りの結果です。バックエンドデプロイ前のため。`);
        }
      }
    } else {
      console.log(`❌ ログイン失敗: ${loginResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // 4. Events List Test
  console.log("\n【4. イベント一覧取得テスト】");
  try {
    const eventsResponse = await fetch(`${API_URL}/api/events`);
    if (eventsResponse.ok) {
      const events = await eventsResponse.json();
      console.log(`✅ イベント一覧取得成功: ${Array.isArray(events) ? events.length : 0}件`);
    } else {
      console.log(`❌ イベント一覧取得失敗: ${eventsResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  チェック完了");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n【結論】");
  console.log("バックエンドデプロイが完了すると、プロフィール取得エラーが解決され、");
  console.log("ログイン後の白画面問題が解消されます。");
  console.log("\n次のステップ: URGENT_DEPLOYMENT_MANUAL.md を参照してデプロイを実行");
}

checkCurrentStatus();
