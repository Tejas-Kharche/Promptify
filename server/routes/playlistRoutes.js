const express = require('express');
const router = express.Router();
const { generatePlaylist } = require('../controllers/playlistController');

// Route: POST /api/playlists/generate
router.post('/generate', generatePlaylist);

module.exports = router;
