// Mock data for testing without backend

// Sample users
export const mockUsers = [
  {
    _id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'rep',
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    _id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'rep',
    createdAt: new Date('2024-02-20').toISOString()
  },
  {
    _id: 'user3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    _id: 'user4',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'rep',
    createdAt: new Date('2024-03-10').toISOString()
  }
];

// Sample visits with placeholder images
export const mockVisits = [
  {
    _id: 'visit1',
    userId: { _id: 'user1', name: 'John Doe' },
    placeName: 'Downtown Coffee Shop',
    location: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    createdAt: new Date('2024-11-15T09:30:00').toISOString()
  },
  {
    _id: 'visit2',
    userId: { _id: 'user1', name: 'John Doe' },
    placeName: 'Central Park Entrance',
    location: {
      latitude: 40.7829,
      longitude: -73.9654
    },
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&h=300&fit=crop',
    createdAt: new Date('2024-11-14T14:15:00').toISOString()
  },
  {
    _id: 'visit3',
    userId: { _id: 'user2', name: 'Jane Smith' },
    placeName: 'Tech Store on 5th Avenue',
    location: {
      latitude: 40.7614,
      longitude: -73.9776
    },
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop',
    createdAt: new Date('2024-11-15T11:00:00').toISOString()
  },
  {
    _id: 'visit4',
    userId: { _id: 'user1', name: 'John Doe' },
    placeName: 'Brooklyn Bridge Viewpoint',
    location: {
      latitude: 40.7061,
      longitude: -73.9969
    },
    imageUrl: 'https://images.unsplash.com/photo-1490642914619-7955a3fd483c?w=400&h=300&fit=crop',
    createdAt: new Date('2024-11-13T16:45:00').toISOString()
  },
  {
    _id: 'visit5',
    userId: { _id: 'user4', name: 'Sarah Johnson' },
    placeName: 'Times Square Billboard',
    location: {
      latitude: 40.7580,
      longitude: -73.9855
    },
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop',
    createdAt: new Date('2024-11-16T10:20:00').toISOString()
  },
  {
    _id: 'visit6',
    userId: { _id: 'user2', name: 'Jane Smith' },
    placeName: 'Madison Square Garden',
    location: {
      latitude: 40.7505,
      longitude: -73.9934
    },
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    createdAt: new Date('2024-11-12T13:30:00').toISOString()
  }
];

// Get current user from localStorage or return default
export const getCurrentMockUser = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  // Default to first rep user
  return mockUsers[0];
};

// Generate a unique ID for new entries
let idCounter = 100;
export const generateId = () => {
  return `mock-${Date.now()}-${idCounter++}`;
};
