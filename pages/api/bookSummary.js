// pages/api/bookSummary.js

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, apiKey } = req.body;

  if (!prompt || !apiKey) {
    return res.status(400).json({ error: 'Please provide a prompt and API key' });
  }

  try {
    const genAi = new GoogleGenerativeAI(apiKey);
    const model = genAi.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      history: [{ role: 'system', parts: [prompt] }],
      generationConfig: {
        maxOutputTokens: 2000,
      },
    });

    const { messages } = await chat.advance();

    res.status(200).json({ summary: messages[0].parts.join('') });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'An error occurred while generating summary' });
  }
}
