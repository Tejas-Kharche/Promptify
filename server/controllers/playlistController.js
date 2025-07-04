const analyzePrompt = require('../utils/sentimentHelper');
const { getPlaylistsByMood } = require('../utils/spotifyHelper');

const getPlaylistForMood = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Text input is required.' });
    }

    const { mood, score, comparative } = analyzePrompt(text);
    console.log(`🧠 Mood detected: ${mood} (score: ${score}, comparative: ${comparative})`);

    const playlists = await getPlaylistsByMood(mood);

    if (!Array.isArray(playlists) || playlists.length === 0) {
      return res.status(404).json({ error: `No playlists found for mood: ${mood}` });
    }

    const formatted = playlists
      .filter(pl => pl && pl.name && pl.external_urls?.spotify) // null-safe filtering
      .map((pl) => ({
        name: pl.name,
        id: pl.id,
        url: pl.external_urls.spotify,
        image: pl.images?.[0]?.url || '',
        description: pl.description || '',
        owner: pl.owner?.display_name || 'Unknown',
      }));

    if (formatted.length === 0) {
      return res.status(500).json({ error: `No valid playlists returned for mood: ${mood}` });
    }

    res.status(200).json({
      mood,
      playlists: formatted,
    });
  } catch (error) {
    console.error('❌ Error in getPlaylistForMood:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPlaylistForMood,
};

