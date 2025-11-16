const { pool } = require('../config/database');

class Visit {
  // Create a new visit
  static async create({ userId, placeName, latitude, longitude, imageUrl }) {
    try {
      const result = await pool.query(
        'INSERT INTO visits (user_id, place_name, latitude, longitude, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, placeName.trim(), latitude, longitude, imageUrl]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find visit by ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM visits WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Get all visits for a specific user
  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT v.*, u.name as user_name, u.email as user_email
       FROM visits v
       LEFT JOIN users u ON v.user_id = u.id
       WHERE v.user_id = $1
       ORDER BY v.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  // Get all visits (admin only)
  static async findAll() {
    const result = await pool.query(
      `SELECT v.*, u.name as user_name, u.email as user_email
       FROM visits v
       LEFT JOIN users u ON v.user_id = u.id
       ORDER BY v.created_at DESC`
    );
    return result.rows;
  }

  // Delete visit by ID
  static async deleteById(id) {
    const result = await pool.query(
      'DELETE FROM visits WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  }

  // Check if user owns the visit
  static async isOwner(visitId, userId) {
    const result = await pool.query(
      'SELECT user_id FROM visits WHERE id = $1',
      [visitId]
    );

    if (!result.rows[0]) return false;
    return result.rows[0].user_id === userId;
  }
}

module.exports = Visit;
