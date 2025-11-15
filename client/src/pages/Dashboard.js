import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { visitAPI } from '../utils/api';
import './Dashboard.css';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('new');
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);

  // New visit form
  const [placeName, setPlaceName] = useState('');
  const [location, setLocation] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (activeView === 'history') {
      fetchVisits();
    }
  }, [activeView]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const { data } = await visitAPI.getMyVisits();
      setVisits(data);
    } catch (error) {
      setToast({ message: 'Failed to load visits', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setToast({ message: 'Geolocation is not supported by your browser', type: 'error' });
      return;
    }

    setToast({ message: 'Getting your location...', type: 'info' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setToast({ message: 'Location captured successfully', type: 'success' });
      },
      (error) => {
        setToast({ message: 'Failed to get location. Please enable location services.', type: 'error' });
      }
    );
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      setToast({ message: 'Failed to access camera. Please grant camera permissions.', type: 'error' });
    }
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], 'visit-photo.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setCapturedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setToast({ message: 'Please capture or upload an image', type: 'error' });
      return;
    }

    if (!location) {
      setToast({ message: 'Please capture your location', type: 'error' });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('placeName', placeName);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);

      await visitAPI.create(formData);
      setToast({ message: 'Visit recorded successfully!', type: 'success' });

      // Reset form
      setPlaceName('');
      setLocation(null);
      setCapturedImage(null);
      setImageFile(null);
    } catch (error) {
      setToast({
        message: error.response?.data?.error || 'Failed to record visit',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openInGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="dashboard">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Navbar />

      <div className="container">
        <div className="dashboard-header">
          <h2>My Dashboard</h2>
        </div>

        <div className="view-toggle">
          <button
            className={`toggle-btn ${activeView === 'new' ? 'active' : ''}`}
            onClick={() => setActiveView('new')}
          >
            📍 New Visit
          </button>
          <button
            className={`toggle-btn ${activeView === 'history' ? 'active' : ''}`}
            onClick={() => setActiveView('history')}
          >
            📋 My History
          </button>
        </div>

        {activeView === 'new' && (
          <div className="new-visit-section">
            <div className="card">
              <h3>Record New Visit</h3>
              <form onSubmit={handleSubmit} className="visit-form">
                <div className="form-group">
                  <label>Place Name *</label>
                  <input
                    type="text"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    placeholder="Enter the name of the place"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <button
                    type="button"
                    className="btn-location"
                    onClick={getLocation}
                  >
                    📍 {location ? 'Update Location' : 'Capture Location'}
                  </button>
                  {location && (
                    <div className="location-display">
                      <p>Lat: {location.latitude.toFixed(6)}</p>
                      <p>Lng: {location.longitude.toFixed(6)}</p>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Photo *</label>
                  <div className="photo-controls">
                    <button
                      type="button"
                      className="btn-camera"
                      onClick={startCamera}
                    >
                      📷 Open Camera
                    </button>
                    <label className="btn-upload">
                      📁 Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {capturedImage && (
                    <div className="image-preview">
                      <img src={capturedImage} alt="Captured" />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => {
                          setCapturedImage(null);
                          setImageFile(null);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting || !placeName || !location || !imageFile}
                >
                  {submitting ? 'Recording...' : '✓ Record Visit'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeView === 'history' && (
          <div className="history-section">
            <h3>My Visit History</h3>
            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : visits.length === 0 ? (
              <div className="empty-state">
                <p>No visits recorded yet</p>
              </div>
            ) : (
              <div className="visits-grid">
                {visits.map((visit) => (
                  <div key={visit._id} className="card visit-card">
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${visit.imageUrl}`}
                      alt={visit.placeName}
                      className="visit-image"
                    />
                    <div className="visit-info">
                      <h4>{visit.placeName}</h4>
                      <p className="visit-date">
                        {new Date(visit.createdAt).toLocaleString()}
                      </p>
                      <div className="visit-actions">
                        <button
                          className="btn-map"
                          onClick={() => openInGoogleMaps(visit.location.latitude, visit.location.longitude)}
                        >
                          📍 Open Map
                        </button>
                        <button
                          className="btn-details"
                          onClick={() => setSelectedVisit(visit)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showCamera && (
          <div className="camera-modal">
            <div className="camera-container">
              <div className="camera-header">
                <h3>Take Photo</h3>
                <button className="btn-close" onClick={stopCamera}>×</button>
              </div>
              <video ref={videoRef} autoPlay playsInline className="camera-preview" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div className="camera-controls">
                <button className="btn-capture" onClick={capturePhoto}>
                  📷 Capture
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedVisit && GOOGLE_MAPS_API_KEY && (
          <div className="modal" onClick={() => setSelectedVisit(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedVisit.placeName}</h3>
                <button className="btn-close" onClick={() => setSelectedVisit(null)}>×</button>
              </div>
              <div className="visit-details">
                <img
                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedVisit.imageUrl}`}
                  alt={selectedVisit.placeName}
                  className="detail-image"
                />
                <div className="detail-info">
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

export default Dashboard;
