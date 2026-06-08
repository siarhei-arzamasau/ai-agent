import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';

const app = express();
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body as { messages: ChatMessage[] };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Invalid messages format' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let aborted = false;
  res.on('close', () => { aborted = true; });

  // Keep the SSE connection alive while the model is thinking
  const heartbeat = setInterval(() => {
    if (!aborted) res.write(': keep-alive\n\n');
  }, 15000);

  try {
    console.log(`[chat] request — ${messages.length} message(s)`);

    const stream = client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    let thinking = false;

    for await (const event of stream) {
      if (aborted) break;

      if (event.type === 'content_block_start' && event.content_block.type === 'thinking') {
        thinking = true;
        res.write(`data: ${JSON.stringify({ thinking: true })}\n\n`);
      }

      if (event.type === 'content_block_start' && event.content_block.type === 'text' && thinking) {
        thinking = false;
        res.write(`data: ${JSON.stringify({ thinking: false })}\n\n`);
      }

      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    if (!aborted) {
      res.write('data: [DONE]\n\n');
    }
    console.log('[chat] stream complete');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[chat] error:', message);
    if (!aborted) {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    }
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = parseInt(process.env.PORT ?? '3000', 10);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
