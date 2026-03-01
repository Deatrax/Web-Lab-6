import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Outfits.css';

const Outfits = () => {
    const [outfits, setOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [occasion, setOccasion] = useState('');

    useEffect(() => {
        fetchOutfits();
    }, []);

    const fetchOutfits = async () => {
        try {
            const response = await axios.get('/api/outfits');
            setOutfits(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch outfits', err);
            setLoading(false);
        }
    };

    const generateOutfit = async () => {
        setGenerating(true);
        try {
            // Simplified: No longer strictly requiring a user profile for the demo
            await axios.post('/api/outfits/generate', { occasion });
            fetchOutfits();
            alert('✨ StyleSync has curated a new outfit for you!');
        } catch (err) {
            console.error('Error generating outfit:', err);
            alert(err.response?.data?.message || 'Failed to generate outfit. Add some clothes to your wardrobe first!');
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this outfit?')) {
            try {
                await axios.delete(`/api/outfits/${id}`);
                fetchOutfits();
            } catch (err) {
                console.error('Error deleting outfit:', err);
                alert('Failed to delete outfit');
            }
        }
    };

    if (loading) return <div className="loading">Opening your digital lookbook...</div>;

    return (
        <div className="accessories-container">
            <div className="page-header">
                <div>
                    <h2>👗 My Outfits </h2>
                    <p>Outfit combinations tailored to your style and the local forecast.</p>
                </div>
                <div className="generate-controls-header">
                    <select 
                        value={occasion} 
                        onChange={(e) => setOccasion(e.target.value)}
                        className="clothes-select"
                        style={{ width: '160px', marginRight: '1rem' }}
                    >
                        <option value="">Any Occasion</option>
                        <option value="Casual">Casual</option>
                        <option value="Formal">Formal</option>
                        <option value="Work">Work</option>
                        <option value="Party">Party</option>
                        <option value="Sport">Sport</option>
                    </select>
                    <button 
                        className="cta-button" 
                        onClick={generateOutfit}
                        disabled={generating}
                    >
                        {generating ? 'Curating...' : 'Generate Outfit'}
                    </button>
                </div>
            </div>

            <div className="accessories-grid">
                {outfits.length === 0 ? (
                    <div className="empty-outfits">
                        <h3>Your lookbook is waiting...</h3>
                        <p>Generate your first smart outfit to see it here.</p>
                    </div>
                ) : (
                    outfits.map((outfit) => (
                        <div key={outfit._id} className="outfit-card">
                            <div className="outfit-visual">
                                {outfit.clothingItems.map((item) => (
                                    <div key={item._id} className="outfit-item-preview">
                                        {item.images && item.images[0] ? (
                                            <img src={item.images[0].url} alt={item.name} />
                                        ) : (
                                            <div className="placeholder-content">👕</div>
                                        )}
                                    </div>
                                ))}
                                <div className="outfit-item-label">
                                    {outfit.clothingItems.length} Piece Set
                                </div>
                            </div>
                            <div className="outfit-info">
                                <div className="outfit-header">
                                    <h4>{outfit.name}</h4>
                                    <span className="weather-tag">{outfit.weatherCondition}</span>
                                </div>
                                <div className="outfit-meta">
                                    <div className="meta-item">
                                        <span>🔄</span> {outfit.wearCount} Wears
                                    </div>
                                    <div className="meta-item">
                                        <span>📅</span> {new Date(outfit.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                {outfit.accessories && outfit.accessories.length > 0 && (
                                    <div className="accessories-list">
                                        {outfit.accessories.map(a => (
                                            <span key={a._id} className="acc-tag">👓 {a.name}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="outfit-actions" style={{ marginTop: '1rem' }}>
                                    <button 
                                        onClick={() => handleDelete(outfit._id)} 
                                        className="delete-btn"
                                        style={{ width: '100%' }}
                                    >
                                        🗑️ Delete Outfit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Outfits;
