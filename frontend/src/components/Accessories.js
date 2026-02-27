import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../App.css';

const Accessories = () => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    color: '',
    compatibleWith: '',
    status: 'active'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [donationSuggestion, setDonationSuggestion] = useState({});

  const fetchAccessories = useCallback(async () => {
    try {
      const response = await axios.get('/api/accessories');
      setAccessories(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch accessories. Please ensure the backend is running.');
      setLoading(false);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAccessories();
  }, [fetchAccessories]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('type', formData.type);
    data.append('color', formData.color);
    data.append('compatibleWith', formData.compatibleWith);
    data.append('status', formData.status);
    if (selectedImage) {
      data.append('image', selectedImage);
    }

    try {
      if (isEditing) {
        await axios.put(`/api/accessories/${isEditing}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/accessories', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchAccessories();
      resetForm();
    } catch (err) {
      console.error('Error saving accessory:', err);
      alert('Failed to save accessory');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: '', color: '', compatibleWith: '', status: 'active' });
    setSelectedImage(null);
    setIsEditing(null);
    setDonationSuggestion({});
  };

  const handleEdit = (item) => {
    setIsEditing(item._id);
    setFormData({
      name: item.name,
      type: item.type || '',
      color: item.color,
      compatibleWith: item.compatibleWith ? item.compatibleWith.join(', ') : '',
      status: item.status || 'active'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this accessory?')) {
      try {
        await axios.delete(`/api/accessories/${id}`);
        fetchAccessories();
      } catch (err) {
        console.error('Error deleting accessory:', err);
      }
    }
  };

  const checkDonation = async (id) => {
    try {
      const response = await axios.get(`/api/accessories/${id}/suggest-donation`);
      setDonationSuggestion(prev => ({ ...prev, [id]: response.data }));
    } catch (err) {
      console.error('Error checking donation status:', err);
    }
  };

  const markAsDonated = async (item) => {
    if (window.confirm(`Mark "${item.name}" as donated? This will hide it from your active collection.`)) {
      try {
        await axios.put(`/api/accessories/${item._id}`, { ...item, status: 'donated' });
        fetchAccessories();
      } catch (err) {
        console.error('Error marking as donated:', err);
      }
    }
  };

  if (loading) return <div className="loading">Loading Accessories...</div>;

  return (
    <div className="accessories-container">
      <div className="page-header">
        <h2>My Accessories</h2>
        <p>Manage your collection of belts, hats, jewelry and more.</p>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error">{error}</div>
          <button onClick={fetchAccessories} className="cta-button small-btn">Retry Fetch</button>
        </div>
      )}
      
      <div className="add-accessory-form">
        <h3>{isEditing ? 'Edit Accessory' : 'Add New Accessory'}</h3>
        <form onSubmit={handleSubmit} className="accessory-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Leather Belt"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="">Select Type</option>
                <option value="Belt">Belt</option>
                <option value="Hat">Hat</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Watch">Watch</option>
                <option value="Scarf">Scarf</option>
                <option value="Bag">Bag</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                name="color"
                placeholder="e.g. Brown"
                value={formData.color}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Compatible With</label>
              <input
                type="text"
                name="compatibleWith"
                placeholder="e.g. top, bottom (comma separated)"
                value={formData.compatibleWith}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="active">Active</option>
                <option value="donated">Donated</option>
              </select>
            </div>
            <div className="form-group">
              <label>Image</label>
              <input
                type="file"
                name="image"
                className="file-input"
                onChange={handleImageChange}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="cta-button">{isEditing ? 'Update' : 'Add'} Accessory</button>
            {isEditing && <button type="button" onClick={resetForm} className="secondary-button">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="accessories-grid">
        {accessories.length === 0 ? (
          <p className="empty-state">No accessories found. Start by adding one above!</p>
        ) : accessories.map((item) => (
          <div key={item._id} className={`accessory-card ${item.status === 'donated' ? 'donated-item' : ''}`}>
            {item.image && item.image.url ? (
              <img src={item.image.url} alt={item.name} className="accessory-image" />
            ) : (
              <div className="placeholder-image">No Image</div>
            )}
            <div className="accessory-details">
              <div className="card-header">
                <h4>{item.name}</h4>
                <span className={`status-badge ${item.status}`}>{item.status}</span>
              </div>
              
              <div className="tag-container">
                {item.type && <span className="tag">{item.type}</span>}
                {item.color && <span className="tag color-tag">{item.color}</span>}
              </div>

              <div className="stats-container">
                <p><strong>Worn:</strong> {item.wearCount || 0} times</p>
                <p><strong>Last worn:</strong> {item.lastWorn ? new Date(item.lastWorn).toLocaleDateString() : 'Never'}</p>
              </div>

              {item.compatibleWith && item.compatibleWith.length > 0 && (
                <p className="compatible-text">Pairs with: {item.compatibleWith.join(', ')}</p>
              )}

              {donationSuggestion[item._id] && (
                <div className={`donation-alert ${donationSuggestion[item._id].suggestion ? 'suggest-yes' : 'suggest-no'}`}>
                  {donationSuggestion[item._id].message}
                </div>
              )}

              <div className="card-actions">
                <button onClick={() => handleEdit(item)} className="edit-btn">Edit</button>
                <button onClick={() => checkDonation(item._id)} className="suggest-btn">Check Usage</button>
                {item.status !== 'donated' && (
                  <button onClick={() => markAsDonated(item)} className="donate-btn">Mark Donated</button>
                )}
                <button onClick={() => handleDelete(item._id)} className="delete-btn">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accessories;

