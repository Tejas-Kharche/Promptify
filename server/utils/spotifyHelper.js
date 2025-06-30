const axios = require('axios');
require('dotenv').config();

// Configuration
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MIN_TRACKS = 10;

let accessToken = null;

// ========================
// 1. SPOTIFY CONFIGURATION
// ========================

// Valid Spotify genres (documented in their API)
const VALID_GENRES = [
  'acoustic', 'ambient', 'blues', 'classical', 'country',
  'dance', 'electronic', 'hip-hop', 'jazz', 'pop',
  'r-n-b', 'rock', 'soul', 'indie', 'alternative'
];

// Mood to genre mapping
const moodGenreMap = {
  happy: ['pop', 'dance', 'happy'],
  sad: ['sad', 'blues', 'acoustic'],
  angry: ['rock', 'alternative', 'hard-rock'],
  anxious: ['ambient', 'classical', 'chill'],
  romantic: ['r-n-b', 'jazz', 'soul'],
  confident: ['hip-hop', 'rap', 'trap'],
  nostalgic: ['indie', 'classic-rock', 'folk'],
  energetic: ['electronic', 'dance', 'house'],
  calm: ['chill', 'ambient', 'piano']
};

// Audio feature targets
const moodAudioFeatures = {
  happy: { min_valence: 0.7, max_valence: 0.9, min_energy: 0.6, max_energy: 0.8 },
  sad: { min_valence: 0.1, max_valence: 0.3, min_energy: 0.2, max_energy: 0.4 },
  angry: { min_valence: 0.2, max_valence: 0.4, min_energy: 0.8, max_energy: 1.0 },
  // ... other moods ...
};

// Official Spotify playlists for fallback
const CURATED_PLAYLISTS = {
  happy: '37i9dQZF1DXdPec7aLTmlC', // Happy Hits
  sad: '37i9dQZF1DX7qK8ma5wgG1',   // Life Sucks
  angry: '37i9dQZF1DX3YSRoSdA634',  // Rock Classics
  anxious: '37i9dQZF1DX4WYpdgoIcn6', // Chill Hits
  romantic: '37i9dQZF1DX7qK8ma5wgG1', // Love Songs
  // ... other moods ...
};

// ========================
// 2. CORE FUNCTIONS
// ========================

async function refreshAccessToken() {
  try {
    const authString = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
      }),
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: REQUEST_TIMEOUT
      }
    );

    accessToken = response.data.access_token;
    console.log('✅ Spotify token refreshed');
    return accessToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error.message);
    throw new Error('Failed to refresh Spotify token');
  }
}

async function spotifyRequest(endpoint, params = {}, retries = MAX_RETRIES) {
  if (!accessToken) await refreshAccessToken();

  try {
    const response = await axios.get(`https://api.spotify.com/v1/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params,
      timeout: REQUEST_TIMEOUT
    });
    return response.data;
  } catch (error) {
    if (retries > 0 && error.response?.status === 401) {
      await refreshAccessToken();
      return spotifyRequest(endpoint, params, retries - 1);
    }
    throw error;
  }
}

// ========================
// 3. TRACK GENERATION
// ========================

async function getSpotifyRecommendations(mood) {
  const genre = getValidGenreForMood(mood);
  const features = moodAudioFeatures[mood] || moodAudioFeatures.happy;

  try {
    const data = await spotifyRequest('recommendations', {
      seed_genres: genre,
      limit: 20, // Request extra to account for filtering
      ...features
    });

    if (!data.tracks || data.tracks.length < MIN_TRACKS) {
      throw new Error(`Insufficient tracks received: ${data.tracks?.length || 0}`);
    }

    return {
      tracks: filterTracks(data.tracks),
      source: 'spotify-api',
      genreUsed: genre
    };
  } catch (error) {
    console.error('Spotify recommendations failed:', error.message);
    throw error;
  }
}

async function getCuratedPlaylist(mood) {
  const playlistId = CURATED_PLAYLISTS[mood] || CURATED_PLAYLISTS.happy;

  try {
    const playlist = await spotifyRequest(`playlists/${playlistId}`);
    const tracks = playlist.tracks.items
      .map(item => item.track)
      .filter(track => track); // Remove null tracks

    if (tracks.length < MIN_TRACKS) {
      throw new Error(`Playlist has insufficient tracks: ${tracks.length}`);
    }

    return {
      tracks: filterTracks(tracks.slice(0, 20)), // Get first 20
      source: 'spotify-playlist',
      playlistName: playlist.name
    };
  } catch (error) {
    console.error('Curated playlist failed:', error.message);
    throw error;
  }
}

// ========================
// 4. MAIN EXPORT
// ========================

async function getMoodBasedTracks(mood = 'happy') {
  try {
    // First try: Direct recommendations
    return await getSpotifyRecommendations(mood);
  } catch (error) {
    console.log('🔁 Falling back to curated playlist...');
    
    // Second try: Pre-made playlists
    return await getCuratedPlaylist(mood);
    
    // Note: No local fallback as requested
  }
}

// ========================
// HELPER FUNCTIONS
// ========================

function getValidGenreForMood(mood) {
  const genres = moodGenreMap[mood] || moodGenreMap.happy;
  return genres.find(g => VALID_GENRES.includes(g)) || 'pop';
}

function filterTracks(tracks) {
  const artistCounts = {};
  const seenTracks = new Set();
  
  return tracks.filter(track => {
    const artistId = track.artists[0]?.id;
    const trackKey = `${track.name.toLowerCase()}-${artistId}`;

    // Skip duplicates
    if (seenTracks.has(trackKey)) return false;
    seenTracks.add(trackKey);

    // Limit artist frequency
    artistCounts[artistId] = (artistCounts[artistId] || 0) + 1;
    return artistCounts[artistId] <= 3; // Max 3 tracks per artist
  }).slice(0, 15); // Return max 15 tracks
}

module.exports = {
  refreshAccessToken,
  getMoodBasedTracks,
  getSpotifyRecommendations,
  getCuratedPlaylist
};