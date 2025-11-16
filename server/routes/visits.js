const express = require('express');
const visitService = require('../services/visitService');
const { auth, isAdmin } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

// Configure multer for memory storage (we'll upload to Supabase instead of disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  }
});

// Create new visit
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { placeName, latitude, longitude } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Upload image to Supabase Storage
    const imageUrl = await visitService.uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Create visit in database
    const visit = await visitService.createVisit({
      userId: req.user.id,
      placeName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUrl
    });

    res.status(201).json(visit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get visits for current user
router.get('/my-visits', auth, async (req, res) => {
  try {
    const visits = await visitService.getVisitsByUser(req.user.id);
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all visits (admin only)
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const visits = await visitService.getAllVisits();
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get visits by user ID (admin only)
router.get('/user/:userId', auth, isAdmin, async (req, res) => {
  try {
    const visits = await visitService.getVisitsByUser(req.params.userId);
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete visit
router.delete('/:id', auth, async (req, res) => {
  try {
    const visit = await visitService.getVisitById(req.params.id);

    if (!visit) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    // Only admin or visit owner can delete
    if (req.user.role !== 'admin' && visit.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this visit' });
    }

    await visitService.deleteVisit(req.params.id);
    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
