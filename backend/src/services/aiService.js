// backend/src/services/aiService.js

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzeResume(text) {
  const response = await groq.chat.completions.create({
    messages: [
      { role: "user", content: text }
    ],
    model: "llama-3.1-8b-instant",
  });

  return response.choices[0].message.content;
}

module.exports = { analyzeResume };