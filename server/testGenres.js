const { getAvailableGenreSeeds } = require('./utils/spotifyHelper');

getAvailableGenreSeeds()
  .then(genres => console.log('🎵 Available genres:', genres))
  .catch(err => console.error('❌ Error fetching genres:', err.response?.data || err.message));
