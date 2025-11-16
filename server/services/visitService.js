const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class VisitService {
  constructor() {
    this.bucketName = 'visit-images';
  }

  /**
   * Upload image to Supabase Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} mimetype - File MIME type
   * @returns {Promise<string>} Public URL of uploaded image
   */
  async uploadImage(fileBuffer, originalName, mimetype) {
    // Generate unique filename
    const ext = originalName.split('.').pop();
    const fileName = `visit-${Date.now()}-${uuidv4()}.${ext}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(filePath, fileBuffer, {
        contentType: mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  }

  /**
   * Delete image from Supabase Storage
   * @param {string} imageUrl - Full public URL of the image
   * @returns {Promise<boolean>}
   */
  async deleteImage(imageUrl) {
    try {
      // Extract file path from URL
      // URL format: https://xxxxx.supabase.co/storage/v1/object/public/visit-images/filename.jpg
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([fileName]);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Create a new visit
   * @param {Object} visitData - { userId, placeName, latitude, longitude, imageUrl }
   * @returns {Promise<Object>} Created visit
   */
  async createVisit(visitData) {
    const { userId, placeName, latitude, longitude, imageUrl } = visitData;

    const { data, error } = await supabase
      .from('visits')
      .insert([
        {
          user_id: userId,
          place_name: placeName.trim(),
          latitude,
          longitude,
          image_url: imageUrl
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return this.formatVisit(data);
  }

  /**
   * Get visits by user ID
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} Array of visits
   */
  async getVisitsByUser(userId) {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(visit => this.formatVisit(visit));
  }

  /**
   * Get all visits (with user information)
   * @returns {Promise<Array>} Array of visits with user data
   */
  async getAllVisits() {
    const { data, error } = await supabase
      .from('visits')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(visit => ({
      ...this.formatVisit(visit),
      user: visit.users
    }));
  }

  /**
   * Get visit by ID
   * @param {string} visitId - Visit UUID
   * @returns {Promise<Object|null>} Visit object
   */
  async getVisitById(visitId) {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('id', visitId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data ? this.formatVisit(data) : null;
  }

  /**
   * Delete visit by ID
   * @param {string} visitId - Visit UUID
   * @returns {Promise<Object>} Deleted visit object
   */
  async deleteVisit(visitId) {
    // First get the visit to retrieve image URL
    const visit = await this.getVisitById(visitId);

    if (!visit) {
      throw new Error('Visit not found');
    }

    // Delete from database
    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', visitId);

    if (error) {
      throw error;
    }

    // Delete image from storage
    if (visit.imageUrl) {
      await this.deleteImage(visit.imageUrl);
    }

    return visit;
  }

  /**
   * Format visit object to match frontend expectations
   * @param {Object} visit - Raw visit from database
   * @returns {Object} Formatted visit
   */
  formatVisit(visit) {
    if (!visit) return null;

    return {
      id: visit.id,
      userId: visit.user_id,
      placeName: visit.place_name,
      location: {
        latitude: parseFloat(visit.latitude),
        longitude: parseFloat(visit.longitude)
      },
      imageUrl: visit.image_url,
      createdAt: visit.created_at,
      // Include user data if present
      ...(visit.users && { user: visit.users })
    };
  }
}

module.exports = new VisitService();
