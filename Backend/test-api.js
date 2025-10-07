#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing JobLink API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test job categories
    console.log('\n2. Testing job categories...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/jobs/categories`);
    console.log('✅ Job categories:', categoriesResponse.data.data.categories.length, 'categories found');

    // Test featured jobs
    console.log('\n3. Testing featured jobs...');
    const featuredResponse = await axios.get(`${API_BASE_URL}/jobs/featured`);
    console.log('✅ Featured jobs:', featuredResponse.data.data.jobs.length, 'jobs found');

    // Test job search
    console.log('\n4. Testing job search...');
    const searchResponse = await axios.get(`${API_BASE_URL}/jobs?limit=5`);
    console.log('✅ Job search:', searchResponse.data.data.jobs.length, 'jobs found');

    // Test company industries
    console.log('\n5. Testing company industries...');
    const industriesResponse = await axios.get(`${API_BASE_URL}/companies/industries`);
    console.log('✅ Company industries:', industriesResponse.data.data.industries.length, 'industries found');

    console.log('\n🎉 All API tests passed!');
    console.log('\nAPI is working correctly. You can now:');
    console.log('- Register users: POST /api/auth/register');
    console.log('- Login users: POST /api/auth/login');
    console.log('- Search jobs: GET /api/jobs');
    console.log('- Apply for jobs: POST /api/applications');
    console.log('- And much more!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Check if axios is available
try {
  require.resolve('axios');
  testAPI();
} catch (error) {
  console.log('📦 Installing axios for testing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ Axios installed, running tests...');
    testAPI();
  } catch (installError) {
    console.error('❌ Failed to install axios:', installError.message);
    console.log('\nTo test the API manually:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Visit: http://localhost:5000/api/health');
    console.log('3. Use Postman or curl to test endpoints');
  }
}
