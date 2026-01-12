const toolsService = require('./tools.service');
const ragService = require('./rag.service');
const { generateCompletion } = require('../config/ollama');
const { SYSTEM_PROMPTS } = require('../utils/prompts');
const { envConfig } = require('../config/env');
const logger = require('../utils/logger');

class AgentService {
  constructor() {
    this.maxIterations = envConfig.MAX_AGENT_ITERATIONS;
  }

  classifyTask(task) {
    const t = task.toLowerCase();
    if (t.includes('job')) return 'job_search';
    if (t.includes('cover')) return 'cover_letter';
    if (t.includes('skill')) return 'skill_analysis';
    return 'general';
  }

  async analyzeTask(task) {
    const prompt = `Analyze the user request and understand what they want.

User request:
${task}

Reply briefly.`;

    const response = await generateCompletion(
      prompt,
      SYSTEM_PROMPTS.AGENT_SYSTEM
    );

    return {
      analysis: response.response,
      taskType: this.classifyTask(task),
    };
  }

  async planToolUsage(task, taskAnalysis) {
    const tools = [];

    if (taskAnalysis.taskType === 'job_search') {
      tools.push({
        name: 'searchJobs',
        params: { query: task },
      });
    }

    return { tools };
  }

  async executeTool(name, params, profile) {
    if (name === 'searchJobs') {
      const res = await toolsService.searchJobs(profile, params.query);
      return {
        tool: name,
        output: res?.jobs || res?.data || 'No results',
      };
    }

    throw new Error(`Unknown tool ${name}`);
  }

  async synthesizeResponse(task, resumeContext, toolResults) {
    const toolText =
      toolResults.length > 0
        ? toolResults.map(r => `${r.tool}: ${r.output}`).join('\n')
        : 'No tools used';

    const prompt = `
You are an AI career assistant.

Resume context:
${resumeContext}

User request:
${task}

Tool results:
${toolText}

Answer clearly and concisely using the resume context.
`;

    const response = await generateCompletion(
      prompt,
      SYSTEM_PROMPTS.AGENT_SYSTEM
    );

    return response.response;
  }

  async *streamAgentExecution(task, resumeId) {
    const lowerTask = task.toLowerCase();

    // 🔒 SAFE RAG SHORTCUT FOR SUMMARY ONLY
    if (lowerTask.includes('summarize')) {
      yield 'Retrieving resume content...';

      const ragResult = await ragService.queryResume(
        resumeId,
        'Summarize this resume in 5 clear bullet points'
      );

      yield 'Generating summary...';
      yield ragResult.answer;
      return;
    }

    // 🔁 EXISTING FLOW (UNCHANGED)
    yield 'Analyzing task...';
    const taskAnalysis = await this.analyzeTask(task);

    yield 'Retrieving resume context...';
    let resumeContext = '';

    if (resumeId) {
      const ragResult = await ragService.queryResume(resumeId, task);
      resumeContext = ragResult?.answer || '';
    }

    yield 'Planning tool usage...';
    const toolPlan = await this.planToolUsage(task, taskAnalysis);
    const results = [];

    for (const toolCall of toolPlan.tools) {
      yield `Executing ${toolCall.name}...`;

      const toolResult = await this.executeTool(
        toolCall.name,
        toolCall.params,
        {}
      );

      results.push(toolResult);
      yield `${toolCall.name} completed.`;
    }

    yield 'Synthesizing response...';
    const finalResponse = await this.synthesizeResponse(
      task,
      resumeContext,
      results
    );

    yield finalResponse;
  }
}

module.exports = new AgentService();
