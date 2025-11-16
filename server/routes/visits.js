const express = require('express');
const Visit = require('../models/Visit');
const User = require('../models/User');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

// Create new visit
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { placeName, latitude, longitude } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    if (!placeName || !latitude || !longitude) {
      return res.status(400).json({ error: 'Place name, latitude, and longitude are required' });
    }

    const visit = await Visit.create({
      userId: req.user.id,
      placeName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUrl: `/uploads/${req.file.filename}`
    });

    res.status(201).json(visit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get visits for current user
router.get('/my-visits', auth, async (req, res) => {
  try {
    const visits = await Visit.findByUserId(req.user.id);
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all visits (admin only)
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const visits = await Visit.findAll();
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get visits by user ID (admin only)
router.get('/user/:userId', auth, isAdmin, async (req, res) => {
  try {
    const visits = await Visit.findByUserId(req.params.userId);
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete visit
router.delete('/:id', auth, async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    // Only admin or visit owner can delete
    if (req.user.role !== 'admin' && visit.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this visit' });
    }

    await Visit.deleteById(req.params.id);
    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
