ResumeSmart AI Agent

AI-powered resume analysis system for evaluating, optimizing, and aligning resumes with job descriptions.

Overview

ResumeSmart AI Agent analyzes resumes using AI and compares them against job descriptions to identify skill gaps, role alignment, and improvement areas. Built for candidates targeting ATS-friendly, role-specific resumes.

Tech Stack

Frontend
React

Backend
Node.js, Express.js

Database
PostgreSQL

AI
LLM-based analysis using Ollama

DevOps
Docker for containerized deployment

Core Features

• Resume parsing and structured data extraction
• Job description analysis and keyword mapping
• AI-driven skill gap and relevance scoring
• Actionable resume improvement suggestions
• Modular architecture for extending AI agents

System Flow

Resume Upload → AI Parsing → JD Comparison → Scoring Engine → Feedback Report

Setup

Clone repository
```bash
git clone https://github.com/krishfr/resumesmart-ai-agent.git
cd resumesmart-ai-agent
```
Install frontend dependencies
```bash
cd frontend
npm install
```
Install backend dependencies
```bash
cd ../backend
npm install
```
Environment variables
```bash
OPENAI_API_KEY=your_api_key
```
Run Locally
```bash
docker-compose up
```
Access Application
```bash
http://localhost:3000
```

Use Cases

• Resume screening and optimization
• ATS compatibility evaluation
• Career coaching platforms
• Recruitment and HR tech solutions

Future Enhancements

• Multi-role resume generation
• PDF export and ATS scoring reports
• CI/CD pipeline integration
• Cloud deployment using AWS

Author

Krish Chaudhari
