const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  playlistName: String,
  prompt: String,
  mood: String,
  tracks: [
    {
      id: String,
      name: String,
      artist: String,
      url: String,
    },
  ],
}, {timestamps: true});

module.exports = mongoose.model('Playlist', playlistSchema);
