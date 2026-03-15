const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const os = require('os');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = 3851;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Brain Discovery (shared with dashboard) ---

function findBrainPath() {
  if (process.env.BIZBRAIN_PATH && fs.existsSync(process.env.BIZBRAIN_PATH)) {
    return process.env.BIZBRAIN_PATH;
  }
  const home = os.homedir();
  const roots = [
    path.join(home, 'bizbrain-os'),
    path.join(home, 'Documents', 'bizbrain-os'),
  ];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const rootMarker = path.join(root, '.bizbrain-root.json');
    if (fs.existsSync(rootMarker)) {
      try {
        const marker = JSON.parse(fs.readFileSync(rootMarker, 'utf8'));
        if (marker.mode === 'full') {
          const brainDir = path.join(root, marker.brainDir || 'brain');
          if (fs.existsSync(brainDir)) return brainDir;
        }
      } catch { /* fall through */ }
    }
    const brainSubdir = path.join(root, 'brain');
    if (fs.existsSync(path.join(brainSubdir, 'config.json'))) return brainSubdir;
    if (fs.existsSync(path.join(root, 'config.json')) || fs.existsSync(path.join(root, '.bizbrain'))) return root;
  }
  return null;
}

// --- Content Store ---

const contentStore = {
  current: null,
  history: [],
  maxHistory: 50,
};

function pushContent(content) {
  contentStore.current = {
    ...content,
    timestamp: Date.now(),
    id: `vc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  contentStore.history.unshift(contentStore.current);
  if (contentStore.history.length > contentStore.maxHistory) {
    contentStore.history = contentStore.history.slice(0, contentStore.maxHistory);
  }
  // Broadcast to all connected WebSocket clients
  broadcast(JSON.stringify({ type: 'content', data: contentStore.current }));
  return contentStore.current;
}

// --- WebSocket ---

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  // Send current content on connect
  if (contentStore.current) {
    ws.send(JSON.stringify({ type: 'content', data: contentStore.current }));
  } else {
    ws.send(JSON.stringify({ type: 'welcome', data: { message: 'Visual Companion connected. Waiting for content...' } }));
  }
  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws));
});

function broadcast(message) {
  for (const client of clients) {
    if (client.readyState === 1) { // OPEN
      try { client.send(message); } catch { /* ignore */ }
    }
  }
}

// --- API Routes ---

// Push new content to the companion
app.post('/api/push', (req, res) => {
  const { type, title, content, metadata } = req.body;
  if (!type || !content) {
    return res.status(400).json({ error: 'type and content are required' });
  }
  const validTypes = [
    'mermaid', 'html', 'markdown', 'svg', 'comparison',
    'dashboard', 'flowchart', 'mockup', 'kanban', 'timeline',
    'graph', 'cards', 'table', 'code', 'image',
  ];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `Invalid type. Valid: ${validTypes.join(', ')}` });
  }
  const result = pushContent({ type, title: title || 'Untitled', content, metadata: metadata || {} });
  res.json({ ok: true, id: result.id });
});

// Get current content
app.get('/api/current', (req, res) => {
  res.json({ content: contentStore.current });
});

// Get content history
app.get('/api/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, contentStore.maxHistory);
  res.json({ history: contentStore.history.slice(0, limit) });
});

// Clear current content
app.post('/api/clear', (req, res) => {
  contentStore.current = null;
  broadcast(JSON.stringify({ type: 'clear' }));
  res.json({ ok: true });
});

// Health check
app.get('/api/status', (req, res) => {
  res.json({
    running: true,
    port: PORT,
    clients: clients.size,
    brainPath: findBrainPath(),
    currentContent: contentStore.current ? contentStore.current.id : null,
    historyCount: contentStore.history.length,
  });
});

// Push a comparison (two-panel view)
app.post('/api/push-comparison', (req, res) => {
  const { title, left, right, leftLabel, rightLabel } = req.body;
  if (!left || !right) {
    return res.status(400).json({ error: 'left and right content required' });
  }
  const result = pushContent({
    type: 'comparison',
    title: title || 'Comparison',
    content: JSON.stringify({ left, right, leftLabel: leftLabel || 'Option A', rightLabel: rightLabel || 'Option B' }),
    metadata: { leftLabel, rightLabel },
  });
  res.json({ ok: true, id: result.id });
});

// Push multiple cards
app.post('/api/push-cards', (req, res) => {
  const { title, cards } = req.body;
  if (!cards || !Array.isArray(cards)) {
    return res.status(400).json({ error: 'cards array required' });
  }
  const result = pushContent({
    type: 'cards',
    title: title || 'Cards',
    content: JSON.stringify(cards),
    metadata: { count: cards.length },
  });
  res.json({ ok: true, id: result.id });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`\n  🎨 BizBrain OS Visual Companion running at http://localhost:${PORT}\n`);
});
