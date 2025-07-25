const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const playlistRoutes = require('./routes/playlistRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: ['https://promptify-mocha.vercel.app'], // your Vercel frontend domain
  methods: 'GET,POST',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/playlists', playlistRoutes);
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ DB Connection Error:', err));
