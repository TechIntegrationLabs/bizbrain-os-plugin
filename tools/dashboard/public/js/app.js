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
