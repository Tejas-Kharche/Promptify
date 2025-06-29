const axios = require('axios');
require('dotenv').config();

let accessToken = null;

const getAccessToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const authOptions = {
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: 'grant_type=client_credentials',
  };

  try {
    const response = await axios(authOptions);
    accessToken = response.data.access_token;
    return accessToken;
  } catch (err) {
    console.error('❌ Error fetching access token:', err.response?.data || err);
    throw err;
  }
};

const searchTracks = async (mood) => {
  try {
    const token = await getAccessToken();
    const query = `${mood} playlist`;

    console.log('🔍 Spotify Search Query:', query);

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: query,
        type: 'track',
        limit: 50,
        market: 'IN',
      },
    });

    const items = response.data.tracks.items;
    const trackIds = items.map(track => track.id).slice(0, 100);

    const featuresResponse = await axios.get('https://api.spotify.com/v1/audio-features', {
      headers: { Authorization: `Bearer ${token}` },
      params: { ids: trackIds.join(',') },
    });

    const audioFeaturesMap = {};
    for (const feature of featuresResponse.data.audio_features) {
      if (feature) audioFeaturesMap[feature.id] = feature;
    }

    const seenIDs = new Set();
    const seenNames = new Set();
    const artistCount = {};
    const uniqueTracks = [];

    for (let track of items) {
      const id = track.id;
      const name = track.name.toLowerCase();
      const artistNames = track.artists.map(a => a.name).join(', ');
      const features = audioFeaturesMap[id];
      if (!features) continue;

      // 🎯 Mood filtering
      let pass = true;
      if (mood === 'angry') {
        pass = features.energy >= 0.6 && features.valence <= 0.6;
      } else if (mood === 'calm') {
        pass = features.energy <= 0.6 && features.valence >= 0.2;
      } else if (mood === 'happy') {
        pass = features.energy >= 0.4 && features.valence >= 0.5;
      }

      if (!pass) continue;

      if (
        seenIDs.has(id) ||
        seenNames.has(name) ||
        (artistCount[artistNames] || 0) >= 3
      ) continue;

      if (/karaoke|remix|version|instrumental|flip/i.test(name)) continue;
      if (track.popularity < 50) continue;

      seenIDs.add(id);
      seenNames.add(name);
      artistCount[artistNames] = (artistCount[artistNames] || 0) + 1;

      uniqueTracks.push({
        id,
        name: track.name,
        artist: artistNames,
        url: track.external_urls.spotify,
        preview_url: track.preview_url,
        popularity: track.popularity,
      });

      if (uniqueTracks.length === 15) break;
    }

    // Fallback if not enough tracks
    if (uniqueTracks.length < 10) {
      console.warn(`⚠️ Only ${uniqueTracks.length} suitable tracks. Relaxing filters...`);

      for (let track of items) {
        const id = track.id;
        const name = track.name.toLowerCase();
        const artistNames = track.artists.map(a => a.name).join(', ');

        if (
          seenIDs.has(id) ||
          seenNames.has(name) ||
          (artistCount[artistNames] || 0) >= 3
        ) continue;

        if (/karaoke|remix|version|instrumental|flip/i.test(name)) continue;
        if (track.popularity < 50) continue;

        seenIDs.add(id);
        seenNames.add(name);
        artistCount[artistNames] = (artistCount[artistNames] || 0) + 1;

        uniqueTracks.push({
          id,
          name: track.name,
          artist: artistNames,
          url: track.external_urls.spotify,
          preview_url: track.preview_url,
          popularity: track.popularity,
        });

        if (uniqueTracks.length === 15) break;
      }
    }

// Final fallback – if still not enough, skip mood-based filtering
if (uniqueTracks.length < 10) {
  console.warn('⚠️ Still not enough tracks. Doing unfiltered keyword search...');

  const fallbackRes = await axios.get('https://api.spotify.com/v1/search', {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: mood, // just the mood keyword
      type: 'track',
      limit: 50,
      market: 'IN',
    },
  });

  for (let track of fallbackRes.data.tracks.items) {
    const id = track.id;
    const name = track.name.toLowerCase();
    const artistNames = track.artists.map(a => a.name).join(', ');

    if (
      seenIDs.has(id) ||
      seenNames.has(name) ||
      (artistCount[artistNames] || 0) >= 3
    ) continue;

    if (/karaoke|remix|version|instrumental|flip/i.test(name)) continue;
    if (track.popularity < 50) continue;

    seenIDs.add(id);
    seenNames.add(name);
    artistCount[artistNames] = (artistCount[artistNames] || 0) + 1;

    uniqueTracks.push({
      id,
      name: track.name,
      artist: artistNames,
      url: track.external_urls.spotify,
      preview_url: track.preview_url,
      popularity: track.popularity,
    });

    if (uniqueTracks.length === 15) break;
  }
}

// Final check
if (uniqueTracks.length < 10) {
  return Promise.reject({
    error: '❌ Not enough suitable tracks found after all fallbacks',
    found: uniqueTracks.length,
    note: 'Try a broader or simpler mood keyword like "happy" or "party"',
  });
}


    return uniqueTracks;

  } catch (err) {
    console.error('❌ Spotify error:', err.response?.data || err.message);
    return [];
  }
};

module.exports = { getAccessToken, searchTracks };
