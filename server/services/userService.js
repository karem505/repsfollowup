const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

class UserService {
  /**
   * Create a new user
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise<Object>} Created user (without password)
   */
  async createUser(userData) {
    const { name, email, password, role = 'rep' } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Email already exists');
      }
      throw error;
    }

    // Remove password from response
    return this.sanitizeUser(data);
  }

  /**
   * Find user by email
   * @param {string} email
   * @returns {Promise<Object|null>} User object with password
   */
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data;
  }

  /**
   * Find user by ID
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} User object without password
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  /**
   * Get all users
   * @returns {Promise<Array>} Array of users without passwords
   */
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Delete user by ID
   * @param {string} id - User UUID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteUser(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  }

  /**
   * Compare password
   * @param {string} candidatePassword
   * @param {string} hashedPassword
   * @returns {Promise<boolean>}
   */
  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  /**
   * Remove password from user object
   * @param {Object} user
   * @returns {Object} User without password
   */
  sanitizeUser(user) {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user
   * @param {string} id - User UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, updates) {
    // If password is being updated, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, role, created_at')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

module.exports = new UserService();
