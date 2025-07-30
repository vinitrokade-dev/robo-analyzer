const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend connection...');
    
    // Test if server is running
    const response = await axios.get('http://localhost:5000/api/community');
    console.log('✅ Backend is running!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log('Error:', error.message);
    console.log('\nTo start the backend:');
    console.log('1. cd backend');
    console.log('2. npm start');
  }
}

testBackend(); 