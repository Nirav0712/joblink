// Test script to verify user type validation in login
const API_BASE_URL = 'http://localhost:5000/api';

async function testUserTypeValidation() {
  console.log('🧪 Testing User Type Validation');
  console.log('================================');

  // Test data
  const testUsers = [
    {
      name: 'John Jobseeker',
      email: 'john@example.com',
      password: 'password123',
      userType: 'jobseeker'
    },
    {
      name: 'Jane Employer',
      email: 'jane@example.com',
      password: 'password123',
      userType: 'employer'
    }
  ];

  try {
    // Step 1: Register both users
    console.log('\n📝 Step 1: Registering test users...');
    
    for (const user of testUsers) {
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      const registerData = await registerResponse.json();
      if (registerData.success) {
        console.log(`✅ Registered ${user.userType}: ${user.email}`);
      } else {
        console.log(`⚠️ Registration failed for ${user.email}: ${registerData.message}`);
      }
    }

    // Step 2: Test correct login (should work)
    console.log('\n🔑 Step 2: Testing correct user type login...');
    
    const correctLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123',
        userType: 'jobseeker'
      })
    });
    
    const correctLoginData = await correctLoginResponse.json();
    if (correctLoginData.success) {
      console.log('✅ Correct login successful: Jobseeker can login as jobseeker');
    } else {
      console.log('❌ Correct login failed:', correctLoginData.message);
    }

    // Step 3: Test wrong user type login (should fail)
    console.log('\n🚫 Step 3: Testing wrong user type login...');
    
    const wrongLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123',
        userType: 'employer'  // Wrong user type!
      })
    });
    
    const wrongLoginData = await wrongLoginResponse.json();
    if (!wrongLoginData.success) {
      console.log('✅ Wrong login correctly blocked:', wrongLoginData.message);
    } else {
      console.log('❌ Wrong login should have been blocked but succeeded');
    }

    // Step 4: Test employer login
    console.log('\n🏢 Step 4: Testing employer login...');
    
    const employerLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane@example.com',
        password: 'password123',
        userType: 'employer'
      })
    });
    
    const employerLoginData = await employerLoginResponse.json();
    if (employerLoginData.success) {
      console.log('✅ Employer login successful');
    } else {
      console.log('❌ Employer login failed:', employerLoginData.message);
    }

    // Step 5: Test employer trying to login as jobseeker
    console.log('\n🚫 Step 5: Testing employer trying to login as jobseeker...');
    
    const employerWrongResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane@example.com',
        password: 'password123',
        userType: 'jobseeker'  // Wrong user type!
      })
    });
    
    const employerWrongData = await employerWrongResponse.json();
    if (!employerWrongData.success) {
      console.log('✅ Employer wrong login correctly blocked:', employerWrongData.message);
    } else {
      console.log('❌ Employer wrong login should have been blocked but succeeded');
    }

    console.log('\n🎉 User type validation test completed!');
    console.log('\n📋 Summary:');
    console.log('- Jobseekers can only login as jobseekers');
    console.log('- Employers can only login as employers');
    console.log('- Wrong user type logins are blocked');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUserTypeValidation();
