const axios = require('axios');
require('dotenv').config();

let accessToken = null;

// Refresh token logic
async function refreshAccessToken() {
  const tokenEndpoint = 'https://accounts.spotify.com/api/token';
  const authString = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(
      tokenEndpoint,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
      }),
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    accessToken = response.data.access_token;
    console.log('✅ Spotify token refreshed!');
    return accessToken;
  } catch (error) {
    console.error('❌ Failed to refresh token:', error.response?.data || error.message);
    throw error;
  }
}

// Generic API request handler
async function spotifyRequest(url, params = {}, retries = 1) {
  if (!accessToken) await refreshAccessToken();

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params
    });
    return response.data;
  } catch (error) {
    if ((error.response?.status === 401 || error.response?.status === 403) && retries > 0) {
      console.warn('🔁 Token expired. Refreshing...');
      await refreshAccessToken();
      return spotifyRequest(url, params, retries - 1);
    }
    console.error('❌ Spotify API error:', error.response?.data || error.message);
    throw error;
  }
}

// Mood ➝ Multiple genres ➝ Randomly pick one ➝ Search playlists
async function getPlaylistsByMood(mood) {
  const moodToGenre = {
    happy: ['pop', 'dance', 'funk'],
    sad: ['acoustic', 'blues', 'piano','soul'],
    angry: ['metal', 'hard-rock', 'punk','hip-hop'],
    anxious: ['ambient', 'minimal-techno', 'idm'],
    calm: ['chill', 'classical', 'lo-fi','indie','r-n-b', 'soul'],
    romantic: ['romance'],
    energetic: ['edm', 'electro', 'work-out'],
    nostalgic: ['classical', 'retro'],
    confident: ['hip-hop', 'trap', 'power-pop','punk'],
  };

  const genreOptions = moodToGenre[mood.toLowerCase()] || ['pop'];
  const selectedGenre = genreOptions[Math.floor(Math.random() * genreOptions.length)];
  console.log(`🎶 Selected genre for mood "${mood}": ${selectedGenre}`);

  const searchURL = 'https://api.spotify.com/v1/search';
  const params = {
    q: selectedGenre,
    type: 'playlist',
    limit: 15,
  };

  const data = await spotifyRequest(searchURL, params);
  return data.playlists.items;
}

// Fetch top 5 tracks from a playlist
async function getTopTracksFromPlaylist(playlistId, limit = 5) {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  const params = {
    limit,
    fields: 'items(track(name, artists(name)))'
  };

  const data = await spotifyRequest(url, params);

  return data.items
    .filter(item => item.track && item.track.name && item.track.artists)
    .map(item => {
      const track = item.track;
      return {
        name: track.name,
        artist: track.artists.map(a => a.name).join(', ')
      };
    });
}

module.exports = {
  getPlaylistsByMood,
  getTopTracksFromPlaylist
};
