const API_URL = "https://linkup-backend.gcimaster.workers.dev";

async function testProfileWithDebug() {
  console.log('=== ログインテスト ===');
  const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: "admin@linkup.live", 
      password: "Admin@2026!" 
    })
  });

  const loginData = await loginResponse.json();
  console.log('Login response status:', loginResponse.status);
  console.log('Login response data:', JSON.stringify(loginData, null, 2));
  
  if (!loginData.token) {
    console.error('トークンが取得できませんでした');
    return;
  }
  
  const token = loginData.token;
  console.log('\nToken length:', token.length);
  console.log('Token first 50 chars:', token.substring(0, 50));
  
  console.log('\n=== プロフィール取得テスト ===');
  const profileResponse = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  console.log('Profile response status:', profileResponse.status);
  console.log('Profile response headers:', JSON.stringify([...profileResponse.headers], null, 2));
  
  const profileText = await profileResponse.text();
  console.log('Profile response raw text:', profileText);
  
  try {
    const profileData = JSON.parse(profileText);
    console.log('Profile response parsed:', JSON.stringify(profileData, null, 2));
  } catch (e) {
    console.error('JSON parse error:', e.message);
    console.log('First 200 chars of response:', profileText.substring(0, 200));
  }
}

testProfileWithDebug();
