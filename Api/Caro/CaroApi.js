const fs = require('fs');
const path = require('path');
const fetch = global.fetch ? global.fetch : require('node-fetch');
const { settings } = require('../../App/Settings');

// Keeping long prompt constants simplified due to length
const DATA_DIR = path.resolve('Data', 'Caro');
const LEARN_FILE = path.join(DATA_DIR, 'learn.json');
const LOG_DIR = path.join(DATA_DIR, 'Logs');

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function defaultConfig() {
  return {
    modes: { 1: {}, 2: {}, 3: {}, 4: {} },
    history: []
  };
}

async function loadLearnConfig(mode) {
  try {
    ensureDirs();
    if (!fs.existsSync(LEARN_FILE)) {
      fs.writeFileSync(LEARN_FILE, JSON.stringify(defaultConfig(), null, 2));
    }
    const raw = fs.readFileSync(LEARN_FILE, 'utf8');
    const json = JSON.parse(raw);
    return json.modes?.[mode] || {};
  } catch (err) {
    return {};
  }
}

async function askChatGPT(prompt, userId = 'user', systemPrompt = '') {
  try {
    const apiKey = settings.apis?.gemini?.key || process.env.GEMINI_API_KEY;
    const model = settings.apis?.gemini?.model || 'gemini-2.5-flash';
    if (!apiKey) throw new Error('Missing Gemini API key');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const messages = [{ role: 'user', content: prompt }];
    const body = { contents: messages.map(m => ({ parts: [{ text: m.content }] })) };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    return parts.map(p => p.text || '').join('').trim();
  } catch (err) {
    return '';
  }
}

async function suggestMove({ board, size, need, myMark, mode = 4, timeoutMs = 1200 }) {
  // Simplified fallback; not full Gemini prompt.
  // Try to pick a center or first empty
  const empties = [];
  for (let i = 0; i < board.length; i++) if (!board[i]) empties.push(i);
  if (empties.length === 0) return -1;
  const center = Math.floor((size * size) / 2);
  if (!board[center]) return center;
  return empties[Math.floor(Math.random() * empties.length)];
}

module.exports = { loadLearnConfig, suggestMove, askChatGPT };
