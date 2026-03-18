#!/usr/bin/env node
/**
 * BizBrain OS — Telemetry Beacon
 * Collects anonymous usage data and sends to Discord webhook.
 * Only runs if user has opted in (config.json: telemetry.enabled = true).
 * Sends once per day (cached in .bizbrain/telemetry-sent.json).
 *
 * PRIVACY: Only aggregate counts and tool names. Never file contents,
 * entity names, project names, or any private data.
 *
 * Usage: node telemetry-beacon.js <brainPath> <pluginVersion>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1483620484636475594/t-y1Br8LdclnliZXwtjmsVkP3sgXn4uY0OeBxZ3qq9xNqrFrLzy3pj65E5KayfJKt13d';

const brainPath = process.argv[2];
const pluginVersion = process.argv[3] || 'unknown';

if (!brainPath || !fs.existsSync(brainPath)) {
  process.exit(0);
}

// Check opt-in
const configPath = path.join(brainPath, 'config.json');
let config = {};
try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch { process.exit(0); }
if (!config.telemetry || !config.telemetry.enabled) {
  process.exit(0);
}

// Check if already sent today
const cacheDir = path.join(brainPath, '.bizbrain');
const cachePath = path.join(cacheDir, 'telemetry-sent.json');
const today = new Date().toISOString().split('T')[0];
try {
  const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  if (cache.lastSent === today) process.exit(0);
} catch { /* first time */ }

// Collect anonymous data
function countDir(dir) {
  try { return fs.readdirSync(dir).filter(f => !f.startsWith('.')).length; } catch { return 0; }
}

function countFilesRecursive(dir) {
  let count = 0;
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) count += countFilesRecursive(path.join(dir, entry.name));
      else if (entry.name.endsWith('.md')) count++;
    }
  } catch { /* skip */ }
  return count;
}

function getSessionStats() {
  const sessionsDir = path.join(brainPath, 'Operations', 'learning', 'sessions');
  const stats = { activeDays: 0, totalHeartbeats: 0, topTools: {} };
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  try {
    for (const file of fs.readdirSync(sessionsDir)) {
      if (!file.endsWith('.log')) continue;
      const dateStr = file.replace('.log', '');
      if (new Date(dateStr) < cutoff) continue;

      const lines = fs.readFileSync(path.join(sessionsDir, file), 'utf8').split('\n').filter(l => l.trim());
      if (lines.length === 0) continue;
      stats.activeDays++;
      stats.totalHeartbeats += lines.length;

      for (const line of lines) {
        const parts = line.split(/\s+/);
        const tool = parts[1] || 'unknown';
        stats.topTools[tool] = (stats.topTools[tool] || 0) + 1;
      }
    }
  } catch { /* no sessions dir */ }

  return stats;
}

function getChecklistProgress() {
  try {
    const progress = JSON.parse(fs.readFileSync(path.join(cacheDir, 'checklist-progress.json'), 'utf8'));
    const completed = Object.values(progress).filter(v => v === 'completed' || v === true).length;
    return { completed, total: Object.keys(progress).length };
  } catch { return { completed: 0, total: 0 }; }
}

function getBrainMeta() {
  try {
    const root = JSON.parse(fs.readFileSync(path.join(brainPath, '.bizbrain-root.json'), 'utf8'));
    return { mode: root.mode || 'compact', profile: root.profile || 'unknown', createdAt: root.createdAt || 'unknown' };
  } catch { return { mode: 'compact', profile: 'unknown', createdAt: 'unknown' }; }
}

// Gather report
const meta = getBrainMeta();
const sessions = getSessionStats();
const checklist = getChecklistProgress();
const topToolsSorted = Object.entries(sessions.topTools)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([tool, count]) => `${tool}: ${count}`)
  .join(', ');

const report = {
  v: pluginVersion,
  mode: meta.mode,
  profile: meta.profile,
  age: meta.createdAt !== 'unknown' ? Math.floor((Date.now() - new Date(meta.createdAt).getTime()) / 86400000) : -1,
  os: process.platform,
  node: process.version,
  days30: sessions.activeDays,
  heartbeats30: sessions.totalHeartbeats,
  topTools: topToolsSorted,
  clients: countDir(path.join(brainPath, 'Entities', 'Clients')),
  partners: countDir(path.join(brainPath, 'Entities', 'Partners')),
  vendors: countDir(path.join(brainPath, 'Entities', 'Vendors')),
  projects: countDir(path.join(brainPath, 'Projects')),
  knowledge: countFilesRecursive(path.join(brainPath, 'Knowledge')),
  checklistDone: checklist.completed,
  checklistTotal: checklist.total,
  features: config.features ? Object.entries(config.features).filter(([, v]) => v).map(([k]) => k).join(', ') : 'default',
};

// Build Discord embed
const embed = {
  title: `Telemetry — v${report.v}`,
  color: 2335743,
  fields: [
    { name: 'Environment', value: `${report.os} | Node ${report.node} | ${report.mode} mode | ${report.profile} profile | ${report.age}d old`, inline: false },
    { name: 'Activity (30d)', value: `${report.days30} active days | ${report.heartbeats30} heartbeats`, inline: false },
    { name: 'Top Tools', value: report.topTools || 'none', inline: false },
    { name: 'Brain Size', value: `${report.clients}c ${report.partners}p ${report.vendors}v | ${report.projects} projects | ${report.knowledge} knowledge files`, inline: false },
    { name: 'Checklist', value: `${report.checklistDone}/${report.checklistTotal}`, inline: true },
    { name: 'Features', value: report.features, inline: true },
  ],
  timestamp: new Date().toISOString(),
};

// Send to Discord webhook
const payload = JSON.stringify({ embeds: [embed] });
const url = new URL(WEBHOOK_URL);

const req = https.request({
  hostname: url.hostname,
  path: url.pathname,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
  timeout: 3000,
}, (res) => {
  // Cache success
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify({ lastSent: today, version: pluginVersion }));
  } catch { /* ignore */ }
  process.exit(0);
});

req.on('error', () => process.exit(0));
req.on('timeout', () => { req.destroy(); process.exit(0); });
req.write(payload);
req.end();
