// backend/src/services/pdf.service.js
const pdf = require('pdf-parse');
const fs = require('fs').promises;
const logger = require('../utils/logger');

class PDFService {
  async extractText(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      
      return {
        text: data.text,
        pages: data.numpages,
        metadata: data.info || {}
      };
    } catch (error) {
      logger.error('PDF extraction failed:', error);
      throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
  }

  async extractStructuredData(text) {
    // Extract structured information from resume text
    const structure = {
      email: this.extractEmail(text),
      phone: this.extractPhone(text),
      skills: this.extractSkills(text),
      experience: this.extractExperience(text),
      education: this.extractEducation(text)
    };
    
    return structure;
  }

  extractEmail(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0] : null;
  }

  extractPhone(text) {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const match = text.match(phoneRegex);
    return match ? match[0] : null;
  }

  extractSkills(text) {
    // Common tech skills
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB',
      'AWS', 'Docker', 'Kubernetes', 'Git', 'TypeScript', 'Angular', 'Vue',
      'Machine Learning', 'AI', 'Data Science', 'DevOps', 'CI/CD'
    ];
    
    const foundSkills = [];
    const lowerText = text.toLowerCase();
    
    for (const skill of skillKeywords) {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }
    
    return foundSkills;
  }

  extractExperience(text) {
    // Simple heuristic: look for year patterns
    const yearRegex = /\b(19|20)\d{2}\s*-\s*(19|20)\d{2}|present\b/gi;
    const matches = text.match(yearRegex) || [];
    return matches.length;
  }

  extractEducation(text) {
    const degrees = ['B.Tech', 'B.E.', 'M.Tech', 'M.S.', 'MBA', 'Ph.D.', 'Bachelor', 'Master'];
    const foundDegrees = [];
    const lowerText = text.toLowerCase();
    
    for (const degree of degrees) {
      if (lowerText.includes(degree.toLowerCase())) {
        foundDegrees.push(degree);
      }
    }
    
    return foundDegrees;
  }
}

module.exports = new PDFService();