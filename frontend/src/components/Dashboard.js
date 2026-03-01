import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <header className="hero">
        <h1>Elevate Your Style, Effortlessly</h1>
        <p>The intelligent wardrobe manager that helps you organize clothes, plan outfits based on weather, and track your laundry.</p>
      </header>

      <main className="features">
        <div className="feature-card" onClick={() => navigate('/wardrobe')}>
          <span className="feature-icon" role="img" aria-label="clothes">👕</span>
          <h3>Wardrobe Management</h3>
          <p>Digitize your closet and keep track of every item you own with ease.</p>
        </div>
        <div className="feature-card" onClick={() => navigate('/outfits')}>
          <span className="feature-icon" role="img" aria-label="outfit">👗</span>
          <h3>Outfit Planning</h3>
          <p>Create and save stunning outfits for any occasion or style.</p>
        </div>
        <div className="feature-card" onClick={() => navigate('/weather')}>
          <span className="feature-icon" role="img" aria-label="weather">☀️</span>
          <h3>Weather Smart</h3>
          <p>Get outfit recommendations perfectly tailored to your local weather forecast.</p>
        </div>
        <div className="feature-card" onClick={() => navigate('/laundry')}>
          <span className="feature-icon" role="img" aria-label="laundry">🧺</span>
          <h3>Laundry Tracker</h3>
          <p>Never lose track of what's clean and what's in the wash again.</p>
        </div>
        <div className="feature-card" onClick={() => navigate('/analytics')}>
          <span className="feature-icon" role="img" aria-label="analytics">📊</span>
          <h3>Style Analytics</h3>
          <p>Gain insights into your most worn items and style preferences.</p>
        </div>
        <div className="feature-card" onClick={() => navigate('/accessories')}>
          <span className="feature-icon" role="img" aria-label="accessories">👓</span>
          <h3>Accessories</h3>
          <p>Complete your look by managing your favorite accessories alongside your clothes.</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
