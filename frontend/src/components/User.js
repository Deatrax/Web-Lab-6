import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './User.css';

const User = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        stylePreferences: []
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingUsers, setFetchingUsers] = useState(true);
    const [message, setMessage] = useState('');
    const [activeUserId, setActiveUserId] = useState(localStorage.getItem('activeUserId') || '');

    const styles = ['minimalist', 'comfortable', 'formal'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setFetchingUsers(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStyleChange = (e) => {
        const value = e.target.value;
        const checked = e.target.checked;
        
        if (checked) {
            setFormData({
                ...formData,
                stylePreferences: [...formData.stylePreferences, value]
            });
        } else {
            setFormData({
                ...formData,
                stylePreferences: formData.stylePreferences.filter(style => style !== value)
            });
        }
    };

    const handleFileChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('location', formData.location);
        formData.stylePreferences.forEach(style => {
            data.append('stylePreferences', style);
        });
        if (profilePicture) {
            data.append('profilePicture', profilePicture);
        }

        try {
            const res = await axios.post('http://localhost:5000/api/users', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('User created successfully!');
            setFormData({ name: '', location: '', stylePreferences: [] });
            setProfilePicture(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            setMessage('Error creating user: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (id) => {
        setActiveUserId(id);
        localStorage.setItem('activeUserId', id);
        setMessage('Active user updated!');
    };

    return (
        <div className="user-page">
            <div className="user-container">
                <h2>Create New User</h2>
                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input 
                            type="text" 
                            name="location" 
                            value={formData.location} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Style Preferences</label>
                        <div className="checkbox-group">
                            {styles.map(style => (
                                <label key={style} className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        value={style} 
                                        checked={formData.stylePreferences.includes(style)}
                                        onChange={handleStyleChange} 
                                    />
                                    {style.charAt(0).toUpperCase() + style.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Profile Picture</label>
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            accept="image/*"
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </form>
                {message && <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
            </div>

            <div className="user-list-container">
                <h2>Existing Users</h2>
                {fetchingUsers ? <p>Loading users...</p> : (
                    <div className="user-grid">
                        {users.map(u => (
                            <div key={u._id} className={`user-card ${activeUserId === u._id ? 'active' : ''}`}>
                                {u.profilePicture?.url && <img src={u.profilePicture.url} alt={u.name} className="user-avatar" />}
                                <div className="user-info">
                                    <h3>{u.name}</h3>
                                    <p>📍 {u.location}</p>
                                    <p>✨ {u.stylePreferences.join(', ')}</p>
                                    <button 
                                        onClick={() => handleSelectUser(u._id)}
                                        className={activeUserId === u._id ? 'selected-btn' : 'select-btn'}
                                    >
                                        {activeUserId === u._id ? 'Selected' : 'Select Profile'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {users.length === 0 && <p>No users found. Create one above!</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default User;
