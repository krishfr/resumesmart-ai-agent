// backend/src/models/ResumeChunk.js

const { query } = require('../config/database');
const { envConfig } = require('../config/env');

class ResumeChunk {
  static async create(resumeId, chunkText, chunkIndex, embedding, metadata = {}) {
    const sql = envConfig.DB_TYPE === 'postgres'
      ? `INSERT INTO resume_chunks (resume_id, chunk_text, chunk_index, embedding, metadata, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`
      : `INSERT INTO resume_chunks (resume_id, chunk_text, chunk_index, embedding, metadata, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`;

    const params = [
      resumeId,
      chunkText,
      chunkIndex,
       JSON.stringify(embedding), // store as plain string (NO JSON.stringify)
      JSON.stringify(metadata)
    ];

    try {
      const result = await query(sql, params);

      if (envConfig.DB_TYPE === 'postgres') {
        return result.rows[0];
      } else {
        const insertId = result[0].insertId;
        return await ResumeChunk.findById(insertId);
      }
    } catch (error) {
      throw new Error(`Failed to create chunk: ${error.message}`);
    }
  }

  static async findById(id) {
    const sql = envConfig.DB_TYPE === 'postgres'
      ? 'SELECT * FROM resume_chunks WHERE id = $1'
      : 'SELECT * FROM resume_chunks WHERE id = ?';

    const result = await query(sql, [id]);

    if (envConfig.DB_TYPE === 'postgres') {
      return result.rows[0] || null;
    } else {
      return result[0][0] || null;
    }
  }

  static async findByResumeId(resumeId) {
    const sql = envConfig.DB_TYPE === 'postgres'
      ? 'SELECT * FROM resume_chunks WHERE resume_id = $1 ORDER BY chunk_index'
      : 'SELECT * FROM resume_chunks WHERE resume_id = ? ORDER BY chunk_index';

    const result = await query(sql, [resumeId]);

    return envConfig.DB_TYPE === 'postgres' ? result.rows : result[0];
  }

  static async searchSimilar(queryText, resumeId, topK = 5) {
    const chunks = await ResumeChunk.findByResumeId(resumeId);

    const results = chunks.map(chunk => {
      const similarity = simpleTextSimilarity(queryText, chunk.chunk_text);
      return { ...chunk, similarity };
    });

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  static async deleteByResumeId(resumeId) {
    const sql = envConfig.DB_TYPE === 'postgres'
      ? 'DELETE FROM resume_chunks WHERE resume_id = $1'
      : 'DELETE FROM resume_chunks WHERE resume_id = ?';

    await query(sql, [resumeId]);
  }
}

// Simple keyword-based similarity (fast + works for demo)
function simpleTextSimilarity(query, text) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();

  let score = 0;

  queryWords.forEach(word => {
    if (textLower.includes(word)) {
      score++;
    }
  });

  return score / queryWords.length;
}

module.exports = ResumeChunk;