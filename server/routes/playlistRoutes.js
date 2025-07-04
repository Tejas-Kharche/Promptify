const express = require('express');
const router = express.Router();
const { getPlaylistForMood } = require('../controllers/playlistController');

// Route: POST /api/playlist
router.post('/', getPlaylistForMood);

module.exports = router;
