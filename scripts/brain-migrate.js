#!/usr/bin/env node
/**
 * BizBrain OS — Brain Schema Migration
 * Checks the brain's schema version and applies any needed migrations.
 * Safe to run multiple times (idempotent).
 *
 * Current schema version: 1
 *
 * Usage: node brain-migrate.js <brainPath>
 * Output: JSON with migration results
 */

const fs = require('fs');
const path = require('path');

const CURRENT_SCHEMA_VERSION = 1;
const brainPath = process.argv[2];

if (!brainPath || !fs.existsSync(brainPath)) {
  console.log(JSON.stringify({ migrated: false, reason: 'no-brain' }));
  process.exit(0);
}

const rootFile = path.join(brainPath, '.bizbrain-root.json');
let rootConfig = {};

try {
  rootConfig = JSON.parse(fs.readFileSync(rootFile, 'utf8'));
} catch {
  // No root config — this is a legacy brain, treat as schema 0
}

const currentVersion = rootConfig.schemaVersion || 0;

if (currentVersion >= CURRENT_SCHEMA_VERSION) {
  console.log(JSON.stringify({ migrated: false, reason: 'up-to-date', version: currentVersion }));
  process.exit(0);
}

const migrations = [];

// === Migration 0 → 1: Add schema version + ensure .bizbrain directory structure ===
if (currentVersion < 1) {
  try {
    // Ensure .bizbrain directory exists
    const bizbrainDir = path.join(brainPath, '.bizbrain');
    fs.mkdirSync(bizbrainDir, { recursive: true });

    // Ensure events directory for Brain Swarm
    fs.mkdirSync(path.join(bizbrainDir, 'events'), { recursive: true });

    // Ensure learning directories for PostToolUse
    const learningDir = path.join(brainPath, 'Operations', 'learning');
    fs.mkdirSync(path.join(learningDir, 'sessions'), { recursive: true });
    fs.mkdirSync(path.join(learningDir, 'patterns'), { recursive: true });
    fs.mkdirSync(path.join(learningDir, 'history'), { recursive: true });

    // Ensure entity directories
    const entitiesDir = path.join(brainPath, 'Entities');
    fs.mkdirSync(path.join(entitiesDir, 'Clients'), { recursive: true });
    fs.mkdirSync(path.join(entitiesDir, 'Partners'), { recursive: true });
    fs.mkdirSync(path.join(entitiesDir, 'Vendors'), { recursive: true });
    fs.mkdirSync(path.join(entitiesDir, 'People'), { recursive: true });

    // Ensure other standard directories
    fs.mkdirSync(path.join(brainPath, 'Projects'), { recursive: true });
    fs.mkdirSync(path.join(brainPath, 'Knowledge', 'decisions'), { recursive: true });
    fs.mkdirSync(path.join(brainPath, 'Knowledge', 'references'), { recursive: true });
    fs.mkdirSync(path.join(brainPath, 'Operations', 'todos'), { recursive: true });
    fs.mkdirSync(path.join(brainPath, '_intake-dump'), { recursive: true });

    // Ensure config.json exists with defaults
    const configPath = path.join(brainPath, 'config.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify({
        profile: rootConfig.profile || 'developer',
        features: {
          orchestration: false,
          entityWatchdog: true,
          sessionArchiving: true,
          autoMemory: true,
        },
        telemetry: {
          enabled: false,
        },
      }, null, 2));
    } else {
      // Ensure telemetry section exists in existing config
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (!config.telemetry) {
          config.telemetry = { enabled: false };
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
      } catch { /* leave as-is */ }
    }

    // Update schema version in root config
    rootConfig.schemaVersion = 1;
    rootConfig.lastMigration = new Date().toISOString();
    fs.writeFileSync(rootFile, JSON.stringify(rootConfig, null, 2));

    migrations.push('v0→v1: directory structure + schema version + telemetry config');
  } catch (err) {
    migrations.push(`v0→v1: FAILED — ${err.message}`);
  }
}

// === Future migrations go here ===
// if (currentVersion < 2) { ... }

console.log(JSON.stringify({
  migrated: migrations.length > 0,
  from: currentVersion,
  to: CURRENT_SCHEMA_VERSION,
  migrations,
}));
