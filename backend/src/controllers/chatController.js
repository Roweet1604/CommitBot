const Chatbot = require('../models/chatbot');
const Knowledge = require('../models/Knowledge');
const { findBestMatch } = require('../utils/textProcessor');

const buildContext = (knowledgeEntries) => {
  return knowledgeEntries
    .map(entry => `${entry.title}:\n${entry.rawContent}`)
    .join('\n\n');
};

const buildSystemPrompt = (context) => {
  return `You are a helpful customer support assistant. Answer questions based ONLY on the information provided below. If the answer is not in the provided information, say "I'm sorry, I don't have that information. Please contact us directly for help." Keep answers short, friendly and helpful.

KNOWLEDGE BASE:
${context}`;
};

// Anthropic
const callAnthropic = async (apiKey, model, userMessage, context) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model || 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: buildSystemPrompt(context),
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error');
  return data.content[0].text;
};

// OpenAI
const callOpenAI = async (apiKey, model, userMessage, context) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-3.5-turbo',
      max_tokens: 300,
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        { role: 'user', content: userMessage }
      ]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');
  return data.choices[0].message.content;
};

// Google Gemini
const callGoogle = async (apiKey, model, userMessage, context) => {
  const modelName = model || 'gemini-1.5-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${buildSystemPrompt(context)}\n\nUser: ${userMessage}`
          }]
        }],
        generationConfig: { maxOutputTokens: 300 }
      })
    }
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Google API error');
  return data.candidates[0].content.parts[0].text;
};

// Groq (free tier available!)
const callGroq = async (apiKey, model, userMessage, context) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        { role: 'user', content: userMessage }
      ]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Groq API error');
  return data.choices[0].message.content;
};

// Mistral
const callMistral = async (apiKey, model, userMessage, context) => {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'mistral-small-latest',
      max_tokens: 300,
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        { role: 'user', content: userMessage }
      ]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Mistral API error');
  return data.choices[0].message.content;
};

// POST /api/chat/:botId
const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const chatbot = await Chatbot.findById(req.params.botId);

    if (!chatbot || !chatbot.isActive) {
      return res.status(404).json({ message: 'Chatbot not found' });
    }

    const knowledgeEntries = await Knowledge.find({ chatbot: chatbot._id });
    let reply = '';

    if (chatbot.responseMode === 'keyword') {
      const match = findBestMatch(message, knowledgeEntries);
      reply = match
        ? match.text
        : "I'm sorry, I don't have an answer for that yet. Please contact us directly for help.";

    } else if (chatbot.responseMode === 'ai') {
      if (!chatbot.encryptedApiKey) {
        reply = "AI mode is enabled but no API key is set. Please add your API key in settings.";
      } else {
        try {
          const apiKey = chatbot.getApiKey();
          const context = buildContext(knowledgeEntries);
          const model = chatbot.apiModel;
          const provider = chatbot.apiKeyProvider;

          if (provider === 'anthropic') {
            reply = await callAnthropic(apiKey, model, message, context);
          } else if (provider === 'openai') {
            reply = await callOpenAI(apiKey, model, message, context);
          } else if (provider === 'google') {
            reply = await callGoogle(apiKey, model, message, context);
          } else if (provider === 'groq') {
            reply = await callGroq(apiKey, model, message, context);
          } else if (provider === 'mistral') {
            reply = await callMistral(apiKey, model, message, context);
          } else {
            // Try OpenAI format as default for unknown providers
            reply = await callOpenAI(apiKey, model, message, context);
          }
        } catch (err) {
          console.error('AI API error:', err.message);
          const match = findBestMatch(message, knowledgeEntries);
          reply = match
            ? match.text
            : "I'm sorry, I couldn't process that right now. Please try again or contact us directly.";
        }
      }
    }

    chatbot.totalMessages += 1;
    await chatbot.save();

    res.json({
      reply,
      botName: chatbot.appearance.botDisplayName,
      mode: chatbot.responseMode
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/chat/:botId/config
const getBotConfig = async (req, res) => {
  try {
    const chatbot = await Chatbot.findById(req.params.botId);
    if (!chatbot || !chatbot.isActive) {
      return res.status(404).json({ message: 'Chatbot not found' });
    }
    res.json({
      name: chatbot.name,
      greetingMessage: chatbot.greetingMessage,
      appearance: chatbot.appearance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { chat, getBotConfig };