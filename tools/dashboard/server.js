const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync, exec } = require('child_process');
const os = require('os');

const app = express();
const PORT = 3850;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Brain Discovery ---

function findBrainPath() {
  if (process.env.BIZBRAIN_PATH && fs.existsSync(process.env.BIZBRAIN_PATH)) {
    return process.env.BIZBRAIN_PATH;
  }
  const home = os.homedir();
  const candidates = [
    path.join(home, 'bizbrain-os'),
    path.join(home, 'bizbrain-os', 'brain'),
    path.join(home, 'Documents', 'bizbrain-os'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p) && (fs.existsSync(path.join(p, 'config.json')) || fs.existsSync(path.join(p, '.bizbrain')))) {
      return p;
    }
  }
  return null;
}

function getBrainStats(brainPath) {
  if (!brainPath) return null;
  const stats = { entities: 0, projects: 0, knowledge: 0, integrations: 0, sessions: 0 };
  try {
    const entitiesDir = path.join(brainPath, 'Entities');
    if (fs.existsSync(entitiesDir)) {
      for (const type of ['Clients', 'Partners', 'Vendors', 'People']) {
        const dir = path.join(entitiesDir, type);
        if (fs.existsSync(dir)) stats.entities += fs.readdirSync(dir).filter(f => !f.startsWith('.')).length;
      }
    }
    const projectsDir = path.join(brainPath, 'Projects');
    if (fs.existsSync(projectsDir)) stats.projects = fs.readdirSync(projectsDir).filter(f => !f.startsWith('.')).length;
    const knowledgeDir = path.join(brainPath, 'Knowledge');
    if (fs.existsSync(knowledgeDir)) stats.knowledge = countFiles(knowledgeDir);
    const credsDir = path.join(brainPath, 'Operations', 'credentials', 'vault');
    if (fs.existsSync(credsDir)) stats.integrations = fs.readdirSync(credsDir).filter(f => f.endsWith('.json')).length;
  } catch (e) { /* ignore */ }
  return stats;
}

function countFiles(dir) {
  let count = 0;
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) count += countFiles(path.join(dir, entry.name));
      else if (!entry.name.startsWith('.')) count++;
    }
  } catch (e) { /* ignore */ }
  return count;
}

function getProgressPath(brainPath) {
  const dashDir = path.join(brainPath, '.bizbrain', 'dashboard');
  if (!fs.existsSync(dashDir)) fs.mkdirSync(dashDir, { recursive: true });
  return path.join(dashDir, 'progress.json');
}

function readProgress(brainPath) {
  if (!brainPath) return {};
  const p = getProgressPath(brainPath);
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
}

function writeProgress(brainPath, data) {
  if (!brainPath) return;
  fs.writeFileSync(getProgressPath(brainPath), JSON.stringify(data, null, 2));
}

// --- API Routes ---

app.get('/api/brain-status', (req, res) => {
  const brainPath = findBrainPath();
  const rootMarker = brainPath ? path.join(brainPath, '..', '.bizbrain-root.json') : null;
  const isFullMode = rootMarker && fs.existsSync(rootMarker);
  res.json({
    exists: !!brainPath,
    path: brainPath,
    mode: isFullMode ? 'full' : 'compact',
    stats: getBrainStats(brainPath),
    homedir: os.homedir(),
  });
});

app.get('/api/checklist', (req, res) => {
  const brainPath = findBrainPath();
  const progress = readProgress(brainPath);
  res.json({ progress });
});

app.post('/api/checklist/:id', (req, res) => {
  const brainPath = findBrainPath();
  if (!brainPath) return res.status(400).json({ error: 'No brain found' });
  const progress = readProgress(brainPath);
  progress[req.params.id] = req.body.status || 'completed';
  writeProgress(brainPath, progress);
  res.json({ ok: true, progress });
});

app.get('/api/integrations', (req, res) => {
  const brainPath = findBrainPath();
  if (!brainPath) return res.json({ connected: [] });
  const credsDir = path.join(brainPath, 'Operations', 'credentials', 'vault');
  const connected = [];
  if (fs.existsSync(credsDir)) {
    for (const f of fs.readdirSync(credsDir).filter(f => f.endsWith('.json'))) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(credsDir, f), 'utf8'));
        connected.push({ id: f.replace('.json', ''), status: data.status || 'configured', name: data.name || f.replace('.json', '') });
      } catch { /* skip */ }
    }
  }
  res.json({ connected });
});

app.get('/api/quick-actions', (req, res) => {
  const brainPath = findBrainPath();
  const home = os.homedir();
  const actions = {
    brain: brainPath || path.join(home, 'bizbrain-os'),
    conversations: brainPath ? path.join(brainPath, '..', 'launchpad') : path.join(home, 'bizbrain-os', 'launchpad'),
    repos: path.join(home, 'Repos'),
  };
  // Check which paths exist
  for (const [key, val] of Object.entries(actions)) {
    actions[key] = { path: val, exists: fs.existsSync(val) };
  }
  res.json(actions);
});

app.post('/api/open-folder', (req, res) => {
  const { folderPath } = req.body;
  if (!folderPath || !fs.existsSync(folderPath)) return res.status(400).json({ error: 'Invalid path' });
  const platform = process.platform;
  try {
    if (platform === 'win32') exec(`explorer "${folderPath.replace(/\//g, '\\\\')}"`);
    else if (platform === 'darwin') exec(`open "${folderPath}"`);
    else exec(`xdg-open "${folderPath}"`);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/launch-claude', (req, res) => {
  const brainPath = findBrainPath();
  const launchDir = brainPath
    ? (fs.existsSync(path.join(brainPath, '..', 'launchpad')) ? path.join(brainPath, '..', 'launchpad') : brainPath)
    : path.join(os.homedir(), 'bizbrain-os');
  const platform = process.platform;
  try {
    if (platform === 'win32') {
      exec(`start cmd /k "cd /d ${launchDir.replace(/\//g, '\\\\')} && claude"`);
    } else if (platform === 'darwin') {
      exec(`osascript -e 'tell app "Terminal" to do script "cd ${launchDir} && claude"'`);
    } else {
      exec(`x-terminal-emulator -e "cd ${launchDir} && claude" || gnome-terminal -- bash -c "cd ${launchDir} && claude"`);
    }
    res.json({ ok: true, dir: launchDir });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🧠 BizBrain OS Dashboard running at http://localhost:${PORT}\n`);
});
