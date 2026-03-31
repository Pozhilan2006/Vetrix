// backend/src/services/llmService.js — V2.4 INTENT LAYER
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { z } = require('zod');
const SYSTEM_PROMPT = require('../utils/systemPrompt');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Zod schema — V2.4: Expanded actions for memory and contacts
const IntentSchema = z.object({
  intent_detected: z.boolean(),
  action: z.enum(['transfer', 'swap', 'balance', 'explanation', 'repeat', 'add_contact', 'unknown']),
  chain: z.enum(['ethereum', 'polygon', 'arbitrum', 'sepolia']).nullable(),
  asset: z.enum(['ETH', 'USDC', 'USDT', 'DAI']).nullable(),
  amount: z.string().nullable(),
  to_address: z.string().nullable(),
  swap: z.object({
    from: z.string().nullable(),
    to: z.string().nullable(),
    amount: z.string().nullable(),
  }).nullable(),
  confidence: z.number().min(0).max(1),
  human_readable_summary: z.string(),
  risk_flags: z.array(z.string()),
});

const parseUserIntent = async (userMessage, sessionState = {}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = `Session State: ${JSON.stringify(sessionState)}\nUser Message: ${userMessage}`;

    const start = Date.now();
    const result = await model.generateContent(prompt);
    const latency = Date.now() - start;
    console.log(`[LATENCY] Gemini response: ${latency}ms`);

    const text = result.response.text();

    // Strip markdown fences and extract JSON
    let jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    const first = jsonStr.indexOf('{');
    const last = jsonStr.lastIndexOf('}');
    if (first !== -1 && last !== -1) {
      jsonStr = jsonStr.substring(first, last + 1);
    }

    const raw = JSON.parse(jsonStr);

    // Zod validation — throws if invalid
    const parsed = IntentSchema.parse(raw);
    return parsed;
  } catch (error) {
    console.error('LLM Intent Parsing Error:', error.message);
    return {
      intent_detected: false,
      action: 'unknown',
      chain: null,
      asset: null,
      amount: null,
      to_address: null,
      swap: null,
      confidence: 0,
      human_readable_summary: 'Sorry, I could not process that. Please try rephrasing your request.',
      risk_flags: [],
    };
  }
};

module.exports = { parseUserIntent, IntentSchema };
