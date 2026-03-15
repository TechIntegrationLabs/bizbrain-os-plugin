/* === BizBrain OS Visual Companion — Main App === */

(function() {
  'use strict';

  // --- State ---
  let ws = null;
  let currentContent = null;
  let history = [];
  let historyOpen = false;
  let reconnectTimer = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_DELAY = 10000;

  // --- DOM Elements ---
  const $ = (sel) => document.querySelector(sel);
  const welcomeEl = $('#welcome');
  const viewerEl = $('#viewer');
  const viewerTitle = $('#viewer-title');
  const viewerType = $('#viewer-type');
  const viewerContent = $('#viewer-content');
  const wsStatus = $('#ws-status');
  const wsStatusText = $('#ws-status-text');
  const historyPanel = $('#history-panel');
  const historyList = $('#history-list');

  // --- WebSocket Connection ---

  function connect() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}`);

    ws.onopen = () => {
      reconnectAttempts = 0;
      wsStatus.className = 'status-indicator connected';
      wsStatusText.textContent = 'Connected';
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleMessage(msg);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    ws.onclose = () => {
      wsStatus.className = 'status-indicator disconnected';
      wsStatusText.textContent = 'Disconnected';
      scheduleReconnect();
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts), MAX_RECONNECT_DELAY);
    reconnectAttempts++;
    wsStatusText.textContent = `Reconnecting in ${Math.round(delay / 1000)}s...`;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  }

  // --- Message Handler ---

  function handleMessage(msg) {
    switch (msg.type) {
      case 'content':
        displayContent(msg.data);
        break;
      case 'clear':
        showWelcome();
        break;
      case 'welcome':
        // Already showing welcome screen
        break;
    }
  }

  // --- Display ---

  function displayContent(data) {
    currentContent = data;
    addToHistory(data);

    welcomeEl.style.display = 'none';
    viewerEl.style.display = 'block';

    viewerTitle.textContent = data.title || 'Untitled';
    viewerType.textContent = data.type;
    viewerContent.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Rendering...</div>';

    // Reset animation
    viewerEl.style.animation = 'none';
    viewerEl.offsetHeight; // trigger reflow
    viewerEl.style.animation = '';

    // Render content
    Renderer.render(data.type, data.content, viewerContent);

    // Update history panel if open
    if (historyOpen) renderHistory();
  }

  function showWelcome() {
    currentContent = null;
    welcomeEl.style.display = '';
    viewerEl.style.display = 'none';
  }

  // --- History ---

  function addToHistory(data) {
    // Avoid duplicates
    if (history.length > 0 && history[0].id === data.id) return;
    history.unshift(data);
    if (history.length > 50) history = history.slice(0, 50);
  }

  function renderHistory() {
    historyList.innerHTML = history.map((item, i) => `
      <div class="history-item ${currentContent && currentContent.id === item.id ? 'active' : ''}" data-index="${i}">
        <div class="history-item-title">${Renderer.escapeHtml(item.title || 'Untitled')}</div>
        <div class="history-item-meta">
          <span class="history-item-type">${item.type}</span>
          <span>${formatTime(item.timestamp)}</span>
        </div>
      </div>
    `).join('');

    // Click handlers
    historyList.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.index);
        if (history[idx]) displayContent(history[idx]);
      });
    });
  }

  function toggleHistory() {
    historyOpen = !historyOpen;
    historyPanel.style.display = historyOpen ? '' : 'none';
    if (historyOpen) {
      loadHistoryFromServer();
      renderHistory();
    }
  }

  async function loadHistoryFromServer() {
    try {
      const res = await fetch('/api/history?limit=30');
      const data = await res.json();
      if (data.history && data.history.length > history.length) {
        history = data.history;
        renderHistory();
      }
    } catch { /* ignore */ }
  }

  // --- Utilities ---

  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
           d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // --- Fullscreen ---

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  // --- Event Listeners ---

  $('#btn-history').addEventListener('click', toggleHistory);
  $('#btn-close-history').addEventListener('click', toggleHistory);
  $('#btn-fullscreen').addEventListener('click', toggleFullscreen);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && historyOpen) toggleHistory();
    if (e.key === 'h' && e.ctrlKey) { e.preventDefault(); toggleHistory(); }
    if (e.key === 'f' && e.ctrlKey && e.shiftKey) { e.preventDefault(); toggleFullscreen(); }
  });

  // --- Init ---

  // Try to load current content from server first
  fetch('/api/current')
    .then(r => r.json())
    .then(data => {
      if (data.content) displayContent(data.content);
    })
    .catch(() => {});

  connect();
})();
