import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

const Accessories = () => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    color: '',
    compatibleWith: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    try {
      const response = await axios.get('/api/accessories');
      setAccessories(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch accessories');
      setLoading(false);
      console.error(err);
    }
  };

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
    if (selectedImage) {
      data.append('image', selectedImage);
    }

    try {
      await axios.post('/api/accessories', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchAccessories();
      setFormData({ name: '', type: '', color: '', compatibleWith: '' });
      setSelectedImage(null);
    } catch (err) {
      console.error('Error adding accessory:', err);
      alert('Failed to add accessory');
    }
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

  if (loading) return <div className="loading">Loading Accessories...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="accessories-container">
      <h2>My Accessories</h2>
      
      <div className="add-accessory-form">
        <h3>Add New Accessory</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="type"
            placeholder="Type (e.g., Hat, Belt)"
            value={formData.type}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="color"
            placeholder="Color"
            value={formData.color}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="compatibleWith"
            placeholder="Compatible With (comma separated)"
            value={formData.compatibleWith}
            onChange={handleInputChange}
          />
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
          />
          <button type="submit" className="cta-button">Add Accessory</button>
        </form>
      </div>

      <div className="accessories-grid">
        {accessories.map((item) => (
          <div key={item._id} className="accessory-card">
            {item.image && item.image.url ? (
              <img src={item.image.url} alt={item.name} className="accessory-image" />
            ) : (
              <div className="placeholder-image">No Image</div>
            )}
            <div className="accessory-details">
              <h4>{item.name}</h4>
              <p>Type: {item.type}</p>
              <p>Color: {item.color}</p>
              <button onClick={() => handleDelete(item._id)} className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accessories;
