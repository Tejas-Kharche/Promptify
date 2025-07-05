import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [mood, setMood] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPlaylists([]);
    setMood('');

    try {
      const res = await axios.post('http://localhost:5000/api/playlists', { text: prompt });
      setPlaylists(res.data.playlists);
      setMood(res.data.mood);
    } catch (err) {
      console.error('❌ API Error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Promptify</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What's the vibe today"
          required
        />
        <button type="submit">Generate Playlist</button>
      </form>

      {loading && <p>🔄 Fetching playlists...</p>}
      {error && <p className="error">{error}</p>}
      {mood && <h2>🧠 Detected Mood: <span className="mood">{mood}</span></h2>}

      <div className="playlist-grid">
        {playlists.map((pl) => (
          <div key={pl.id} className="playlist-card">
            <img src={pl.image} alt={pl.name} />
            <h3>{pl.name}</h3>
            <p><strong>Owner:</strong> {pl.owner}</p>
            <h4>🎵 Top Tracks:</h4>
            <ul className="track-list">
              {pl.topTracks && pl.topTracks.length > 0 ? (
                pl.topTracks.map((track, idx) => (
                  <li key={idx}>
                    {track.name} - <em>{track.artist}</em>
                  </li>
                ))
              ) : (
                <li>No tracks found</li>
              )}
            </ul>
            <a href={pl.url} target="_blank" rel="noopener noreferrer">Open in Spotify</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
