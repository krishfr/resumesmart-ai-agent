// backend/src/utils/chunker.js
const { envConfig } = require('../config/env');

class Chunker {
  constructor(chunkSize = envConfig.CHUNK_SIZE, overlap = envConfig.CHUNK_OVERLAP) {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
  }

  chunkText(text) {
    // Split by sentences first
    const sentences = this.splitIntoSentences(text);
    const chunks = [];
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const sentence of sentences) {
      const testChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
      
      if (testChunk.length > this.chunkSize && currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          index: chunkIndex++,
          length: currentChunk.length
        });
        
        // Add overlap
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(this.overlap / 5));
        currentChunk = overlapWords.join(' ') + ' ' + sentence;
      } else {
        currentChunk = testChunk;
      }
    }
    
    // Add remaining chunk
    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
        length: currentChunk.length
      });
    }
    
    return chunks;
  }

  splitIntoSentences(text) {
    // Simple sentence splitting
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  chunkBySection(text) {
    // Chunk by common resume sections
    const sections = {
      summary: this.extractSection(text, ['summary', 'objective', 'profile']),
      experience: this.extractSection(text, ['experience', 'work history', 'employment']),
      education: this.extractSection(text, ['education', 'academic', 'qualification']),
      skills: this.extractSection(text, ['skills', 'technologies', 'competencies']),
      projects: this.extractSection(text, ['projects', 'portfolio'])
    };
    
    const chunks = [];
    let index = 0;
    
    for (const [sectionName, sectionText] of Object.entries(sections)) {
      if (sectionText) {
        const sectionChunks = this.chunkText(sectionText);
        sectionChunks.forEach(chunk => {
          chunks.push({
            ...chunk,
            index: index++,
            section: sectionName
          });
        });
      }
    }
    
    return chunks;
  }

  extractSection(text, keywords) {
    const lowerText = text.toLowerCase();
    
    for (const keyword of keywords) {
      const index = lowerText.indexOf(keyword);
      if (index !== -1) {
        // Find next section or end of text
        const nextSectionIndex = this.findNextSection(lowerText, index + keyword.length);
        return text.substring(index, nextSectionIndex).trim();
      }
    }
    
    return null;
  }

  findNextSection(text, startIndex) {
    const sectionHeaders = [
      'summary', 'objective', 'experience', 'education', 'skills', 
      'projects', 'certifications', 'awards'
    ];
    
    let nearestIndex = text.length;
    
    for (const header of sectionHeaders) {
      const index = text.indexOf(header, startIndex);
      if (index !== -1 && index < nearestIndex) {
        nearestIndex = index;
      }
    }
    
    return nearestIndex;
  }
}

module.exports = new Chunker