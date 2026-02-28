import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Laundry.css';

const Laundry = () => {
  const [laundries, setLaundries] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    items: [],
    scheduledDate: '',
    status: 'pending'
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [laundryRes, clothesRes] = await Promise.all([
        axios.get('/api/laundry'),
        axios.get('/api/clothes')
      ]);
      setLaundries(laundryRes.data);
      setClothes(clothesRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data. Please ensure the backend is running.');
      setLoading(false);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemSelect = (itemId) => {
    const selectedItems = [...formData.items];
    if (selectedItems.includes(itemId)) {
      setFormData({
        ...formData,
        items: selectedItems.filter(id => id !== itemId)
      });
    } else {
      setFormData({
        ...formData,
        items: [...selectedItems, itemId]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Please select at least one item.');
      return;
    }

    try {
      await axios.post('/api/laundry', formData);
      fetchData();
      resetForm();
    } catch (err) {
      console.error('Error adding laundry:', err);
      alert('Failed to add laundry record');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/laundry/${id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const deleteLaundry = async (id) => {
    if (window.confirm('Are you sure you want to delete this laundry record?')) {
      try {
        await axios.delete(`/api/laundry/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting laundry:', err);
        alert('Failed to delete laundry record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      items: [],
      scheduledDate: '',
      status: 'pending'
    });
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading Laundry...</div>;

  return (
    <div className="laundry-container">
      <div className="page-header">
        <div>
          <h2>Laundry Management</h2>
          <p>Track your clothes through the washing process.</p>
        </div>
        {!showForm && (
          <button className="cta-button" onClick={() => setShowForm(true)}>
            + New Laundry Session
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <div className="error">{error}</div>
          <button onClick={fetchData} className="cta-button small-btn">Retry Fetch</button>
        </div>
      )}

      {showForm && (
        <div className="laundry-form-card">
          <div className="form-header">
            <h3>Start New Session</h3>
            <button className="text-btn" onClick={resetForm}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Scheduled Date</label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Initial Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="pending">Pending</option>
                <option value="washing">Washing</option>
                <option value="drying">Drying</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="clothes-selection-section">
              <label>Select Clothes to Wash:</label>
              <div className="clothes-selection-grid">
                {clothes.length === 0 ? (
                  <p>No clothes found in your wardrobe. Add clothes first!</p>
                ) : (
                  clothes.map(item => (
                    <div 
                      key={item._id} 
                      className={`clothes-item-mini ${formData.items.includes(item._id) ? 'selected' : ''}`}
                      onClick={() => handleItemSelect(item._id)}
                    >
                      {item.images && item.images[0] ? (
                        <img src={item.images[0].url} alt={item.name} />
                      ) : (
                        <div className="mini-placeholder">👕</div>
                      )}
                      <span>{item.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="cta-button">Create Session</button>
            </div>
          </form>
        </div>
      )}

      <div className="laundry-list">
        {laundries.length === 0 ? (
          <div className="empty-state">
            <p>No active laundry sessions. Take a break!</p>
          </div>
        ) : (
          laundries.map(laundry => (
            <div key={laundry._id} className={`laundry-card status-${laundry.status}`}>
              <div className="laundry-card-header">
                <div className="laundry-info">
                  <span className={`status-pill ${laundry.status}`}>{laundry.status.toUpperCase()}</span>
                  <span className="date-text">
                    {laundry.scheduledDate ? new Date(laundry.scheduledDate).toLocaleDateString() : 'No date'}
                  </span>
                </div>
                <button className="delete-icon-btn" onClick={() => deleteLaundry(laundry._id)} title="Delete Session">
                  🗑️
                </button>
              </div>

              <div className="items-preview">
                {laundry.items.map(item => (
                  <div key={item._id} className="item-tag">
                    {item.name}
                  </div>
                ))}
              </div>

              <div className="status-controls">
                <p>Update Status:</p>
                <div className="btn-group">
                  <button 
                    className={`status-btn ${laundry.status === 'pending' ? 'active' : ''}`}
                    onClick={() => updateStatus(laundry._id, 'pending')}
                  >Pending</button>
                  <button 
                    className={`status-btn ${laundry.status === 'washing' ? 'active' : ''}`}
                    onClick={() => updateStatus(laundry._id, 'washing')}
                  >Washing</button>
                  <button 
                    className={`status-btn ${laundry.status === 'drying' ? 'active' : ''}`}
                    onClick={() => updateStatus(laundry._id, 'drying')}
                  >Drying</button>
                  <button 
                    className={`status-btn ${laundry.status === 'done' ? 'active' : ''}`}
                    onClick={() => updateStatus(laundry._id, 'done')}
                  >Done</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Laundry;
