import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <a href="/" className="logo">SmartWardrobe</a>
        <ul className="nav-links">
          <li><a href="#wardrobe">Wardrobe</a></li>
          <li><a href="#outfits">Outfits</a></li>
          <li><a href="#weather">Weather</a></li>
          <li><a href="#laundry">Laundry</a></li>
          <li><a href="#analytics">Analytics</a></li>
        </ul>
      </nav>

      <header className="hero">
        <h1>Elevate Your Style, Effortlessly</h1>
        <p>The intelligent wardrobe manager that helps you organize clothes, plan outfits based on weather, and track your laundry.</p>
        <a href="#get-started" className="cta-button">Get Started Free</a>
      </header>

      <main className="features">
        <div className="feature-card">
          <span className="feature-icon" role="img" aria-label="clothes">👕</span>
          <h3>Wardrobe Management</h3>
          <p>Digitize your closet and keep track of every item you own with ease.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon" role="img" aria-label="outfit">👗</span>
          <h3>Outfit Planning</h3>
          <p>Create and save stunning outfits for any occasion or style.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon" role="img" aria-label="weather">☀️</span>
          <h3>Weather Smart</h3>
          <p>Get outfit recommendations perfectly tailored to your local weather forecast.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon" role="img" aria-label="laundry">🧺</span>
          <h3>Laundry Tracker</h3>
          <p>Never lose track of what's clean and what's in the wash again.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon" role="img" aria-label="analytics">📊</span>
          <h3>Style Analytics</h3>
          <p>Gain insights into your most worn items and style preferences.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon" role="img" aria-label="accessories">👓</span>
          <h3>Accessories</h3>
          <p>Complete your look by managing your favorite accessories alongside your clothes.</p>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 SmartWardrobe Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
