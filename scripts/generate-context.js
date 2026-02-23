#!/usr/bin/env node
// BizBrain OS — Context Generator
// Reads brain config.json + state and outputs a context string for SessionStart injection.
// Usage: node generate-context.js <brain-path>

const fs = require('fs');
const path = require('path');

const brainPath = process.argv[2];
if (!brainPath) {
  console.error('Usage: node generate-context.js <brain-path>');
  process.exit(1);
}

const configPath = path.join(brainPath, 'config.json');
if (!fs.existsSync(configPath)) {
  const output = [
    '# BizBrain OS',
    '',
    'Brain not yet configured. Run `/brain setup` to scan your machine and create your knowledge brain.',
    '',
    '## Available Commands',
    '| Command | Description |',
    '|---------|-------------|',
    '| `/brain setup` | First-time setup: scan machine, pick profile, create brain |',
    '| `/brain status` | Show brain status and statistics |',
  ].join('\n');
  process.stdout.write(output);
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const { profile, features, auto_behaviors, preferences, scan_cache } = config;

// Read state if it exists
const statePath = path.join(brainPath, '.bizbrain', 'state.json');
let state = {};
if (fs.existsSync(statePath)) {
  try { state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch(e) {}
}

// Read entity index summary (first 60 lines)
let entitySummary = '';
const entityIndexPath = path.join(brainPath, 'Entities', 'People', 'ENTITY-INDEX.md');
if (fs.existsSync(entityIndexPath)) {
  const content = fs.readFileSync(entityIndexPath, 'utf8');
  const lines = content.split('\n').slice(0, 60);
  entitySummary = lines.join('\n');
}

// Read recent action items (top 10 across all sources)
let actionItems = [];
const todosPath = path.join(brainPath, 'Operations', 'todos', 'aggregated-todos.json');
if (fs.existsSync(todosPath)) {
  try {
    const todos = JSON.parse(fs.readFileSync(todosPath, 'utf8'));
    actionItems = (todos.items || []).filter(t => !t.completed).slice(0, 10);
  } catch(e) {}
}

// Read active projects
let projects = [];
const projectsDir = path.join(brainPath, 'Projects');
if (fs.existsSync(projectsDir)) {
  try {
    const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        const metaPath = path.join(projectsDir, entry.name, '_meta.json');
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            projects.push({ name: entry.name, ...meta });
          } catch(e) {
            projects.push({ name: entry.name, status: 'unknown' });
          }
        } else {
          projects.push({ name: entry.name, status: 'unknown' });
        }
      }
    }
  } catch(e) {}
}

// Build the active features list
const activeFeatures = Object.entries(features || {})
  .filter(([k, v]) => v)
  .map(([k]) => k.replace(/_/g, ' '));

// Build commands table based on active features
const commands = [
  ['`/brain`', 'Brain status, scan, configure, profiles'],
  ['`/knowledge <topic>`', 'Load specific brain knowledge'],
  ['`/todo`', 'View and manage tasks'],
];
if (features?.entity_management) {
  commands.push(['`/entity <name>`', 'Look up or add an entity']);
}
if (features?.gsd_workflow) {
  commands.push(['`/gsd`', 'Project management workflow']);
}
if (features?.time_tracking) {
  commands.push(['`/hours`', 'Time tracking summary']);
}
if (features?.content_pipeline) {
  commands.push(['`/content`', 'Content pipeline management']);
}
if (features?.communications) {
  commands.push(['`/comms`', 'Unified communications']);
}

// Generate context
const lines = [];
lines.push(`# ${profile.businessName || 'My'} Brain — BizBrain OS`);
lines.push('');
lines.push(`> Owner: ${profile.userName || 'Unknown'}`);
if (profile.businessType) lines.push(`> Type: ${profile.businessType}`);
if (profile.industry) lines.push(`> Industry: ${profile.industry}`);
lines.push(`> Brain: ${brainPath}`);
lines.push('');

// Active features
if (activeFeatures.length > 0) {
  lines.push('## Active Features');
  lines.push(activeFeatures.map(f => `- ${f}`).join('\n'));
  lines.push('');
}

// Commands
lines.push('## Commands');
lines.push('| Command | Description |');
lines.push('|---------|-------------|');
commands.forEach(([cmd, desc]) => lines.push(`| ${cmd} | ${desc} |`));
lines.push('');

// Projects
if (projects.length > 0) {
  lines.push('## Active Projects');
  lines.push('| Project | Status | Stack | Repo |');
  lines.push('|---------|--------|-------|------|');
  projects.forEach(p => {
    const status = p.status || 'unknown';
    const stack = p.stack || '';
    const repo = p.repoPath || '';
    lines.push(`| ${p.name} | ${status} | ${stack} | ${repo} |`);
  });
  lines.push('');
}

// Action items
if (actionItems.length > 0) {
  lines.push('## Open Action Items');
  actionItems.forEach(item => {
    lines.push(`- [ ] ${item.id || ''}: ${item.text || item.description || ''}`);
  });
  lines.push('');
}

// Entity index
if (entitySummary && features?.entity_management) {
  lines.push('## Entity Index');
  lines.push(entitySummary);
  lines.push('');
}

// Auto-behaviors
if (auto_behaviors) {
  const active = Object.entries(auto_behaviors)
    .filter(([k, v]) => v !== 'off')
    .map(([k, v]) => `- **${k.replace(/_/g, ' ')}**: ${v}`);
  if (active.length > 0) {
    lines.push('## Active Auto-Behaviors');
    lines.push(active.join('\n'));
    lines.push('');
  }
}

// Entity watchdog instructions (if entity management is on)
if (features?.entity_management) {
  const watchdogMode = auto_behaviors?.entity_detection || 'auto_update';
  lines.push('## Entity Watchdog');
  if (watchdogMode === 'auto_update') {
    lines.push('**ACTIVE — Auto-update mode.** Watch every conversation for entity mentions.');
    lines.push('- New info about known entity -> update their brain record, briefly notify user');
    lines.push('- Unknown entity mentioned with substance -> ask user before creating');
    lines.push(`- Entity Index: \`${brainPath}/Entities/People/ENTITY-INDEX.md\``);
  } else if (watchdogMode === 'ask_first') {
    lines.push('**ACTIVE — Ask-first mode.** Detect entity mentions but confirm before updating.');
  }
  lines.push('');
}

// Communication style
if (preferences?.commStyle) {
  lines.push('## Communication Style');
  lines.push(`Preferred: **${preferences.commStyle}**`);
  lines.push('');
}

// Stats
if (scan_cache?.lastScanAt) {
  lines.push('## Brain Statistics');
  lines.push(`- Last scan: ${scan_cache.lastScanAt}`);
  lines.push(`- Projects: ${scan_cache.projectCount || 0}`);
  lines.push(`- Entities: ${scan_cache.entityCount || 0}`);
  lines.push(`- Services: ${scan_cache.serviceCount || 0}`);
  lines.push('');
}

process.stdout.write(lines.join('\n'));
