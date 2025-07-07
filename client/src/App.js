import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import logo from './logo.svg';

function App() {
  const [prompt, setPrompt] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [mood, setMood] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);

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

  const handleEnter = () => {
    setEntered(true);
  };

  return (
    <div className="whole">
      <div className={`intro-screen ${entered ? 'slide-up' : ''}`}>
        <button className="intro-button" onClick={handleEnter}>
          <img src={logo} alt="Promptify Logo" className="intro-logo" />
          <h1 className="intro-text">Promptify</h1>
        </button>
      </div>

      {entered && (
        <>
          <nav className="nav">
          <div className="logo" onClick={() => window.location.reload()}>
            <img src={logo} alt="Promptify Logo" />
            <span>Promptify</span>
          </div>

            {/* <div className="nav-buttons">
              <button className="sign-in">Sign In</button>
              <button className="log-in">Log In</button>
            </div> */}
          </nav>

          <div className="hero-container">
            <div className="main-content">
              <h1>Let's Make You Some Playlists 🎧</h1>
              <p className="subtext">
                Tell us how you're feeling and we'll create the perfect playlist for your mood.
              </p>

              <form onSubmit={handleSubmit} className="prompt-form">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="How are you feeling today..."
                  required
                />
                <button type="submit" className="submit-button">✔</button>
              </form>

              {loading && <p className="loading-text">🎧 Fetching your playlist...</p>}
              {error && <p className="error-text">{error}</p>}
              {mood && <h3 className="mood-text"> There you go!</h3>
              }
            </div>

            {playlists.length > 0 && (
              <div className="playlist-grid">
                {playlists.map((pl) => (
                  <div key={pl.id} className="playlist-card">
                    <img src={pl.image} alt={pl.name} />
                    <h3>{pl.name}</h3>
                    <p><strong>Owner:</strong> {pl.owner}</p>
                    <h4>🎵 Top Tracks:</h4>
                    <ul className="track-list">
                      {pl.topTracks?.length > 0 ? (
                        pl.topTracks.map((track, i) => (
                          <li key={i}>{track.name} - <em>{track.artist}</em></li>
                        ))
                      ) : (
                        <li>No tracks found</li>
                      )}
                    </ul>
                    <a href={pl.url} target="_blank" rel="noopener noreferrer">Open in Spotify</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
