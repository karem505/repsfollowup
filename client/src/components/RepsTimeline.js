import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { userAPI, visitAPI } from '../utils/api';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker colors for different reps
const getMarkerIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const colors = ['red', 'blue', 'green', 'orange', 'yellow', 'violet', 'grey', 'black'];

const RepsTimeline = () => {
  const [reps, setReps] = useState([]);
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [selectedRep, setSelectedRep] = useState('all');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC

  const applyFilters = useCallback(() => {
    let filtered = [...visits];

    // Filter by rep
    if (selectedRep !== 'all') {
      filtered = filtered.filter(visit => visit.userId === selectedRep || visit.userId?._id === selectedRep);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(visit => new Date(visit.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(visit => new Date(visit.createdAt) <= endDateTime);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredVisits(filtered);

    // Update map center to show filtered visits
    if (filtered.length > 0) {
      setMapCenter([filtered[0].location.latitude, filtered[0].location.longitude]);
    }
  }, [visits, selectedRep, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, visitsResponse] = await Promise.all([
        userAPI.getAll(),
        visitAPI.getAllVisits()
      ]);

      const usersData = usersResponse.data;
      const visitsData = visitsResponse.data;

      // Filter only reps (not admins)
      const repsOnly = usersData.filter(user => user.role === 'rep');
      setReps(repsOnly);
      setVisits(visitsData);

      // Set initial map center to first visit if available
      if (visitsData.length > 0) {
        setMapCenter([visitsData[0].location.latitude, visitsData[0].location.longitude]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRepName = (visit) => {
    if (typeof visit.userId === 'object' && visit.userId?.name) {
      return visit.userId.name;
    }
    const rep = reps.find(r => r._id === visit.userId);
    return rep ? rep.name : 'Unknown';
  };

  const getRepId = (visit) => {
    if (typeof visit.userId === 'object' && visit.userId?._id) {
      return visit.userId._id;
    }
    return visit.userId;
  };

  const getRepColor = (repId) => {
    const index = reps.findIndex(r => r._id === repId);
    return colors[index % colors.length];
  };

  // Group visits by date for timeline
  const groupVisitsByDate = () => {
    const grouped = {};
    filteredVisits.forEach(visit => {
      const date = new Date(visit.createdAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(visit);
    });
    return grouped;
  };

  // Get polyline coordinates for rep's route
  const getRepRoute = (repId) => {
    const repVisits = filteredVisits
      .filter(visit => getRepId(visit) === repId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return repVisits.map(visit => [visit.location.latitude, visit.location.longitude]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading timeline...</div>
      </div>
    );
  }

  const groupedVisits = groupVisitsByDate();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Representative
            </label>
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Representatives</option>
              {reps.map(rep => (
                <option key={rep._id} value={rep._id}>{rep.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredVisits.length} visit{filteredVisits.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Map */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Map View</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Draw route lines for selected rep or all reps */}
            {selectedRep === 'all' ? (
              reps.map(rep => {
                const route = getRepRoute(rep._id);
                if (route.length < 2) return null;
                return (
                  <Polyline
                    key={`route-${rep._id}`}
                    positions={route}
                    color={getRepColor(rep._id)}
                    weight={2}
                    opacity={0.5}
                  />
                );
              })
            ) : (
              <Polyline
                positions={getRepRoute(selectedRep)}
                color="blue"
                weight={3}
                opacity={0.7}
              />
            )}

            {/* Markers for all filtered visits */}
            {filteredVisits.map((visit, index) => {
              const repId = getRepId(visit);
              const color = getRepColor(repId);

              return (
                <Marker
                  key={visit._id || index}
                  position={[visit.location.latitude, visit.location.longitude]}
                  icon={getMarkerIcon(color)}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-semibold">{visit.placeName}</h4>
                      <p className="text-sm text-gray-600">{getRepName(visit)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(visit.createdAt).toLocaleString()}
                      </p>
                      {visit.imageUrl && (
                        <img
                          src={visit.imageUrl}
                          alt={visit.placeName}
                          className="mt-2 w-48 h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {reps.map((rep, index) => (
            <div key={rep._id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getRepColor(rep._id) }}
              />
              <span className="text-sm">{rep.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>

        {Object.keys(groupedVisits).length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No visits found for the selected filters
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedVisits).map(([date, dateVisits]) => (
              <div key={date} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-700 mb-3">{date}</h4>
                <div className="space-y-3">
                  {dateVisits.map((visit, index) => {
                    const repId = getRepId(visit);
                    const color = getRepColor(repId);

                    return (
                      <div
                        key={visit._id || index}
                        className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {visit.imageUrl && (
                            <img
                              src={visit.imageUrl}
                              alt={visit.placeName}
                              className="w-20 h-20 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <h5 className="font-semibold">{visit.placeName}</h5>
                            </div>
                            <p className="text-sm text-gray-600">{getRepName(visit)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(visit.createdAt).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {visit.location.latitude.toFixed(4)}, {visit.location.longitude.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepsTimeline;
