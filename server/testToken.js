const axios = require('axios');
require('dotenv').config();

// Import your refreshAccessToken function from the helper
const { refreshAccessToken } = require('./utils/spotifyHelper');

async function testToken() {
  try {
    // Step 1: Refresh the token
    const accessToken = await refreshAccessToken();

    // Step 2: Use the token to call the "Get Current User's Profile" endpoint
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log('✅ Token works! User info:');
    console.log(response.data);
  } catch (error) {
    console.error('❌ Token test failed:', error.response?.data || error.message);
  }
}

testToken();
