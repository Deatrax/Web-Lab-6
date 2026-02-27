import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Activewear', 'Formal', 'Other'];
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'All Season'];
const OCCASIONS = ['Casual', 'Formal', 'Party', 'Work', 'Sport', 'Beach', 'Other'];

const Clothes = () => {
    const [clothes, setClothes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        color: '',
        season: '',
        occasion: '',
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchClothes();
    }, []);

    const fetchClothes = async () => {
        try {
            const response = await axios.get('/api/clothes');
            setClothes(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch clothes');
            setLoading(false);
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImagesChange = (e) => {
        setSelectedImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('category', formData.category);
        data.append('color', formData.color);
        data.append('season', formData.season);
        data.append('occasion', formData.occasion);

        selectedImages.forEach((img) => {
            data.append('images', img);
        });

        try {
            await axios.post('/api/clothes', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchClothes();
            setFormData({ name: '', category: '', color: '', season: '', occasion: '' });
            setSelectedImages([]);
            e.target.reset();
        } catch (err) {
            console.error('Error adding clothing:', err);
            alert('Failed to add clothing item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`/api/clothes/${id}`);
                fetchClothes();
            } catch (err) {
                console.error('Error deleting clothing:', err);
                alert('Failed to delete clothing item');
            }
        }
    };

    if (loading) return <div className="loading">Loading Wardrobe...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="accessories-container">
            <h2>👕 My Wardrobe</h2>

            {/* Add Clothes Form */}
            <div className="add-accessory-form">
                <h3>Add New Clothing Item</h3>
                <form onSubmit={handleSubmit} className="clothes-form">
                    <input
                        type="text"
                        name="name"
                        placeholder="Item Name (e.g., Blue Denim Jacket)"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />

                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="clothes-select"
                    >
                        <option value="" disabled>Category</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        name="color"
                        placeholder="Color (e.g., Navy Blue)"
                        value={formData.color}
                        onChange={handleInputChange}
                        required
                    />

                    <select
                        name="season"
                        value={formData.season}
                        onChange={handleInputChange}
                        className="clothes-select"
                    >
                        <option value="" disabled>Season</option>
                        {SEASONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    <select
                        name="occasion"
                        value={formData.occasion}
                        onChange={handleInputChange}
                        className="clothes-select"
                    >
                        <option value="" disabled>Occasion</option>
                        {OCCASIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                        ))}
                    </select>

                    <div className="file-input-wrapper">
                        <label className="file-input-label">
                            📷 Upload Images
                            <input
                                type="file"
                                name="images"
                                multiple
                                accept="image/*"
                                onChange={handleImagesChange}
                                className="hidden-file-input"
                            />
                        </label>
                        {selectedImages.length > 0 && (
                            <span className="file-count">{selectedImages.length} file(s) selected</span>
                        )}
                    </div>

                    <button type="submit" className="cta-button" disabled={submitting}>
                        {submitting ? 'Adding...' : 'Add to Wardrobe'}
                    </button>
                </form>
            </div>

            {/* Clothes Grid */}
            {clothes.length === 0 ? (
                <div className="empty-wardrobe">
                    <span style={{ fontSize: '4rem' }}>👗</span>
                    <p>Your wardrobe is empty. Add your first item above!</p>
                </div>
            ) : (
                <div className="accessories-grid">
                    {clothes.map((item) => (
                        <div key={item._id} className="accessory-card">
                            {item.images && item.images.length > 0 ? (
                                <img
                                    src={item.images[0].url}
                                    alt={item.name}
                                    className="accessory-image"
                                />
                            ) : (
                                <div className="placeholder-image">
                                    <span style={{ fontSize: '2.5rem' }}>👕</span>
                                </div>
                            )}
                            <div className="accessory-details">
                                <h4>{item.name}</h4>
                                {item.category && (
                                    <p>
                                        <span className="clothes-badge">{item.category}</span>
                                    </p>
                                )}
                                {item.color && <p>🎨 {item.color}</p>}
                                {item.season && <p>🗓️ {item.season}</p>}
                                {item.occasion && <p>✨ {item.occasion}</p>}
                                {item.images && item.images.length > 1 && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        +{item.images.length - 1} more photo(s)
                                    </p>
                                )}
                                <button onClick={() => handleDelete(item._id)} className="delete-btn">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Clothes;
