const express = require('express');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register new user (admin only in production, but we need initial admin)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = await userService.createUser({
      name,
      email,
      password,
      role: role || 'rep'
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user (this returns user WITH password for authentication)
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await userService.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const sanitizedUser = userService.sanitizeUser(user);

    res.json({
      user: sanitizedUser,
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
