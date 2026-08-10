const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
  console.warn('[AI] WARNING: GEMINI_API_KEY is not configured. AI Chat will return errors.');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

/**
 * Returns a configured Gemini generative model with system instructions.
 * @param {string} systemInstruction
 */
const getModel = (systemInstruction) => {
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction,
  });
};

module.exports = {
  getModel,
  hasValidKey: !!(API_KEY && API_KEY !== 'your_gemini_api_key_here'),
};
