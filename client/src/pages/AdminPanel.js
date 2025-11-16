import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { userAPI, visitAPI, getMockMode } from '../utils/api';
import './AdminPanel.css';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isMockMode] = useState(getMockMode());

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'rep'
  });

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchVisits();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAll();
      setUsers(data);
    } catch (error) {
      setToast({ message: 'Failed to load users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const { data } = await visitAPI.getAllVisits();
      setVisits(data);
    } catch (error) {
      setToast({ message: 'Failed to load visits', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.create(newUser);
      setToast({ message: 'User created successfully', type: 'success' });
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'rep' });
      fetchUsers();
    } catch (error) {
      setToast({
        message: error.response?.data?.error || 'Failed to create user',
        type: 'error'
      });
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(id);
        setToast({ message: 'User deleted successfully', type: 'success' });
        fetchUsers();
      } catch (error) {
        setToast({ message: 'Failed to delete user', type: 'error' });
      }
    }
  };

  const openInGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="admin-panel">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Navbar />

      <div className="container">
        <div className="admin-header">
          <div>
            <h2>Admin Panel</h2>
            {isMockMode && <span className="mock-badge">MOCK MODE</span>}
          </div>
          <button className="btn-switch-view" onClick={() => navigate('/dashboard')}>
            Switch to Rep Dashboard
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`tab ${activeTab === 'visits' ? 'active' : ''}`}
            onClick={() => setActiveTab('visits')}
          >
            All Visits
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h3>Manage Users</h3>
              <button className="btn-primary" onClick={() => setShowAddUser(true)}>
                + Add User
              </button>
            </div>

            {showAddUser && (
              <div className="modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Add New User</h3>
                    <button className="btn-close" onClick={() => setShowAddUser(false)}>×</button>
                  </div>
                  <form onSubmit={handleAddUser}>
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        required
                        minLength="6"
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      >
                        <option value="rep">Representative</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="btn-secondary" onClick={() => setShowAddUser(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Create User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : (
              <div className="users-grid">
                {users.map((user) => (
                  <div key={user._id} className="card user-card">
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </div>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="visits-section">
            <h3>All Visits History</h3>
            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : (
              <div className="visits-grid">
                {visits.map((visit) => (
                  <div key={visit._id} className="card visit-card">
                    <img
                      src={isMockMode ? visit.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${visit.imageUrl}`}
                      alt={visit.placeName}
                      className="visit-image"
                    />
                    <div className="visit-info">
                      <h4>{visit.placeName}</h4>
                      <p className="visit-rep">By: {visit.userId?.name}</p>
                      <p className="visit-date">
                        {new Date(visit.createdAt).toLocaleString()}
                      </p>
                      <div className="visit-actions">
                        <button
                          className="btn-map"
                          onClick={() => openInGoogleMaps(visit.location.latitude, visit.location.longitude)}
                        >
                          📍 View on Map
                        </button>
                        <button
                          className="btn-details"
                          onClick={() => setSelectedVisit(visit)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedVisit && GOOGLE_MAPS_API_KEY && (
          <div className="modal" onClick={() => setSelectedVisit(null)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedVisit.placeName}</h3>
                <button className="btn-close" onClick={() => setSelectedVisit(null)}>×</button>
              </div>
              <div className="visit-details">
                <img
                  src={isMockMode ? selectedVisit.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedVisit.imageUrl}`}
                  alt={selectedVisit.placeName}
                  className="detail-image"
                />
                <div className="detail-info">
                  <p><strong>Representative:</strong> {selectedVisit.userId?.name}</p>
                  <p><strong>Date:</strong> {new Date(selectedVisit.createdAt).toLocaleString()}</p>
                  <p><strong>Location:</strong> {selectedVisit.location.latitude.toFixed(6)}, {selectedVisit.location.longitude.toFixed(6)}</p>
                </div>
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '8px' }}
                    center={{
                      lat: selectedVisit.location.latitude,
                      lng: selectedVisit.location.longitude
                    }}
                    zoom={15}
                  >
                    <Marker
                      position={{
                        lat: selectedVisit.location.latitude,
                        lng: selectedVisit.location.longitude
                      }}
                    />
                  </GoogleMap>
                </LoadScript>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
