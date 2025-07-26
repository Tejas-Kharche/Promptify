const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/login', (req, res) => {
  const scope = 'playlist-read-private';
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const clientId = process.env.SPOTIFY_CLIENT_ID;

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  if (!code) return res.status(400).send('No code provided');

  try {
    const tokenRes = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

    const { access_token, refresh_token } = tokenRes.data;

    console.log('✅ Received Spotify tokens:\n', { access_token, refresh_token });
    res.send(`Access Token: ${access_token}<br>Refresh Token: ${refresh_token}`);
  } catch (err) {
    console.error('❌ Error fetching token:', err.response?.data || err.message);
    res.status(500).send('Error getting token');
  }
});

module.exports = router;
