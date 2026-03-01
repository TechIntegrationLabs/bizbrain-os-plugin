#!/usr/bin/env node
// BizBrain OS — Zone-Aware Context Generator
// Reads brain config + state and outputs a context string for SessionStart injection.
// Adjusts context depth based on which zone the user is working in.
//
// Usage: node generate-context.js <brain-path> [mode] [zone] [root-path]
//   brain-path: path to the brain data folder (where config.json lives)
//   mode: "compact" or "full" (default: compact)
//   zone: "brain", "workspaces", "launchpad", "external" (default: brain)
//   root-path: root container path (full mode only)

const fs = require('fs');
const path = require('path');

const brainPath = process.argv[2];
const mode = process.argv[3] || 'compact';
const zone = process.argv[4] || 'brain';
const rootPath = process.argv[5] || brainPath;

if (!brainPath) {
  console.error('Usage: node generate-context.js <brain-path> [mode] [zone] [root-path]');
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

// ============================================================================
// SHARED DATA LOADERS (used by multiple zones)
// ============================================================================

function loadEntitySummary(maxLines = 60) {
  const entityIndexPath = path.join(brainPath, 'Entities', 'People', 'ENTITY-INDEX.md');
  if (!fs.existsSync(entityIndexPath)) return '';
  const content = fs.readFileSync(entityIndexPath, 'utf8');
  return content.split('\n').slice(0, maxLines).join('\n');
}

function loadActionItems(max = 10) {
  const todosPath = path.join(brainPath, 'Operations', 'todos', 'aggregated-todos.json');
  if (!fs.existsSync(todosPath)) return [];
  try {
    const todos = JSON.parse(fs.readFileSync(todosPath, 'utf8'));
    return (todos.items || []).filter(t => !t.completed).slice(0, max);
  } catch(e) { return []; }
}

function loadProjects() {
  const projects = [];
  const projectsDir = path.join(brainPath, 'Projects');
  if (!fs.existsSync(projectsDir)) return projects;
  try {
    const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.')) {
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
  return projects;
}

function buildCommandsTable(zone) {
  const cmds = [
    ['`/brain`', 'Brain status, scan, configure, profiles'],
    ['`/knowledge <topic>`', 'Load specific brain knowledge'],
    ['`/todo`', 'View and manage tasks'],
  ];
  if (features?.entity_management) {
    cmds.push(['`/entity <name>`', 'Look up or add an entity']);
  }
  if (features?.gsd_workflow) {
    cmds.push(['`/gsd`', 'Project management workflow']);
  }
  if (features?.time_tracking) {
    cmds.push(['`/hours`', 'Time tracking summary']);
  }
  if (features?.content_pipeline) {
    cmds.push(['`/content`', 'Content pipeline management']);
  }
  if (features?.communications) {
    cmds.push(['`/comms`', 'Unified communications']);
  }
  if (features?.intake_processing) {
    cmds.push(['`/intake`', 'Process intake files']);
  }
  if (features?.outreach_engine) {
    cmds.push(['`/outreach`', 'Lead pipeline management']);
  }
  if (features?.meeting_transcription) {
    cmds.push(['`/meetings`', 'Local meeting transcription']);
  }
  return cmds;
}

// ============================================================================
// ZONE-SPECIFIC GENERATORS
// ============================================================================

function generateBrainContext() {
  // Full brain context — maximum detail
  const lines = [];
  const projects = loadProjects();
  const actionItems = loadActionItems(10);
  const entitySummary = loadEntitySummary(60);

  lines.push(`# ${profile.businessName || 'My'} Brain — BizBrain OS`);
  lines.push('');
  lines.push(`> Owner: ${profile.userName || 'Unknown'}`);
  if (profile.businessType) lines.push(`> Type: ${profile.businessType}`);
  if (profile.industry) lines.push(`> Industry: ${profile.industry}`);
  lines.push(`> Brain: \`${brainPath}\``);
  if (mode === 'full') {
    lines.push(`> Mode: Full (three-zone) | Zone: brain`);
  }
  lines.push('');

  // Active features
  const activeFeatures = Object.entries(features || {})
    .filter(([k, v]) => v)
    .map(([k]) => k.replace(/_/g, ' '));
  if (activeFeatures.length > 0) {
    lines.push('## Active Features');
    lines.push(activeFeatures.map(f => `- ${f}`).join('\n'));
    lines.push('');
  }

  // Commands
  const cmds = buildCommandsTable('brain');
  lines.push('## Commands');
  lines.push('| Command | Description |');
  lines.push('|---------|-------------|');
  cmds.forEach(([cmd, desc]) => lines.push(`| ${cmd} | ${desc} |`));
  lines.push('');

  // Projects
  if (projects.length > 0) {
    lines.push('## Active Projects');
    lines.push('| Project | Status | Stack | Repo |');
    lines.push('|---------|--------|-------|------|');
    projects.forEach(p => {
      lines.push(`| ${p.name} | ${p.status || 'unknown'} | ${p.stack || ''} | ${p.repoPath || ''} |`);
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

  // Recent meeting transcripts
  if (features?.meeting_transcription) {
    const transcriptsDir = path.join(brainPath, 'Operations', 'meetings', 'transcripts');
    if (fs.existsSync(transcriptsDir)) {
      try {
        const transcriptFiles = fs.readdirSync(transcriptsDir)
          .filter(f => f.endsWith('.md'))
          .sort()
          .reverse()
          .slice(0, 5);
        if (transcriptFiles.length > 0) {
          lines.push('## Recent Meeting Transcripts');
          transcriptFiles.forEach(f => {
            const name = f.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
            lines.push(`- \`${f}\` — ${name}`);
          });
          lines.push('');
        }
      } catch(e) {}
    }
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

  // Entity watchdog
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

  // Continuous learning
  appendContinuousLearning(lines);

  return lines.join('\n');
}

function generateWorkspacesContext() {
  // Lean context for code development — just what developers need
  const lines = [];
  const projects = loadProjects();

  lines.push(`# BizBrain OS — Workspaces`);
  lines.push('');
  lines.push(`> Owner: ${profile.userName || 'Unknown'} | ${profile.businessName || ''}`);
  lines.push(`> Brain: \`${brainPath}\` (use \`/knowledge\` to load brain data)`);
  lines.push('');

  // Compact commands
  lines.push('## Commands');
  lines.push('| Command | Description |');
  lines.push('|---------|-------------|');
  lines.push('| `/knowledge <topic>` | Load brain knowledge |');
  lines.push('| `/todo` | View and manage tasks |');
  lines.push('| `/todo add <task>` | Add task (auto-routes to project) |');
  lines.push('| `/gsd` | Project management workflow |');
  lines.push('| `/hours` | Time tracking |');
  lines.push('| `/entity <name>` | Look up entity |');
  lines.push('| `/brain status` | Full brain dashboard |');
  lines.push('');

  // Projects (compact — name + stack + repo only)
  if (projects.length > 0) {
    const activeProjects = projects.filter(p =>
      p.status === 'active' || p.status === 'discovered' || !p.status || p.status === 'unknown'
    );
    if (activeProjects.length > 0) {
      lines.push('## Projects');
      lines.push('| Project | Stack | Repo |');
      lines.push('|---------|-------|------|');
      activeProjects.slice(0, 20).forEach(p => {
        lines.push(`| ${p.name} | ${p.stack || ''} | ${p.repoPath || ''} |`);
      });
      if (activeProjects.length > 20) {
        lines.push(`| ... | ${activeProjects.length - 20} more | |`);
      }
      lines.push('');
    }
  }

  // Brief action items (top 5 only)
  const actionItems = loadActionItems(5);
  if (actionItems.length > 0) {
    lines.push('## Top Action Items');
    actionItems.forEach(item => {
      lines.push(`- [ ] ${item.id || ''}: ${item.text || item.description || ''}`);
    });
    lines.push('');
  }

  // Brain data access instructions
  lines.push('## Accessing Brain Data');
  lines.push(`The full brain lives at \`${brainPath}\`. From here you can:`);
  lines.push('- `/knowledge systems/<topic>` — Load system documentation');
  lines.push('- `/entity <name>` — Look up client, partner, or collaborator');
  lines.push(`- Read files directly from \`${brainPath}/Knowledge/\`, \`${brainPath}/Entities/\`, etc.`);
  lines.push('');

  // Minimal continuous learning (just project tracking + time)
  lines.push('## Auto-Tracking');
  lines.push('- Time tracking heartbeats are active (automatic)');
  lines.push('- New repos detected here are flagged for brain onboarding');
  lines.push('- Use `/todo add <task>` to capture action items to the brain');
  lines.push('');

  return lines.join('\n');
}

function generateLaunchpadContext() {
  // Medium context — optimized starting point for all Claude Code sessions
  const lines = [];
  const projects = loadProjects();
  const actionItems = loadActionItems(10);
  const entitySummary = loadEntitySummary(40);

  lines.push(`# ${profile.businessName || 'My'} Brain — Launchpad`);
  lines.push('');
  lines.push(`> Owner: ${profile.userName || 'Unknown'}`);
  if (profile.businessType) lines.push(`> Type: ${profile.businessType}`);
  lines.push(`> Brain: \`${brainPath}\``);
  lines.push('');

  lines.push('**This is the launchpad.** Start all Claude Code sessions here for optimized context with auto-capture.');
  lines.push('All sessions are automatically captured to the brain for future reference.');
  lines.push('');

  // All commands available
  const cmds = buildCommandsTable('launchpad');
  lines.push('## Commands');
  lines.push('| Command | Description |');
  lines.push('|---------|-------------|');
  cmds.forEach(([cmd, desc]) => lines.push(`| ${cmd} | ${desc} |`));
  lines.push('');

  // Brain folder reference — WHERE TO FIND THINGS
  lines.push('## Brain Structure');
  lines.push(`| Folder | Path | Contains |`);
  lines.push(`|--------|------|----------|`);
  lines.push(`| Knowledge | \`${brainPath}/Knowledge/\` | Systems, decisions, templates, references |`);
  if (features?.entity_management) {
    lines.push(`| Entities | \`${brainPath}/Entities/\` | Clients, Partners, Vendors, People |`);
  }
  if (features?.project_tracking) {
    lines.push(`| Projects | \`${brainPath}/Projects/\` | Project workspaces and metadata |`);
  }
  lines.push(`| Operations | \`${brainPath}/Operations/\` | Todos, timesheets, credentials, learning |`);
  lines.push(`| Intake | \`${brainPath}/_intake-dump/\` | Drop zone for files to process |`);
  if (features?.communications) {
    lines.push(`| Comms | \`${brainPath}/Communications/\` | Communication channels and history |`);
  }
  lines.push('');

  // HOW TO RECORD things back to the brain
  lines.push('## Recording to Brain');
  lines.push('When information comes up in this conversation:');
  lines.push(`- **Decisions** → Write to \`${brainPath}/Knowledge/decisions/YYYY-MM-DD-<topic>.md\``);
  lines.push(`- **Action items** → Add to relevant \`action-items.md\` file (project or entity)`);
  lines.push(`- **New knowledge** → Write to \`${brainPath}/Knowledge/\` appropriate subfolder`);
  lines.push(`- **Entity updates** → Update files in \`${brainPath}/Entities/<Type>/<Name>/\``);
  lines.push('');

  // Active projects (compact list)
  if (projects.length > 0) {
    const activeProjects = projects.filter(p =>
      p.status === 'active' || p.status === 'discovered' || !p.status || p.status === 'unknown'
    ).slice(0, 15);
    if (activeProjects.length > 0) {
      lines.push('## Active Projects');
      lines.push('| Project | Status | Stack |');
      lines.push('|---------|--------|-------|');
      activeProjects.forEach(p => {
        lines.push(`| ${p.name} | ${p.status || ''} | ${p.stack || ''} |`);
      });
      lines.push('');
    }
  }

  // Open action items
  if (actionItems.length > 0) {
    lines.push('## Open Action Items');
    actionItems.forEach(item => {
      lines.push(`- [ ] ${item.id || ''}: ${item.text || item.description || ''}`);
    });
    lines.push('');
  }

  // Entity index (compact)
  if (entitySummary && features?.entity_management) {
    lines.push('## Entity Index');
    lines.push(entitySummary);
    lines.push('');
  }

  // Entity watchdog (full rules — this is where business conversations happen)
  if (features?.entity_management) {
    const watchdogMode = auto_behaviors?.entity_detection || 'auto_update';
    lines.push('## Entity Watchdog (ACTIVE)');
    lines.push('');
    lines.push('**Watch every conversation for entity mentions and maintain brain records.**');
    lines.push('');
    if (watchdogMode === 'auto_update') {
      lines.push('**Auto-update (do immediately, mention briefly):**');
      lines.push('- New contact details → update entity `_meta.json` + contacts');
      lines.push('- Title/role change → update entity records');
      lines.push('- New interaction/meeting → append to `history.md`');
      lines.push('- Action items → add to `action-items.md`');
      lines.push('- New alias → update `_meta.json` + ENTITY-INDEX.md');
      lines.push('');
      lines.push('**Ask first (confirm before acting):**');
      lines.push('- Unknown entity mentioned with substance → ask before creating');
      lines.push('- Type reclassification (client → partner)');
      lines.push('- Status changes (active → inactive)');
    } else if (watchdogMode === 'ask_first') {
      lines.push('**Ask-first mode.** Detect entity mentions but confirm before updating.');
    }
    lines.push('');
    lines.push(`Entity Index: \`${brainPath}/Entities/People/ENTITY-INDEX.md\``);
    lines.push('');
  }

  // Recent meeting transcripts (launchpad)
  if (features?.meeting_transcription) {
    const transcriptsDir = path.join(brainPath, 'Operations', 'meetings', 'transcripts');
    if (fs.existsSync(transcriptsDir)) {
      try {
        const transcriptFiles = fs.readdirSync(transcriptsDir)
          .filter(f => f.endsWith('.md'))
          .sort()
          .reverse()
          .slice(0, 3);
        if (transcriptFiles.length > 0) {
          lines.push('## Recent Transcripts');
          transcriptFiles.forEach(f => {
            const name = f.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
            lines.push(`- \`${f}\` — ${name}`);
          });
          lines.push('');
        }
      } catch(e) {}
    }
  }

  // Auto-behaviors (relevant subset)
  lines.push('## Auto-Capture');
  lines.push('- **Action items** → Extracted and saved to brain automatically');
  lines.push('- **Decisions** → Logged with rationale');
  lines.push('- **Entity mentions** → Watchdog updates records');
  lines.push('- **Session summary** → Saved when session ends');
  lines.push('');

  return lines.join('\n');
}

function generateExternalContext() {
  // Minimal context for sessions outside the brain entirely
  const lines = [];

  lines.push(`# BizBrain OS`);
  lines.push('');
  lines.push(`> Brain: \`${brainPath}\``);
  if (mode === 'full' && rootPath) {
    lines.push(`> Workspaces: \`${rootPath}/workspaces\``);
    lines.push(`> Launchpad: \`${rootPath}/launchpad\``);
  }
  lines.push('');

  // Key commands
  lines.push('## Commands');
  lines.push('| Command | Description |');
  lines.push('|---------|-------------|');
  lines.push('| `/brain status` | Brain dashboard |');
  lines.push('| `/knowledge <topic>` | Load brain knowledge |');
  lines.push('| `/todo` | View and manage tasks |');
  lines.push('| `/entity <name>` | Look up entity |');
  lines.push('| `/hours` | Time tracking |');
  lines.push('| `/gsd` | Project management |');
  lines.push('');

  // Active auto-behaviors (just mention they're on)
  lines.push('## Auto-Tracking');
  lines.push('- Time tracking heartbeats are active');
  lines.push('- Entity watchdog is monitoring for mentions');
  lines.push('- New repos are auto-detected for brain onboarding');
  lines.push('');

  return lines.join('\n');
}

// ============================================================================
// CONTINUOUS LEARNING BLOCK (appended to brain + conversations zones)
// ============================================================================

function appendContinuousLearning(lines) {
  lines.push('## Continuous Learning (ACTIVE)');
  lines.push('');
  lines.push('**You MUST proactively feed learnings back to the brain throughout this session.**');
  lines.push('Use the `brain-learner` agent to write back observations. Do NOT wait for the user to ask.');
  lines.push('');
  lines.push('### Auto-Capture Triggers');
  lines.push('');

  if (auto_behaviors?.action_item_extraction !== 'off') {
    lines.push('- **Action Items:** When the user mentions a task, deadline, or follow-up → invoke brain-learner to capture it');
  }
  if (auto_behaviors?.decision_logging !== 'off') {
    lines.push('- **Decisions:** When the user makes a tech/architecture/business decision → invoke brain-learner to log it');
  }
  lines.push('- **Project Status:** When significant work is completed on a project → invoke brain-learner to update project status');
  lines.push('- **New Repos:** If the current working directory is a git repo NOT listed in Active Projects above → invoke brain-learner to onboard it');
  lines.push('- **Session Summary:** Before the session ends or when wrapping up → invoke brain-learner to save a summary');
  lines.push('- **Relationship Updates:** When collaborators are mentioned with new info → invoke entity-watchdog');
  lines.push('');

  // Check for untracked repos
  const untrackedDir = path.join(brainPath, '.bizbrain', 'untracked-repos');
  if (fs.existsSync(untrackedDir)) {
    try {
      const untrackedFiles = fs.readdirSync(untrackedDir).filter(f => f.endsWith('.json'));
      if (untrackedFiles.length > 0) {
        lines.push('### Untracked Repos Detected');
        lines.push('The PostToolUse hook detected work in repos not yet in the brain:');
        for (const f of untrackedFiles.slice(0, 5)) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(untrackedDir, f), 'utf8'));
            lines.push(`- **${data.name}** at \`${data.path}\` (detected ${data.detectedAt})`);
          } catch(e) {}
        }
        lines.push('');
        lines.push('Invoke brain-learner to add these to the brain, or ask the user if they should be tracked.');
        lines.push('');
      }
    } catch(e) {}
  }

  // Last session info
  const lastSessionPath = path.join(brainPath, '.bizbrain', 'last-session.json');
  if (fs.existsSync(lastSessionPath)) {
    try {
      const lastSession = JSON.parse(fs.readFileSync(lastSessionPath, 'utf8'));
      if (lastSession.sessionEnd) {
        lines.push('### Last Session');
        lines.push(`- Ended: ${lastSession.sessionEnd}`);
        lines.push(`- Tool uses: ${lastSession.heartbeats || 'unknown'}`);
        lines.push('');
      }
    } catch(e) {}
  }

  // Recent session summaries
  const summariesDir = path.join(brainPath, 'Operations', 'learning', 'summaries');
  if (fs.existsSync(summariesDir)) {
    try {
      const summaryFiles = fs.readdirSync(summariesDir)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse()
        .slice(0, 3);
      if (summaryFiles.length > 0) {
        lines.push('### Recent Session Summaries');
        for (const f of summaryFiles) {
          const content = fs.readFileSync(path.join(summariesDir, f), 'utf8');
          const preview = content.split('\n').slice(0, 8).join('\n');
          lines.push(preview);
          lines.push('');
        }
      }
    } catch(e) {}
  }

  // Recent decisions
  const decisionsDir = path.join(brainPath, 'Knowledge', 'decisions');
  if (fs.existsSync(decisionsDir)) {
    try {
      const decisionFiles = fs.readdirSync(decisionsDir).filter(f => f.endsWith('.md'));
      if (decisionFiles.length > 0) {
        lines.push('### Recent Decisions');
        for (const f of decisionFiles.slice(-3)) {
          const content = fs.readFileSync(path.join(decisionsDir, f), 'utf8');
          const lastDecision = content.split('\n## ').pop();
          if (lastDecision) {
            const preview = lastDecision.split('\n').slice(0, 4).join('\n');
            lines.push(`**${f.replace('.md', '')}:** ${preview}`);
          }
        }
        lines.push('');
      }
    } catch(e) {}
  }
}

// ============================================================================
// MAIN — Select generator based on zone
// ============================================================================

let output;
switch (zone) {
  case 'workspaces':
    output = generateWorkspacesContext();
    break;
  case 'launchpad':
    output = generateLaunchpadContext();
    break;
  case 'external':
    output = generateExternalContext();
    break;
  case 'brain':
  default:
    output = generateBrainContext();
    break;
}

process.stdout.write(output);
