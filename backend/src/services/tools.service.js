// backend/src/services/tools.service.js
const { generateCompletion } = require('../config/ollama');
const { USER_PROMPTS } = require('../utils/prompts');
const logger = require('../utils/logger');

class ToolsService {
  async searchJobs(userProfile, query) {
    try {
      logger.info('Executing searchJobs tool', { query });
      
      const prompt = USER_PROMPTS.TOOL_SEARCH_JOBS(userProfile, query);
      const response = await generateCompletion(prompt);
      
      // Parse response into structured job data
      const jobs = this.parseJobResults(response.response);
      
      return {
        tool: 'searchJobs',
        success: true,
        data: jobs,
        rawResponse: response.response
      };
    } catch (error) {
      logger.error('searchJobs tool failed:', error);
      return {
        tool: 'searchJobs',
        success: false,
        error: error.message
      };
    }
  }

  async writeCoverLetter(userProfile, jobDetails) {
    try {
      logger.info('Executing writeCoverLetter tool', { company: jobDetails.company });
      
      const prompt = USER_PROMPTS.TOOL_WRITE_COVER_LETTER(userProfile, jobDetails);
      const response = await generateCompletion(prompt);
      
      return {
        tool: 'writeCoverLetter',
        success: true,
        data: {
          coverLetter: response.response,
          company: jobDetails.company,
          position: jobDetails.position
        },
        rawResponse: response.response
      };
    } catch (error) {
      logger.error('writeCoverLetter tool failed:', error);
      return {
        tool: 'writeCoverLetter',
        success: false,
        error: error.message
      };
    }
  }

  async skillGapAnalysis(userProfile, targetRole) {
    try {
      logger.info('Executing skillGapAnalysis tool', { targetRole });
      
      const prompt = USER_PROMPTS.TOOL_SKILL_GAP(userProfile, targetRole);
      const response = await generateCompletion(prompt);
      
      const analysis = this.parseSkillGapAnalysis(response.response);
      
      return {
        tool: 'skillGapAnalysis',
        success: true,
        data: analysis,
        rawResponse: response.response
      };
    } catch (error) {
      logger.error('skillGapAnalysis tool failed:', error);
      return {
        tool: 'skillGapAnalysis',
        success: false,
        error: error.message
      };
    }
  }

  parseJobResults(text) {
    // Simple parsing - in production, use more robust parsing
    const jobs = [];
    const jobPattern = /(\d+)\.\s*\*\*(.+?)\*\*[\s\S]*?Company:\s*(.+?)[\s\S]*?Skills:\s*(.+?)[\s\S]*?/g;
    
    let match;
    let jobCount = 0;
    
    // Fallback: create structured mock data based on response
    const lines = text.split('\n').filter(l => l.trim());
    
    for (let i = 0; i < Math.min(lines.length, 7); i++) {
      if (lines[i].match(/\d+\./)) {
        jobs.push({
          id: `job_${jobCount++}`,
          title: lines[i].replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim(),
          company: `Company ${jobCount}`,
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: '2-4 years',
          location: 'Bangalore, India',
          description: 'Great opportunity in a growing company'
        });
      }
    }
    
    return jobs.length > 0 ? jobs : this.generateMockJobs();
  }

  generateMockJobs() {
    return [
      {
        id: 'job_1',
        title: 'Full Stack Developer',
        company: 'Flipkart',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        experience: '2-4 years',
        location: 'Bangalore, India',
        description: 'Building next-gen e-commerce solutions'
      },
      {
        id: 'job_2',
        title: 'Backend Engineer',
        company: 'Razorpay',
        skills: ['Node.js', 'PostgreSQL', 'Microservices'],
        experience: '3-5 years',
        location: 'Bangalore, India',
        description: 'Scale payment infrastructure for millions'
      },
      {
        id: 'job_3',
        title: 'Frontend Developer',
        company: 'CRED',
        skills: ['React', 'TypeScript', 'Redux'],
        experience: '2-3 years',
        location: 'Bangalore, India',
        description: 'Create beautiful fintech experiences'
      }
    ];
  }

  parseSkillGapAnalysis(text) {
    return {
      matchingSkills: this.extractSection(text, ['matching', 'current', 'have']),
      skillGaps: this.extractSection(text, ['gaps', 'missing', 'need']),
      learningPath: this.extractSection(text, ['learning', 'path', 'roadmap']),
      timeline: this.extractSection(text, ['timeline', 'duration', 'time']),
      resources: this.extractSection(text, ['resources', 'courses', 'certifications'])
    };
  }

  extractSection(text, keywords) {
    const lines = text.split('\n');
    const sectionLines = [];
    let inSection = false;
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (keywords.some(kw => lowerLine.includes(kw))) {
        inSection = true;
      } else if (inSection && line.match(/^\d+\.|^[A-Z]/)) {
        break;
      }
      
      if (inSection && line.trim()) {
        sectionLines.push(line.trim());
      }
    }
    
    return sectionLines.join(' ');
  }
}

module.exports = new ToolsService();