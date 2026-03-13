const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync, exec } = require('child_process');
const os = require('os');

const app = express();
const PORT = 3850;

app.use(express.json({ limit: '150mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Brain Discovery ---

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
    // Check for full mode (three-zone architecture)
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
    // Check for brain/ subdir with config (full mode without marker)
    const brainSubdir = path.join(root, 'brain');
    if (fs.existsSync(path.join(brainSubdir, 'config.json'))) return brainSubdir;
    // Compact mode: config.json or .bizbrain at root
    if (fs.existsSync(path.join(root, 'config.json')) || fs.existsSync(path.join(root, '.bizbrain'))) return root;
  }
  return null;
}

function findBrainRoot() {
  const brainPath = findBrainPath();
  if (!brainPath) return null;
  // In full mode, root is parent of brain/
  const parent = path.dirname(brainPath);
  if (fs.existsSync(path.join(parent, '.bizbrain-root.json'))) return parent;
  return brainPath;
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
  // Store progress at root level .bizbrain/ (works for both compact and full mode)
  const root = findBrainRoot() || brainPath;
  const dashDir = path.join(root, '.bizbrain', 'dashboard');
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
  const brainRoot = findBrainRoot();
  const rootMarker = brainRoot ? path.join(brainRoot, '.bizbrain-root.json') : null;
  let mode = 'compact';
  if (rootMarker && fs.existsSync(rootMarker)) {
    try { mode = JSON.parse(fs.readFileSync(rootMarker, 'utf8')).mode || 'compact'; } catch { /* ignore */ }
  }
  res.json({
    exists: !!brainPath,
    path: brainPath,
    root: brainRoot,
    mode,
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

// --- Ingestion API Routes ---

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

app.post('/api/ingest/upload', (req, res) => {
  const brainPath = findBrainPath();
  if (!brainPath) return res.status(400).json({ error: 'No brain found' });

  const uploadDir = path.join(brainPath, '_intake-dump', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  try {
    const { name, relativePath, data } = req.body;
    const buffer = Buffer.from(data, 'base64');

    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(413).json({ error: 'File too large (>100MB)' });
    }

    const destDir = relativePath ? path.join(uploadDir, relativePath) : uploadDir;
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(path.join(destDir, name), buffer);

    res.json({ ok: true, size: buffer.length });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/ingest/scrape-url', (req, res) => {
  const brainPath = findBrainPath();
  if (!brainPath) return res.status(400).json({ error: 'No brain found' });

  const urlExtractsDir = path.join(brainPath, '_intake-dump', 'url-extracts');
  if (!fs.existsSync(urlExtractsDir)) fs.mkdirSync(urlExtractsDir, { recursive: true });

  const { url } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const https = require('https');
  const http = require('http');
  const { URL } = require('url');

  function fetchUrl(targetUrl, redirects = 0) {
    return new Promise((resolve, reject) => {
      if (redirects > 3) return reject(new Error('Too many redirects'));
      const parsedUrl = new URL(targetUrl);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const req = protocol.get(targetUrl, {
        headers: {
          'User-Agent': 'BizBrain-OS/3.3 IntelligenceGatherer',
          'Accept': 'text/html,text/plain,application/json',
        },
        timeout: 15000,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = res.headers.location.startsWith('http')
            ? res.headers.location
            : `${parsedUrl.protocol}//${parsedUrl.host}${res.headers.location}`;
          fetchUrl(redirectUrl, redirects + 1).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
  }

  fetchUrl(url)
    .then(html => {
      // Strip scripts/styles, extract text
      let text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#\d+;/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 50000);

      const parsedUrl = new URL(url);
      const filename = parsedUrl.hostname.replace(/[^a-z0-9.-]/gi, '_');
      fs.writeFileSync(
        path.join(urlExtractsDir, `${filename}.txt`),
        `URL: ${url}\nDomain: ${parsedUrl.hostname}\n\n${text}`,
        'utf8'
      );

      res.json({ ok: true, chars: text.length });
    })
    .catch(e => {
      res.json({ ok: false, error: e.message });
    });
});

app.get('/api/ingest/stats', (req, res) => {
  const brainPath = findBrainPath();
  if (!brainPath) return res.json({ uploads: 0, urls: 0 });

  let uploads = 0, urls = 0;
  const uploadDir = path.join(brainPath, '_intake-dump', 'uploads');
  const urlDir = path.join(brainPath, '_intake-dump', 'url-extracts');

  if (fs.existsSync(uploadDir)) uploads = countFiles(uploadDir);
  if (fs.existsSync(urlDir)) urls = fs.readdirSync(urlDir).filter(f => f.endsWith('.txt')).length;

  res.json({ uploads, urls });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🧠 BizBrain OS Dashboard running at http://localhost:${PORT}\n`);
});
