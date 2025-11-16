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

    const visit = new Visit({
      userId: req.user._id,
      placeName,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      imageUrl: `/uploads/${req.file.filename}`
    });

    await visit.save();

    // Populate user info
    await visit.populate('userId', 'name email');

    res.status(201).json(visit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get visits for current user
router.get('/my-visits', auth, async (req, res) => {
  try {
    const visits = await Visit.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all visits (admin only)
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const visits = await Visit.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role');
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get visits by user ID (admin only)
router.get('/user/:userId', auth, isAdmin, async (req, res) => {
  try {
    const visits = await Visit.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
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
    if (req.user.role !== 'admin' && visit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this visit' });
    }

    await Visit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
