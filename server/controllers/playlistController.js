const analyzePrompt = require('../utils/sentimentHelper');
const { getMoodBasedTracks } = require('../utils/spotifyHelper');
const Playlist = require('../models/Playlist');

// Emergency fallback playlists (Spotify URIs)
const EMERGENCY_PLAYLISTS = {
  happy: 'spotify:playlist:37i9dQZF1DXdPec7aLTmlC',
  sad: 'spotify:playlist:37i9dQZF1DX7qK8ma5wgG1',
  angry: 'spotify:playlist:37i9dQZF1DX3YSRoSdA634',
  calm: 'spotify:playlist:37i9dQZF1DX4WYpdgoIcn6'
};

async function generatePlaylist(req, res) {
  try {
    const { prompt, userId } = req.body;

    // Input validation
    if (!prompt || prompt.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Please describe your mood in 3+ characters'
      });
    }

    console.log(`📩 Processing: "${prompt}"`);

    // Sentiment analysis
    const { mood, score, source } = analyzePrompt(prompt);
    console.log(`🧠 Mood: ${mood} (${source}, score: ${score})`);

    let tracks = [];
    let generationSource = 'error';
    let errorState = false;

    try {
      // Primary attempt: Spotify API
      const result = await getMoodBasedTracks(mood);
      tracks = result.tracks;
      generationSource = result.source;
    } catch (apiError) {
      console.error('❌ Spotify failed:', apiError.message);
      errorState = true;
    }

    // If we have no tracks but detected mood
    if (tracks.length === 0 && mood) {
      return res.json({
        success: true,
        warning: 'Using emergency fallback',
        playlist: {
          name: `${mood} Playlist`,
          mood,
          prompt,
          tracks: [], // No tracks available
          emergency_uri: EMERGENCY_PLAYLISTS[mood] || EMERGENCY_PLAYLISTS.happy,
          instructions: 'Open this URI in Spotify to listen'
        }
      });
    }

    // Format tracks for response
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album?.name,
      preview_url: track.preview_url,
      spotify_url: track.external_urls?.spotify,
      image: track.album?.images?.[0]?.url
    }));

    // Save to DB if user authenticated
    let savedId = null;
    if (userId && !errorState) {
      const playlist = new Playlist({
        user: userId,
        name: generatePlaylistName(mood, prompt),
        mood,
        prompt,
        tracks: formattedTracks.map(t => t.id),
        source: generationSource
      });
      await playlist.save();
      savedId = playlist._id;
    }

    return res.json({
      success: true,
      playlist: {
        id: savedId,
        name: generatePlaylistName(mood, prompt),
        mood,
        prompt,
        source: generationSource,
        tracks: formattedTracks,
        ...(errorState && { warning: 'Partial service disruption' })
      }
    });

  } catch (error) {
    console.error('💥 Critical error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to generate playlist',
      emergency_options: EMERGENCY_PLAYLISTS,
      support_contact: 'help@yourdomain.com'
    });
  }
}

// Helper function
function generatePlaylistName(mood, prompt) {
  const keywords = prompt.split(' ').filter(w => w.length > 3);
  return `${mood} Mix${keywords.length ? `: ${keywords[0]}` : ''}`;
}

module.exports = { generatePlaylist };