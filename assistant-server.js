import express from 'express';
import cors from 'cors';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  })
);
app.use(express.json({ limit: '256kb' }));

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.ROZA_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
  temperature: 0.35,
});

const SYSTEM_PROMPT = `
You are Roza Lab Assistant, the live conversational face of Rozalab × Carino.

Style rules:
- Be concise, technical, premium, and human.
- Explain the brief, the pairing logic, the process, and the launch decision clearly.
- If a user asks for a recommendation, give a clear answer plus the reason.
- If you use research, cite the sources inline in simple bullets.
- Never sound like a template or generic chatbot.
- Speak like a studio partner helping Carino develop premium ice cream.
`;

function normalizeHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-10)
    .map((item) => {
      if (!item || typeof item.content !== 'string') return null;
      if (item.role === 'assistant') return new AIMessage(item.content);
      return new HumanMessage(item.content);
    })
    .filter(Boolean);
}

async function tavilySearch(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || !query) return [];

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      max_results: 5,
      include_answer: false,
      include_raw_content: false,
      include_images: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tavily search failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const results = Array.isArray(data?.results) ? data.results : [];
  return results.map((result) => ({
    title: result.title || 'Untitled result',
    url: result.url || '',
    content: result.content || result.raw_content || '',
  }));
}

function renderSourceBullets(results) {
  if (!results.length) return 'No live research sources were attached.';
  return results
    .map((result, index) => `${index + 1}. ${result.title}${result.url ? ` — ${result.url}` : ''}`)
    .join('\n');
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'rozalab-assistant' });
});

app.post('/api/assistant', async (req, res) => {
  try {
    const { message, history = [], session_id = null } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing message' });
    }

    const searchResults = await tavilySearch(message);
    const researchContext = searchResults.length
      ? searchResults
          .map(
            (result, index) =>
              `[${index + 1}] ${result.title}\n${result.url}\n${result.content}`
          )
          .join('\n\n')
      : 'No external live-research context was found.';

    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      ...normalizeHistory(history),
      new HumanMessage(
        `User request: ${message}\n\nLive research context:\n${researchContext}\n\nAnswer as Roza Lab Assistant for the Carino project. Keep the answer actionable and premium.`
      ),
    ];

    const result = await model.invoke(messages);
    const reply = typeof result?.content === 'string'
      ? result.content
      : Array.isArray(result?.content)
        ? result.content.map((chunk) => (typeof chunk === 'string' ? chunk : chunk?.text || '')).join('')
        : String(result?.content || '');

    res.json({
      reply,
      sources: renderSourceBullets(searchResults),
      search_results: searchResults,
      session_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Assistant request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Rozalab assistant listening on http://localhost:${PORT}`);
});
