#!/usr/bin/env node
/**
 * BizBrain OS — Changelog Notification
 * Checks if the plugin version changed since last session.
 * If so, extracts the relevant changelog section and outputs it.
 *
 * Usage: node changelog-notify.js <brainPath> <pluginRoot> <pluginVersion>
 * Output: Changelog text for the new version, or empty string if no update
 */

const fs = require('fs');
const path = require('path');

const brainPath = process.argv[2];
const pluginRoot = process.argv[3];
const pluginVersion = process.argv[4];

if (!brainPath || !pluginRoot || !pluginVersion) {
  process.exit(0);
}

const cacheDir = path.join(brainPath, '.bizbrain');
const cachePath = path.join(cacheDir, 'last-seen-version.json');

// Check last seen version
let lastSeen = '';
try {
  const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  lastSeen = cache.version || '';
} catch { /* first time */ }

if (lastSeen === pluginVersion) {
  // No change — output nothing
  process.exit(0);
}

// Version changed! Save new version
try {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify({
    version: pluginVersion,
    seenAt: new Date().toISOString(),
    previousVersion: lastSeen || 'unknown',
  }));
} catch { /* ignore */ }

// Extract changelog section for this version
const changelogPath = path.join(pluginRoot, 'CHANGELOG.md');
let changelogSection = '';

try {
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  // Find the section for this version
  const versionPattern = new RegExp(`## \\[${pluginVersion.replace(/\./g, '\\.')}\\].*?\\n([\\s\\S]*?)(?=## \\[|$)`);
  const match = changelog.match(versionPattern);
  if (match) {
    // Clean up — take first 500 chars max, trim trailing whitespace
    changelogSection = match[1].trim();
    if (changelogSection.length > 500) {
      changelogSection = changelogSection.substring(0, 500) + '...';
    }
  }
} catch { /* no changelog */ }

if (changelogSection) {
  // Output the notification
  const notice = `## What's New in v${pluginVersion}\n\n${changelogSection}\n\n*Run \`/brain status\` for full details.*`;
  process.stdout.write(notice);
} else if (lastSeen && lastSeen !== pluginVersion) {
  // No changelog but version changed
  process.stdout.write(`## Updated to v${pluginVersion}\n\nBizBrain OS has been updated from v${lastSeen}. Run \`/brain status\` for details.`);
}
