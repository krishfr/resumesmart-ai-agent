// backend/src/models/Resume.js
const { query } = require('../config/database');
const { envConfig } = require('../config/env');

class Resume {
  static async create(userId, filename, originalName, fileSize, metadata = {}) {
    const sql = `
      INSERT INTO public.resumes (
        user_id,
        filename,
        original_name,
        file_size,
        metadata,
        processing_status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, 'processing', NOW(), NOW())
      RETURNING *
    `;

    const params = [
      userId,
      filename,
      originalName,
      fileSize,
      JSON.stringify(metadata)
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  static async findById(id) {
    const sql = `
      SELECT *
      FROM public.resumes
      WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT *
      FROM public.resumes
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await query(sql, [userId]);
    return result.rows;
  }

  static async updateProcessingStatus(id, status, errorMessage = null) {
    const sql = `
      UPDATE public.resumes
      SET
        processing_status = $1,
        error_message = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(sql, [status, errorMessage, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const sql = `
      DELETE FROM public.resumes
      WHERE id = $1
    `;

    await query(sql, [id]);
  }
}

module.exports = Resume;
