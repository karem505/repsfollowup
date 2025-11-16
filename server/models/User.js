const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

class User {
  // Create a new user
  static async create({ name, email, password, role = 'rep' }) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
        [name, email.toLowerCase().trim(), hashedPassword, role]
      );

      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Find user by email (including password for authentication)
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Get all users (without password)
  static async findAll() {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // Delete user by ID
  static async deleteById(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  }

  // Compare password
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Remove password field from user object
  static sanitize(user) {
    if (!user) return null;
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

module.exports = User;
