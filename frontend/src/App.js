import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Accessories from './components/Accessories';
import Laundry from './components/Laundry';
import Clothes from './components/Clothes';
import Outfits from './components/Outfits';
import Weather from './components/Weather';
import User from './components/User';
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
          <Route path="/wardrobe" element={<Clothes />} />
          <Route path="/outfits" element={<Outfits />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
