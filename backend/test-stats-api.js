const axios = require('axios');
const jwt = require('jsonwebtoken');

// Test API với user thực
async function testStatsAPI() {
  try {
    // Tạo token cho user admin
    const token = jwt.sign(
      { userId: '687090195db33369294a3484' },
      'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '1h' }
    );

    console.log('🔍 Testing /api/users/stats with token:', token.substring(0, 20) + '...');

    const response = await axios.get('http://localhost:5000/api/users/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Response:', response.data);
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
  }
}

testStatsAPI(); 