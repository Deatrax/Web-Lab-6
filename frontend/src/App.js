import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Accessories from './components/Accessories';
import Laundry from './components/Laundry';
import Clothes from './components/Clothes';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/accessories" element={<Accessories />} />
          <Route path="/laundry" element={<Laundry />} />
          {/* Add other routes as they are implemented */}
          <Route path="/wardrobe" element={<Clothes />} />
          <Route path="/outfits" element={<div className="placeholder-page">Outfits Page Coming Soon</div>} />
          <Route path="/weather" element={<div className="placeholder-page">Weather Page Coming Soon</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
