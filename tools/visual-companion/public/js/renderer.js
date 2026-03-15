/* === BizBrain OS Visual Companion — Content Renderers === */

const Renderer = {

  // Initialize Mermaid with dark theme
  initMermaid() {
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          darkMode: true,
          background: '#16161f',
          primaryColor: '#2563eb',
          primaryTextColor: '#eee',
          primaryBorderColor: '#2563eb',
          lineColor: '#555',
          secondaryColor: '#1e1e2a',
          tertiaryColor: '#0f0f16',
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif',
          fontSize: '14px',
        },
      });
    }
  },

  // Render mermaid diagram
  async mermaid(content, container) {
    container.innerHTML = '';
    const id = 'mermaid-' + Date.now();
    try {
      const { svg } = await mermaid.render(id, content);
      container.innerHTML = `<div class="mermaid">${svg}</div>`;
    } catch (e) {
      container.innerHTML = `<div class="render-error">
        <p>Mermaid render error: ${e.message}</p>
        <pre class="code-view">${this.escapeHtml(content)}</pre>
      </div>`;
    }
  },

  // Render markdown
  markdown(content, container) {
    container.className = 'viewer-content markdown-content';
    if (typeof marked !== 'undefined') {
      container.innerHTML = marked.parse(content);
    } else {
      container.innerHTML = `<pre>${this.escapeHtml(content)}</pre>`;
    }
  },

  // Render raw HTML
  html(content, container) {
    container.innerHTML = content;
  },

  // Render SVG
  svg(content, container) {
    container.innerHTML = `<div style="display:flex;justify-content:center;padding:20px;">${content}</div>`;
  },

  // Render comparison (two panels)
  comparison(content, container) {
    let data;
    try { data = JSON.parse(content); } catch { data = { left: content, right: '', leftLabel: 'Left', rightLabel: 'Right' }; }
    const leftHtml = typeof marked !== 'undefined' ? marked.parse(data.left || '') : this.escapeHtml(data.left || '');
    const rightHtml = typeof marked !== 'undefined' ? marked.parse(data.right || '') : this.escapeHtml(data.right || '');
    container.innerHTML = `
      <div class="comparison-view">
        <div class="comparison-panel">
          <div class="comparison-label">${this.escapeHtml(data.leftLabel || 'Option A')}</div>
          <div class="comparison-body">${leftHtml}</div>
        </div>
        <div class="comparison-panel">
          <div class="comparison-label">${this.escapeHtml(data.rightLabel || 'Option B')}</div>
          <div class="comparison-body">${rightHtml}</div>
        </div>
      </div>`;
  },

  // Render cards
  cards(content, container) {
    let cards;
    try { cards = JSON.parse(content); } catch { cards = []; }
    if (!Array.isArray(cards) || cards.length === 0) {
      container.innerHTML = '<div class="render-error">No cards to display</div>';
      return;
    }
    container.innerHTML = `<div class="cards-view">${cards.map(card => `
      <div class="vc-card">
        ${card.icon ? `<div class="vc-card-icon">${card.icon}</div>` : ''}
        <div class="vc-card-title">${this.escapeHtml(card.title || '')}</div>
        <div class="vc-card-desc">${this.escapeHtml(card.description || card.desc || '')}</div>
        ${card.meta ? `<div class="vc-card-meta">${this.escapeHtml(card.meta)}</div>` : ''}
      </div>
    `).join('')}</div>`;
  },

  // Render timeline
  timeline(content, container) {
    let items;
    try { items = JSON.parse(content); } catch { items = []; }
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = '<div class="render-error">No timeline data</div>';
      return;
    }
    container.innerHTML = `<div class="timeline-view">${items.map(item => `
      <div class="timeline-item ${item.status || ''}">
        <div class="timeline-title">${this.escapeHtml(item.title || '')}</div>
        <div class="timeline-desc">${this.escapeHtml(item.description || item.desc || '')}</div>
        ${item.date ? `<div class="timeline-date">${this.escapeHtml(item.date)}</div>` : ''}
      </div>
    `).join('')}</div>`;
  },

  // Render kanban board
  kanban(content, container) {
    let data;
    try { data = JSON.parse(content); } catch { data = {}; }
    // Expect { columns: [{ title, items: [{ title, desc }] }] } or { "Todo": [...], "In Progress": [...] }
    let columns = [];
    if (data.columns) {
      columns = data.columns;
    } else {
      columns = Object.entries(data).map(([title, items]) => ({ title, items: Array.isArray(items) ? items : [] }));
    }
    if (columns.length === 0) {
      container.innerHTML = '<div class="render-error">No kanban data</div>';
      return;
    }
    container.innerHTML = `<div class="kanban-view">${columns.map(col => `
      <div class="kanban-column">
        <div class="kanban-column-header">
          ${this.escapeHtml(col.title || '')}
          <span class="kanban-column-count">${(col.items || []).length}</span>
        </div>
        <div class="kanban-items">
          ${(col.items || []).map(item => `
            <div class="kanban-item">
              <div class="kanban-item-title">${this.escapeHtml(typeof item === 'string' ? item : item.title || '')}</div>
              ${item.desc ? `<div>${this.escapeHtml(item.desc)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}</div>`;
  },

  // Render dashboard stats
  dashboard(content, container) {
    let stats;
    try { stats = JSON.parse(content); } catch { stats = []; }
    if (!Array.isArray(stats)) stats = Object.entries(stats).map(([label, value]) => ({ label, value }));
    container.innerHTML = `<div class="dashboard-view">${stats.map(stat => `
      <div class="dashboard-stat">
        <div class="dashboard-stat-value" style="${stat.color ? `color:${stat.color}` : ''}">${this.escapeHtml(String(stat.value || '0'))}</div>
        <div class="dashboard-stat-label">${this.escapeHtml(stat.label || '')}</div>
        ${stat.change ? `<div class="dashboard-stat-change ${stat.change > 0 ? 'positive' : 'negative'}">${stat.change > 0 ? '+' : ''}${stat.change}%</div>` : ''}
      </div>
    `).join('')}</div>`;
  },

  // Render code block
  code(content, container) {
    container.innerHTML = `<pre class="code-view">${this.escapeHtml(content)}</pre>`;
  },

  // Render flowchart (alias for mermaid)
  async flowchart(content, container) {
    return this.mermaid(content, container);
  },

  // Render mockup (HTML with sandboxed iframe)
  mockup(content, container) {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;min-height:600px;border:1px solid rgba(255,255,255,0.06);border-radius:8px;background:white;';
    iframe.sandbox = 'allow-scripts allow-same-origin';
    container.innerHTML = '';
    container.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(content);
    iframe.contentDocument.close();
  },

  // Render graph (alias for mermaid)
  async graph(content, container) {
    return this.mermaid(content, container);
  },

  // Render table from JSON
  table(content, container) {
    let data;
    try { data = JSON.parse(content); } catch { data = []; }
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<div class="render-error">No table data</div>';
      return;
    }
    const headers = Object.keys(data[0]);
    container.className = 'viewer-content markdown-content';
    container.innerHTML = `<table>
      <thead><tr>${headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join('')}</tr></thead>
      <tbody>${data.map(row => `<tr>${headers.map(h => `<td>${this.escapeHtml(String(row[h] || ''))}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
  },

  // Render image
  image(content, container) {
    if (content.startsWith('data:') || content.startsWith('http')) {
      container.innerHTML = `<div style="display:flex;justify-content:center;padding:20px;"><img src="${content}" style="max-width:100%;border-radius:8px;" /></div>`;
    } else {
      container.innerHTML = `<div style="display:flex;justify-content:center;padding:20px;">${content}</div>`;
    }
  },

  // Utility: escape HTML
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Main render dispatcher
  async render(type, content, container) {
    container.className = 'viewer-content';
    const renderer = this[type];
    if (renderer) {
      await renderer.call(this, content, container);
    } else {
      // Fallback: try markdown, then raw
      this.markdown(content, container);
    }
  }
};

// Initialize mermaid on load
Renderer.initMermaid();
