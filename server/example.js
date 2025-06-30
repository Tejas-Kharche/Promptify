const axios = require('axios');
require('dotenv').config();

async function testRefreshToken() {
  const tokenEndpoint = 'https://accounts.spotify.com/api/token';
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post(tokenEndpoint,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log("✅ Access token received:");
    console.log(response.data);
  } catch (err) {
    console.error("❌ Error refreshing token:");
    console.error(err.response?.data || err.message);
  }
}

testRefreshToken();
