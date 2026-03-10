// === BizBrain OS Dashboard — UI Components ===

const Components = {

  // --- Stat Card ---
  statCard(value, label) {
    return `<div class="stat-card"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;
  },

  // --- Progress Ring ---
  progressRing(completed, total, categoryBars) {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (pct / 100) * circumference;

    return `
      <div class="progress-section fade-in">
        <div class="progress-ring-container">
          <svg class="progress-ring" viewBox="0 0 120 120">
            <circle class="progress-ring-bg" cx="60" cy="60" r="50" />
            <circle class="progress-ring-fill" cx="60" cy="60" r="50"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}" />
            <text x="60" y="56" text-anchor="middle" fill="#eee" font-size="28" font-weight="800"
              transform="rotate(90 60 60)">${pct}%</text>
            <text x="60" y="72" text-anchor="middle" fill="#888" font-size="10" font-weight="600"
              transform="rotate(90 60 60)">COMPLETE</text>
          </svg>
        </div>
        <div class="progress-details">
          <h2>${completed} of ${total} tasks complete</h2>
          <p class="progress-subtitle">Complete all Foundation and Memory tasks first for the best experience.</p>
          <div class="category-bars">${categoryBars}</div>
        </div>
      </div>`;
  },

  // --- Category Bar ---
  categoryBar(name, completed, total, color) {
    const pct = total > 0 ? (completed / total) * 100 : 0;
    return `
      <div class="category-bar">
        <span class="category-bar-label">${name}</span>
        <div class="category-bar-track">
          <div class="category-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <span class="category-bar-count">${completed}/${total}</span>
      </div>`;
  },

  // --- Recommended Card ---
  recommendedCard(item) {
    if (!item) return '';
    return `
      <div class="recommended-card fade-in" onclick="App.navigateTo('/setup/${item.id}')">
        <div style="font-size:36px;flex-shrink:0">${item.emoji}</div>
        <div style="flex:1">
          <div class="recommended-label">Recommended Next</div>
          <div class="recommended-title">${item.title}</div>
          <div class="recommended-desc">${item.shortDescription}</div>
        </div>
        <div class="recommended-arrow">→</div>
      </div>`;
  },

  // --- Category Tab ---
  categoryTab(id, name, isActive) {
    return `<button class="category-tab${isActive ? ' active' : ''}" onclick="App.filterCategory('${id}')">${name}</button>`;
  },

  // --- Checklist Card ---
  checklistCard(item, status, staggerIdx) {
    const statusClass = status === 'completed' ? 'completed' : status === 'in-progress' ? 'in-progress' : 'pending';
    const priorityClass = `badge-${item.priority}`;
    const difficultyDots = Array.from({ length: 3 }, (_, i) =>
      `<span class="difficulty-dot${i < item.difficulty ? ' filled' : ''}"></span>`
    ).join('');

    const imgSrc = `/images/${item.id}.png`;
    const imageHtml = `<img src="${imgSrc}" alt="${item.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="fallback-icon" style="display:none;width:100%;height:100%;align-items:center;justify-content:center">${item.emoji}</div>`;

    return `
      <div class="checklist-card fade-in stagger-${(staggerIdx % 6) + 1}" onclick="App.navigateTo('/setup/${item.id}')">
        <div class="checklist-card-image">${imageHtml}</div>
        <div class="checklist-card-body">
          <div class="checklist-card-header">
            <span class="checklist-card-title">${item.title}</span>
            <span class="status-dot ${statusClass}"></span>
          </div>
          <p class="checklist-card-desc">${item.shortDescription}</p>
          <div class="checklist-card-footer">
            <span class="badge ${priorityClass}">${item.priority}</span>
            <span class="difficulty">${item.timeEstimate} <span class="difficulty-dots">${difficultyDots}</span></span>
          </div>
        </div>
      </div>`;
  },

  // --- Detail Page ---
  detailPage(item, status, progress) {
    const statusClass = status === 'completed' ? 'completed' : status === 'in-progress' ? 'in-progress' : 'pending';
    const statusLabel = status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Not Started';
    const catColor = getCategoryColor(item.category);
    const catName = CATEGORIES[item.category]?.name || item.category;

    const imgSrc = `/images/${item.id}.png`;
    const imageHtml = `<img src="${imgSrc}" alt="${item.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="fallback-icon" style="display:none;width:100%;height:100%;align-items:center;justify-content:center">${item.emoji}</div>`;

    const benefitsHtml = item.benefits.map(b => `<li>${b}</li>`).join('');
    const useCasesHtml = item.useCases.map(u => `<li>${u}</li>`).join('');

    const prereqsHtml = item.prerequisites.length > 0
      ? item.prerequisites.map(pid => {
          const prereqItem = getItemById(pid);
          const prereqStatus = progress[pid] === 'completed' ? 'completed' : 'pending';
          return `<span class="prereq-chip" onclick="App.navigateTo('/setup/${pid}')">
            <span class="prereq-status status-dot ${prereqStatus}"></span>
            ${prereqItem ? prereqItem.title : pid}
          </span>`;
        }).join('')
      : '<span style="color:var(--text-muted);font-size:13px">None — you can start this anytime</span>';

    const allPrereqsMet = item.prerequisites.every(p => progress[p] === 'completed');
    const setupBtnClass = allPrereqsMet ? 'btn btn-primary btn-lg' : 'btn btn-primary btn-lg btn-disabled';
    const setupBtnText = status === 'completed' ? '✓ Completed' : allPrereqsMet ? 'Set Up in Claude Code' : 'Complete prerequisites first';

    const markBtn = status !== 'completed'
      ? `<button class="btn btn-secondary" onclick="App.markComplete('${item.id}')">Mark as Complete</button>`
      : `<button class="btn btn-secondary" onclick="App.markIncomplete('${item.id}')">Mark Incomplete</button>`;

    return `
      <div class="detail-page fade-in">
        <div class="detail-back" onclick="App.navigateTo('/setup')">← Back to Setup</div>

        <div class="detail-hero">
          <div class="detail-hero-image">${imageHtml}</div>
        </div>

        <div class="detail-meta">
          <span class="badge" style="background:${catColor}22;color:${catColor}">${catName}</span>
          <span class="badge badge-${item.priority}">${item.priority}</span>
          <span class="status-dot ${statusClass}"></span>
          <span style="font-size:12px;color:var(--text-muted)">${statusLabel}</span>
          <span style="font-size:12px;color:var(--text-muted)">·</span>
          <span style="font-size:12px;color:var(--text-muted)">${item.timeEstimate}</span>
        </div>

        <h1 class="detail-title">${item.title}</h1>
        <p class="detail-short-desc">${item.shortDescription}</p>

        <div class="detail-section">
          <h3>About</h3>
          <p class="detail-long-desc">${item.longDescription}</p>
        </div>

        <div class="detail-section">
          <h3>Benefits</h3>
          <ul class="detail-list">${benefitsHtml}</ul>
        </div>

        <div class="detail-section">
          <h3>Use Cases</h3>
          <ul class="detail-list use-case-list">${useCasesHtml}</ul>
        </div>

        <div class="detail-section">
          <h3>Prerequisites</h3>
          <div class="detail-prerequisites">${prereqsHtml}</div>
        </div>

        <div class="detail-section">
          <h3>Setup Command</h3>
          <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 16px;font-family:monospace;font-size:13px;color:var(--accent);cursor:pointer" onclick="navigator.clipboard.writeText('${item.setupCommand}');this.style.borderColor='var(--emerald)';setTimeout(()=>this.style.borderColor='',1000)">
            ${item.setupCommand} <span style="float:right;color:var(--text-muted);font-family:sans-serif;font-size:11px">click to copy</span>
          </div>
        </div>

        <div class="detail-actions">
          <button class="${setupBtnClass}" onclick="navigator.clipboard.writeText('${item.setupCommand}')">${setupBtnText}</button>
          ${markBtn}
        </div>
      </div>`;
  },

  // --- Launch Card ---
  launchCard(icon, title, desc, onClick, isPrimary) {
    return `
      <div class="launch-card${isPrimary ? ' primary' : ''}" onclick="${onClick}">
        <span class="launch-card-icon">${icon}</span>
        <div class="launch-card-title">${title}</div>
        <p class="launch-card-desc">${desc}</p>
      </div>`;
  },

  // --- Integration Card ---
  integrationCard(item, isConnected) {
    const dotClass = isConnected ? 'connected' : 'available';
    const statusText = isConnected ? 'Connected' : 'Available';
    return `
      <div class="integration-card" onclick="App.navigateTo('/setup/${item.id}')">
        <div class="integration-icon">${item.emoji}</div>
        <div class="integration-info">
          <div class="integration-name">${item.title}</div>
          <div class="integration-status-text">${statusText}</div>
        </div>
        <div class="integration-status-dot ${dotClass}"></div>
      </div>`;
  },
};
