// backend/src/models/Conversation.js
const { query } = require('../config/database');
const { envConfig } = require('../config/env');

class Conversation {
  static async create(userId, resumeId, title = 'New Conversation') {
    const sql = envConfig.DB_TYPE === 'postgres'
      ? `INSERT INTO conversations (user_id, resume_id, title, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`
      : `INSERT INTO conversations (user_id, resume_id, title, created_at, updated_at) 
         VALUES (?, ?, ?, NOW(), NOW())`;
    
    const params = [userId, resumeId, title];
    const result = await query(sql, params);
    
    if (envConfig.DB_TYPE === 'postgres') {
      return result.rows[0];
    } else {
      const insertId = result[0].insertId;
      return await Conversation.findById(insertId);
    }
  }

  static async findById(id) {
    const sql = envConfig.DB_TYPE === 'postgres'
      ? 'SELECT * FROM conversations WHERE id = $1'
      : 'SELECT * FROM conversations WHERE id = ?';
    
    const result = await query(sql, [id]);
    
    if (envConfig.DB_TYPE === 'postgres') {
      return result.rows[0] || null;
    } else {
      return result[0][0] || null;
    }
  }

  static async findByUserId(userId) {
    const sql = envConfig.DB_TYPE === 'postgres'
      ? 'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC'
      : 'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC';
    
    const result = await query(sql, [userId]);
    
    return envConfig.DB_TYPE === 'postgres' ? result.rows : result[0];
  }

  static async addMessage(conversationId, role, content, metadata = {}) {
    const sql = envConfig.DB_TYPE === 'postgres'
      ? `INSERT INTO messages (conversation_id, role, content, metadata, created_at) 
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`
      : `INSERT INTO messages (conversation_id, role, content, metadata, created_at) 
         VALUES (?, ?, ?, ?, NOW())`;
    
    const params = [conversationId, role, content, JSON.stringify(metadata)];
    const result = await query(sql, params);
    
    // Update conversation timestamp
    await Conversation.updateTimestamp(conversationId);
    
    if (envConfig.DB_TYPE === 'postgres') {
      return result.rows[0];
    } else {
      return { insertId: result[0].insertId };
    }
  }

  static async getMessages(conversationId, limit = 50) {
    const sql = envConfig.DB_TYPE === 'postgres'
      ? `SELECT * FROM messages WHERE conversation_id = $1 
         ORDER BY created_at DESC LIMIT $2`
      : `SELECT * FROM messages WHERE conversation_id = ? 
         ORDER BY created_at DESC LIMIT ?`;
    
    const result = await query(sql, [conversationId, limit]);
    const messages = envConfig.DB_TYPE === 'postgres' ? result.rows : result[0];
    
    return messages.reverse(); // Return in chronological order
  }

  static async updateTimestamp(id) {
    const sql = envConfig.DB_TYPE === 'postgres'
      ? 'UPDATE conversations SET updated_at = NOW() WHERE id = $1'
      : 'UPDATE conversations SET updated_at = NOW() WHERE id = ?';
    
    await query(sql, [id]);
  }

  static async delete(id) {
    const sql = envConfig.DB_TYPE === 'postgres'
      ? 'DELETE FROM conversations WHERE id = $1'
      : 'DELETE FROM conversations WHERE id = ?';
    
    await query(sql, [id]);
  }
}

module.exports = Conversation;