import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Weather.css';

const CONDITIONS = ['sunny', 'rainy', 'cloudy', 'cold', 'hot'];

const Weather = () => {
    const [weatherList, setWeatherList] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        location: '',
        conditions: 'sunny',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [weatherRes, usersRes] = await Promise.all([
                axios.get('/api/weather'),
                axios.get('/api/users')
            ]);
            setWeatherList(weatherRes.data);
            setUsers(usersRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching weather data', err);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/weather', formData);
            alert('Weather updated successfully!');
            fetchData();
        } catch (err) {
            console.error('Error adding weather', err);
            alert('Failed to update weather');
        }
    };

    // Get unique locations from users
    const locations = [...new Set(users.map(u => u.location))];

    if (loading) return <div className="loading">Loading weather information...</div>;

    return (
        <div className="weather-container">
            <div className="page-header">
                <div>
                    <h2>🌦️ Weather Central</h2>
                    <p>Manage environmental conditions for smart outfit recommendations.</p>
                </div>
            </div>

            <div className="weather-grid">
                <div className="weather-card update-form">
                    <h3>Update Local Weather</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Location</label>
                            <input 
                                list="locations" 
                                name="location" 
                                value={formData.location} 
                                onChange={handleInputChange}
                                placeholder="Enter or select location"
                                required
                            />
                            <datalist id="locations">
                                {locations.map(loc => <option key={loc} value={loc} />)}
                            </datalist>
                        </div>

                        <div className="form-group">
                            <label>Conditions</label>
                            <select name="conditions" value={formData.conditions} onChange={handleInputChange}>
                                {CONDITIONS.map(c => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <input 
                                type="date" 
                                name="date" 
                                value={formData.date} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>

                        <button type="submit" className="cta-button full-width">Update Weather Status</button>
                    </form>
                </div>

                <div className="weather-card history-card">
                    <h3>Weather History</h3>
                    <div className="history-list">
                        {weatherList.length === 0 ? (
                            <p className="empty-msg">No weather records found.</p>
                        ) : (
                            weatherList.map((w, idx) => (
                                <div key={idx} className={`history-item ${w.conditions}`}>
                                    <div className="history-main">
                                        <span className="condition-icon">
                                            {w.conditions === 'sunny' && '☀️'}
                                            {w.conditions === 'rainy' && '🌧️'}
                                            {w.conditions === 'cloudy' && '☁️'}
                                            {w.conditions === 'cold' && '❄️'}
                                            {w.conditions === 'hot' && '🔥'}
                                        </span>
                                        <div className="history-details">
                                            <span className="location-text">{w.location}</span>
                                            <span className="condition-text">{w.conditions}</span>
                                        </div>
                                    </div>
                                    <span className="date-badge">{new Date(w.date).toLocaleDateString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Weather;
