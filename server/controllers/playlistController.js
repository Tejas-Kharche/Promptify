const analyzePrompt = require('../utils/sentimentHelper');
const { searchTracks } = require('../utils/spotifyHelper');
const Playlist = require('../models/Playlist');

// Utility to generate a creative playlist name based on mood
const generatePlaylistName = (mood) => {
  const names = {
    happy: ['Sunshine & Smiles', 'Feel Good Beats', 'Happy Heart Hits'],
    sad: ['Tears & Tunes', 'Lonely Nights', 'Crying in Loops'],
    angry: ['Sonic Rage', 'Anger Release', 'Scream Therapy'],
    anxious: ['Mind Unwind', 'Soft Escape', 'Anxiety Relief'],
    romantic: ['Heartbeats', 'Love & Lyrics', 'Crush Tapes'],
    confident: ['Boss Mode', 'Power Playlist', 'Own the Day'],
    nostalgic: ['Throwback Feels', 'Back in Time', 'Old School Love'],
    energetic: ['Hype Machine', 'Power Moves', 'Run It Up'],
    calm: ['Serenity Sounds', 'Quiet Moods', 'Breathe Easy'],
  };

  const options = names[mood] || ['Mood Tunes'];
  return options[Math.floor(Math.random() * options.length)];
};

// 🎵 POST /api/playlists/generate
const generatePlaylist = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Analyze prompt to get mood
    const sentimentResult = analyzePrompt(prompt);
    const mood = sentimentResult.mood;

    // Search Spotify for tracks based on mood only
    const tracks = await searchTracks(mood);
    if (!tracks || tracks.length < 10) {
      return res.status(404).json({ error: 'Not enough suitable tracks found for this mood' });
    }

    // Generate creative playlist name
    const playlistName = generatePlaylistName(mood);

    // Save playlist to DB
    const newPlaylist = new Playlist({
      name: playlistName,
      prompt,
      moodTags: [mood],
      songs: tracks.map((track) => track.id), // Save only track IDs
    });

    await newPlaylist.save();

    // Send back full playlist data (tracks + metadata)
    res.status(200).json({
      playlistName,
      prompt,
      mood,
      tracks,
    });

  } catch (err) {
    console.error('❌ Error generating playlist:', err);
    res.status(500).json({ error: 'Server error while generating playlist' });
  }
};

module.exports = { generatePlaylist };
