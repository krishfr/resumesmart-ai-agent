# ResumeSmart AI Agent

AI-powered resume analysis system that evaluates resumes against job descriptions to identify skill gaps, role alignment, and improvement opportunities.

## Overview

ResumeSmart AI Agent helps candidates understand how well their resume matches a target role. The system analyzes resume content, compares it with a job description, and generates structured feedback on missing skills, relevance, and areas for improvement.

The project was built to explore practical LLM integration within a full-stack application while solving a common problem faced by job seekers: tailoring resumes for specific roles.

## Tech Stack

### Frontend

* React.js

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### AI

* LLM-based analysis using Ollama

### DevOps

* Docker

## Core Features

* Resume parsing and structured data extraction
* Job description analysis and keyword mapping
* AI-driven skill gap analysis
* Resume-to-role relevance scoring
* Actionable recommendations for resume improvement
* Modular architecture for extending AI-powered workflows

## System Flow

Resume Upload → Resume Parsing → Job Description Analysis → AI Evaluation → Scoring Engine → Feedback Report

## Setup

### Clone Repository

```bash
git clone https://github.com/krishfr/resumesmart-ai-agent.git
cd resumesmart-ai-agent
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Install Backend Dependencies

```bash
cd ../backend
npm install
```

### Environment Variables

```bash
OPENAI_API_KEY=your_api_key
```

## Run Locally

```bash
docker-compose up
```

## Access Application

```bash
http://localhost:3000
```

## Use Cases

* Resume screening and optimization
* ATS compatibility evaluation
* Career guidance platforms
* Recruitment and HR technology solutions

## Key Learnings

* Integrating LLMs into real-world web applications
* Designing prompt workflows for consistent AI responses
* Managing data flow between frontend, backend, database, and AI services
* Containerized development and deployment using Docker
* Building scalable full-stack application architecture

## Future Enhancements

* Multi-role resume generation
* PDF export and ATS scoring reports
* CI/CD pipeline integration
* Cloud deployment on AWS

## Author

**Krish Chaudhari**
