import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">SmartWardrobe</Link>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/wardrobe">Wardrobe</Link></li>
        <li><Link to="/outfits">Outfits</Link></li>
        <li><Link to="/weather">Weather</Link></li>
        <li><Link to="/laundry">Laundry</Link></li>
        <li><Link to="/analytics">Analytics</Link></li>
        <li><Link to="/accessories">Accessories</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
