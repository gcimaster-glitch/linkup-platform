const API_URL = "https://linkup-backend.gcimaster.workers.dev";

async function testLogin(email, password, role) {
  console.log(`\n========== Testing ${role} login: ${email} ==========`);
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ ${role} login successful`);
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Name: ${data.user.name}`);
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Token: ${data.token.substring(0, 30)}...`);
      return { success: true, token: data.token, user: data.user };
    } else {
      console.log(`❌ ${role} login failed`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log(`❌ ${role} login error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testProfileAccess(token, userId, role) {
  console.log(`\n---------- Testing ${role} profile access ----------`);
  
  try {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${role} profile access successful`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Role: ${data.role}`);
      return { success: true, profile: data };
    } else {
      console.log(`❌ ${role} profile access failed`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log(`❌ ${role} profile access error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log("Starting comprehensive login tests...\n");
  
  const testAccounts = [
    { email: "admin@linkup.live", password: "Admin@2026!", role: "admin" },
    { email: "organizer@linkup.live", password: "Organizer@2026!", role: "organizer" },
    { email: "user@linkup.live", password: "User@2026!", role: "user" }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const account of testAccounts) {
    const loginResult = await testLogin(account.email, account.password, account.role);
    
    if (loginResult.success) {
      passedTests++;
      
      // Test profile access
      const profileResult = await testProfileAccess(loginResult.token, loginResult.user.id, account.role);
      if (profileResult.success) {
        passedTests++;
      } else {
        failedTests++;
      }
    } else {
      failedTests++;
    }
  }
  
  console.log("\n========================================");
  console.log("TEST SUMMARY");
  console.log("========================================");
  console.log(`Total tests: ${passedTests + failedTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
  console.log("========================================\n");
}

runAllTests();
