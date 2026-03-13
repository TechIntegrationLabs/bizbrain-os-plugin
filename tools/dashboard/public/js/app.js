// === BizBrain OS Dashboard — Main Application ===

const App = {
  state: {
    brainStatus: null,
    progress: {},
    integrations: [],
    quickActions: {},
    activeCategory: 'all',
  },

  async init() {
    await this.loadData();
    this.registerRoutes();
    Router.start();
  },

  async loadData() {
    try {
      const [brainRes, checklistRes, intRes, actionsRes] = await Promise.all([
        fetch('/api/brain-status').then(r => r.json()),
        fetch('/api/checklist').then(r => r.json()),
        fetch('/api/integrations').then(r => r.json()),
        fetch('/api/quick-actions').then(r => r.json()),
      ]);
      this.state.brainStatus = brainRes;
      this.state.progress = checklistRes.progress || {};
      this.state.integrations = intRes.connected || [];
      this.state.quickActions = actionsRes;

      // Update sidebar
      const { completed, total } = getOverallCompletion(this.state.progress);
      document.getElementById('setup-badge').textContent = `${completed}/${total}`;
      document.getElementById('brain-mode').textContent = brainRes.exists
        ? (brainRes.mode === 'full' ? 'Full Mode' : 'Compact Mode')
        : 'No brain';
      document.getElementById('brain-path-info').textContent = brainRes.exists
        ? brainRes.path.replace(/\\/g, '/').replace(brainRes.homedir.replace(/\\/g, '/'), '~')
        : 'Run /brain setup to create your brain';
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  },

  registerRoutes() {
    Router.register('/', (el) => this.renderHome(el));
    Router.register('/setup', (el) => this.renderSetup(el));
    Router.register('/setup/:id', (el, id) => this.renderDetail(el, id));
    Router.register('/integrations', (el) => this.renderIntegrations(el));
    Router.register('/launch', (el) => this.renderLaunch(el));
    Router.register('/ingest', (el) => this.renderIngest(el));
  },

  navigateTo(path) {
    Router.navigate('#' + path);
  },

  // === PAGES ===

  renderHome(el) {
    const { brainStatus: brain, progress } = this.state;
    const { completed, total } = getOverallCompletion(progress);
    const stats = brain?.stats || {};
    const recommended = getNextRecommended(progress);

    // Build category bars
    let categoryBarsHtml = '';
    for (const [id, cat] of Object.entries(CATEGORIES)) {
      const comp = getCategoryCompletion(id, progress);
      categoryBarsHtml += Components.categoryBar(cat.name, comp.completed, comp.total, cat.color);
    }

    el.innerHTML = `
      <div class="page-header fade-in">
        <h1>Welcome to BizBrain OS</h1>
        <p>Your AI brain dashboard — track setup progress, connect integrations, and launch sessions.</p>
      </div>

      ${Components.progressRing(completed, total, categoryBarsHtml)}
      ${Components.recommendedCard(recommended)}

      <h2 class="section-title">Brain Stats</h2>
      <div class="stats-grid fade-in stagger-2">
        ${Components.statCard(stats.entities || 0, 'Entities')}
        ${Components.statCard(stats.projects || 0, 'Projects')}
        ${Components.statCard(stats.knowledge || 0, 'Knowledge Files')}
        ${Components.statCard(stats.integrations || 0, 'Integrations')}
        ${Components.statCard(completed, 'Tasks Done')}
        ${Components.statCard(total - completed, 'Remaining')}
      </div>

      <h2 class="section-title" style="margin-top:32px">Quick Setup</h2>
      <p class="section-subtitle">Start with the fundamentals, then unlock more capabilities.</p>
      <div class="card-grid card-grid-sm fade-in stagger-3">
        ${CHECKLIST_ITEMS.filter(i => i.priority === 'critical').slice(0, 4).map((item, idx) =>
          Components.checklistCard(item, progress[item.id] || 'pending', idx)
        ).join('')}
      </div>
    `;
  },

  filterCategory(category) {
    this.state.activeCategory = category;
    this.renderSetup(document.getElementById('content'));
  },

  renderSetup(el) {
    const { progress, activeCategory } = this.state;

    // Category tabs
    const tabsHtml = [
      Components.categoryTab('all', 'All', activeCategory === 'all'),
      ...Object.entries(CATEGORIES).map(([id, cat]) =>
        Components.categoryTab(id, cat.name, activeCategory === id)
      ),
    ].join('');

    // Filter items
    const items = activeCategory === 'all'
      ? CHECKLIST_ITEMS
      : CHECKLIST_ITEMS.filter(i => i.category === activeCategory);

    // Group by category if showing all
    let cardsHtml = '';
    if (activeCategory === 'all') {
      for (const [catId, cat] of Object.entries(CATEGORIES)) {
        const catItems = items.filter(i => i.category === catId);
        if (catItems.length === 0) continue;
        const comp = getCategoryCompletion(catId, progress);
        cardsHtml += `
          <div style="margin-bottom:32px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
              <h2 class="section-title" style="margin-bottom:0">${cat.icon} ${cat.name}</h2>
              <span style="font-size:12px;color:var(--text-muted);font-weight:600">${comp.completed}/${comp.total}</span>
            </div>
            <p class="section-subtitle">${cat.tagline}</p>
            <div class="card-grid card-grid-sm">
              ${catItems.map((item, idx) => Components.checklistCard(item, progress[item.id] || 'pending', idx)).join('')}
            </div>
          </div>`;
      }
    } else {
      const cat = CATEGORIES[activeCategory];
      cardsHtml = `
        <p class="section-subtitle" style="margin-top:0">${cat?.tagline || ''}</p>
        <div class="card-grid card-grid-sm">
          ${items.map((item, idx) => Components.checklistCard(item, progress[item.id] || 'pending', idx)).join('')}
        </div>`;
    }

    const { completed, total } = getOverallCompletion(progress);

    el.innerHTML = `
      <div class="page-header fade-in">
        <h1>Setup Checklist</h1>
        <p>${completed} of ${total} tasks complete — level up your brain by completing each integration.</p>
      </div>
      <div class="category-tabs fade-in stagger-1">${tabsHtml}</div>
      ${cardsHtml}
    `;
  },

  renderDetail(el, itemId) {
    const item = getItemById(itemId);
    if (!item) {
      el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">❓</div><p>Item not found</p></div>';
      return;
    }
    const status = this.state.progress[item.id] || 'pending';
    el.innerHTML = Components.detailPage(item, status, this.state.progress);
    window.scrollTo(0, 0);
  },

  renderIntegrations(el) {
    const { progress } = this.state;
    const connectedIds = this.state.integrations.map(i => i.id);

    // All integration items (communication + productivity + development + business + content + advanced)
    const integrationItems = CHECKLIST_ITEMS.filter(i =>
      ['communication', 'productivity', 'development', 'business', 'content', 'advanced'].includes(i.category)
    );

    const connectedItems = integrationItems.filter(i => progress[i.id] === 'completed' || connectedIds.includes(i.id));
    const availableItems = integrationItems.filter(i => progress[i.id] !== 'completed' && !connectedIds.includes(i.id));

    el.innerHTML = `
      <div class="page-header fade-in">
        <h1>Integrations</h1>
        <p>${connectedItems.length} connected · ${availableItems.length} available</p>
      </div>

      ${connectedItems.length > 0 ? `
        <h2 class="section-title fade-in stagger-1">Connected</h2>
        <div class="card-grid card-grid-sm fade-in stagger-2" style="margin-bottom:32px">
          ${connectedItems.map(item => Components.integrationCard(item, true)).join('')}
        </div>
      ` : ''}

      <h2 class="section-title fade-in stagger-3">Available</h2>
      <div class="card-grid card-grid-sm fade-in stagger-4">
        ${availableItems.map(item => Components.integrationCard(item, false)).join('')}
      </div>
    `;
  },

  renderLaunch(el) {
    const { quickActions } = this.state;
    const brainPath = this.state.brainStatus?.path || '';

    el.innerHTML = `
      <div class="page-header fade-in">
        <h1>Quick Launch</h1>
        <p>One-click shortcuts to your most common actions.</p>
      </div>

      <div class="launch-grid fade-in stagger-1">
        ${Components.launchCard('🧠', 'Open Brain', 'Open your brain folder in the file explorer',
          `App.openFolder('${brainPath.replace(/\\/g, '\\\\\\\\')}')`, false)}
        ${Components.launchCard('💬', 'Open Conversations', 'Open your launchpad / conversations folder',
          `App.openFolder('${(quickActions.conversations?.path || '').replace(/\\/g, '\\\\\\\\')}')`, false)}
        ${Components.launchCard('📁', 'Open Repos', 'Open your repositories folder',
          `App.openFolder('${(quickActions.repos?.path || '').replace(/\\/g, '\\\\\\\\')}')`, false)}
        ${Components.launchCard('⚡', 'Start Claude Code', 'Open a terminal and launch Claude Code in your brain',
          'App.launchClaude()', true)}
      </div>

      <div style="margin-top:48px" class="fade-in stagger-3">
        <h2 class="section-title">Keyboard Shortcuts</h2>
        <div class="card" style="max-width:480px">
          <div style="display:flex;flex-direction:column;gap:12px;font-size:13px">
            <div style="display:flex;justify-content:space-between">
              <span style="color:var(--text-secondary)">Open Dashboard</span>
              <code style="color:var(--accent);background:var(--bg-input);padding:2px 8px;border-radius:4px">/dashboard</code>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="color:var(--text-secondary)">Brain Status</span>
              <code style="color:var(--accent);background:var(--bg-input);padding:2px 8px;border-radius:4px">/brain status</code>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="color:var(--text-secondary)">Setup Brain</span>
              <code style="color:var(--accent);background:var(--bg-input);padding:2px 8px;border-radius:4px">/brain setup</code>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="color:var(--text-secondary)">View Todos</span>
              <code style="color:var(--accent);background:var(--bg-input);padding:2px 8px;border-radius:4px">/todo</code>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async renderIngest(el) {
    // Fetch current ingest stats
    let stats = { uploads: 0, urls: 0 };
    try {
      const resp = await fetch('/api/ingest/stats');
      stats = await resp.json();
    } catch {}

    el.innerHTML = `
      <div class="page-header">
        <h1>&#127760; Intelligence Gathering</h1>
        <p class="page-subtitle">Teach your brain about your business. Paste URLs and drop documents — everything stays local.</p>
      </div>

      <div class="ingest-stats" style="display:flex;gap:16px;margin-bottom:24px;">
        <div class="stat-card" style="flex:1;">
          <div class="stat-value">${stats.uploads}</div>
          <div class="stat-label">Documents Ingested</div>
        </div>
        <div class="stat-card" style="flex:1;">
          <div class="stat-value">${stats.urls}</div>
          <div class="stat-label">URLs Scraped</div>
        </div>
      </div>

      <div class="safety-banner" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:14px 18px;margin-bottom:24px;display:flex;align-items:center;gap:10px;font-size:14px;">
        <span style="font-size:20px;">&#128274;</span>
        <p><strong style="color:#10b981;">100% local.</strong> <span style="color:var(--text-secondary);">URLs are fetched server-side. Files are copied to your brain's intake folder. Nothing leaves your machine.</span></p>
      </div>

      <!-- URL Section -->
      <div class="card" style="margin-bottom:24px;padding:24px;">
        <h3 style="margin-bottom:12px;">&#127760; Your URLs</h3>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Website, LinkedIn, Twitter/X, GitHub, portfolio — any public URL. One per line.</p>
        <textarea id="ingest-urls" style="width:100%;min-height:120px;padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-secondary);color:var(--text-primary);font-family:var(--font-mono,monospace);font-size:13px;resize:vertical;" placeholder="https://yourwebsite.com&#10;https://linkedin.com/in/you&#10;https://github.com/you"></textarea>
        <button id="scrape-btn" class="btn-action" style="margin-top:12px;padding:10px 20px;background:var(--accent,#00d4ff);color:#000;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">Scrape URLs</button>
        <div id="url-results" style="margin-top:12px;font-size:13px;"></div>
      </div>

      <!-- File Upload Section -->
      <div class="card" style="margin-bottom:24px;padding:24px;">
        <h3 style="margin-bottom:12px;">&#128196; Your Documents</h3>
        <div id="drop-zone" style="border:2px dashed var(--border);border-radius:12px;padding:40px 24px;text-align:center;cursor:pointer;transition:all 0.2s;background:var(--bg-secondary);">
          <div style="font-size:40px;margin-bottom:12px;">&#128194;</div>
          <p><strong>Drag & drop files or folders</strong></p>
          <p style="font-size:13px;color:var(--text-secondary);margin-top:4px;">Contracts, invoices, proposals, branding docs — anything useful</p>
        </div>
        <div style="display:flex;gap:10px;margin-top:12px;">
          <button id="browse-files-btn" class="btn-action" style="flex:1;padding:10px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;">&#128196; Browse Files</button>
          <button id="browse-folder-btn" class="btn-action" style="flex:1;padding:10px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:13px;">&#128193; Browse Folder</button>
        </div>
        <ul id="file-list" style="list-style:none;max-height:200px;overflow-y:auto;margin-top:12px;"></ul>
        <p id="upload-stats" style="font-size:13px;color:var(--text-secondary);margin-top:8px;"></p>
      </div>

      <input type="file" id="file-input" multiple hidden>
      <input type="file" id="folder-input" webkitdirectory hidden>
    `;

    // Wire up interactivity
    const dropZone = document.getElementById('drop-zone');
    const fileList = document.getElementById('file-list');
    const uploadStatsEl = document.getElementById('upload-stats');
    let totalFiles = 0, totalBytes = 0, uploaded = 0;

    function formatBytes(b) {
      if (b < 1024) return b + ' B';
      if (b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
      return (b/(1024*1024)).toFixed(1) + ' MB';
    }

    function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function updateStats() {
      uploadStatsEl.textContent = uploaded + '/' + totalFiles + ' files uploaded (' + formatBytes(totalBytes) + ')';
    }

    function addFileRow(name, size, status) {
      const li = document.createElement('li');
      li.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-bottom:1px solid var(--border);font-size:13px;';
      li.innerHTML = '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escHtml(name) + '</span>'
        + '<span style="color:var(--text-secondary);margin:0 12px;min-width:60px;text-align:right;">' + formatBytes(size) + '</span>'
        + '<span class="file-status" style="min-width:24px;text-align:center;">' + status + '</span>';
      fileList.prepend(li);
      return li;
    }

    async function uploadFile(file, relPath) {
      if (file.size > 100 * 1024 * 1024) {
        addFileRow(relPath + file.name, file.size, '&#9940;');
        return;
      }
      totalFiles++;
      totalBytes += file.size;
      const row = addFileRow(relPath + file.name, file.size, '&#9203;');
      updateStats();

      try {
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        await fetch('/api/ingest/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: file.name, relativePath: relPath, data }),
        });
        uploaded++;
        row.querySelector('.file-status').innerHTML = '&#9989;';
      } catch {
        row.querySelector('.file-status').innerHTML = '&#10060;';
      }
      updateStats();
    }

    async function collectEntries(entry, basePath, result) {
      if (entry.isFile) {
        const file = await new Promise(r => entry.file(f => r(f)));
        result.push({ file, path: basePath });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await new Promise(r => reader.readEntries(e => r(e)));
        for (const e of entries) await collectEntries(e, basePath + entry.name + '/', result);
      }
    }

    // Drag and drop
    ['dragenter','dragover'].forEach(e => {
      dropZone.addEventListener(e, ev => { ev.preventDefault(); dropZone.style.borderColor = 'var(--accent,#00d4ff)'; dropZone.style.background = 'rgba(0,212,255,0.05)'; });
    });
    ['dragleave','drop'].forEach(e => {
      dropZone.addEventListener(e, ev => { ev.preventDefault(); dropZone.style.borderColor = 'var(--border)'; dropZone.style.background = 'var(--bg-secondary)'; });
    });
    dropZone.addEventListener('drop', async ev => {
      const items = ev.dataTransfer.items;
      if (!items) return;
      const files = [];
      for (const item of items) {
        const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
        if (entry) await collectEntries(entry, '', files);
        else if (item.kind === 'file') files.push({ file: item.getAsFile(), path: '' });
      }
      for (const { file, path: p } of files) await uploadFile(file, p);
    });

    // File/folder buttons
    document.getElementById('browse-files-btn').onclick = () => document.getElementById('file-input').click();
    document.getElementById('browse-folder-btn').onclick = () => document.getElementById('folder-input').click();
    document.getElementById('file-input').onchange = async e => {
      for (const f of e.target.files) await uploadFile(f, '');
    };
    document.getElementById('folder-input').onchange = async e => {
      for (const f of e.target.files) {
        const relPath = f.webkitRelativePath ? f.webkitRelativePath.split('/').slice(0, -1).join('/') + '/' : '';
        await uploadFile(f, relPath);
      }
    };

    // URL scraping
    document.getElementById('scrape-btn').onclick = async () => {
      const textarea = document.getElementById('ingest-urls');
      const resultsDiv = document.getElementById('url-results');
      const btn = document.getElementById('scrape-btn');
      const text = textarea.value.trim();
      if (!text) return;

      const urls = text.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
      if (!urls.length) { resultsDiv.innerHTML = '<span style="color:var(--warning);">No valid URLs found.</span>'; return; }

      btn.disabled = true;
      btn.textContent = 'Scraping...';
      resultsDiv.innerHTML = '';

      for (const url of urls) {
        const div = document.createElement('div');
        div.style.cssText = 'padding:4px 0;';
        div.innerHTML = '&#9203; Scraping ' + escHtml(url) + '...';
        resultsDiv.appendChild(div);

        try {
          const resp = await fetch('/api/ingest/scrape-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });
          const data = await resp.json();
          if (data.ok) {
            div.innerHTML = '&#9989; ' + escHtml(url) + ' <small style="color:var(--text-secondary);">(' + data.chars + ' chars)</small>';
          } else {
            div.innerHTML = '&#10060; ' + escHtml(url) + ' <small style="color:var(--warning);">' + (data.error || 'failed') + '</small>';
          }
        } catch {
          div.innerHTML = '&#10060; ' + escHtml(url) + ' <small style="color:var(--warning);">network error</small>';
        }
      }

      btn.disabled = false;
      btn.textContent = 'Scrape URLs';
    };
  },

  // === ACTIONS ===

  async openFolder(folderPath) {
    try {
      await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath }),
      });
    } catch (e) {
      console.error('Failed to open folder:', e);
    }
  },

  async launchClaude() {
    try {
      const res = await fetch('/api/launch-claude', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        // Visual feedback
        const btn = document.querySelector('.launch-card.primary');
        if (btn) {
          btn.style.borderColor = 'var(--emerald)';
          btn.querySelector('.launch-card-title').textContent = 'Launched!';
          setTimeout(() => {
            btn.style.borderColor = '';
            btn.querySelector('.launch-card-title').textContent = 'Start Claude Code';
          }, 2000);
        }
      }
    } catch (e) {
      console.error('Failed to launch:', e);
    }
  },

  async markComplete(itemId) {
    try {
      await fetch(`/api/checklist/${itemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      this.state.progress[itemId] = 'completed';
      const { completed, total } = getOverallCompletion(this.state.progress);
      document.getElementById('setup-badge').textContent = `${completed}/${total}`;
      // Re-render current detail
      this.renderDetail(document.getElementById('content'), itemId);
    } catch (e) {
      console.error('Failed to mark complete:', e);
    }
  },

  async markIncomplete(itemId) {
    try {
      await fetch(`/api/checklist/${itemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      });
      this.state.progress[itemId] = 'pending';
      const { completed, total } = getOverallCompletion(this.state.progress);
      document.getElementById('setup-badge').textContent = `${completed}/${total}`;
      this.renderDetail(document.getElementById('content'), itemId);
    } catch (e) {
      console.error('Failed to mark incomplete:', e);
    }
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
