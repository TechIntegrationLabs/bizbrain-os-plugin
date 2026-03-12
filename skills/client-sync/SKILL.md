---
name: client-sync
description: |
  Sync client intelligence from external sources (Gmail, Drive, Slack, meetings) into
  BizBrain OS client records. Fetches new emails, shared documents, meeting reports, and
  updates client context automatically. Triggers on: /client-sync, "sync client",
  "refresh client data", "check for new client messages", client intelligence operations.
version: 1.0.0
---

# Client Intelligence Auto-Sync

You sync client intelligence from external data sources into BizBrain OS client records,
keeping _context/, _dump/, and _pulse/ folders current without manual intervention.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## Architecture

```
External Sources          Sync Engine              Brain Destinations
─────────────────         ──────────────           ──────────────────
Gmail (gwcli)      ──→   Fetch & Diff    ──→     _dump/emails/
Google Drive       ──→   Extract Intel   ──→     _dump/google-drive/
Slack (MCP)        ──→   Route & File    ──→     _dump/attachments/
Meeting Reports    ──→   Update Context  ──→     _context/ (history, contacts, actions)
                          Update Pulse    ──→     _pulse/STATUS.md
                          Track State     ──→     Operations/client-sync/state/
```

## Trigger Modes

| Mode | Trigger | Scope | Depth |
|------|---------|-------|-------|
| **Manual** | `/client-sync [client]` | One client or all | Full deep sync |
| **Session** | SessionStart hook | All active clients | Quick check (new messages only) |
| **Scheduled** | Hourly Windows Task | All active clients | Full deep sync |

## Google Workspace CLI

**Binary:** `node ~/Repos/google-workspace-cli/dist/index.js`

**Gmail Commands:**
```bash
node ~/Repos/google-workspace-cli/dist/index.js gmail search "from:client@email.com" --format json
node ~/Repos/google-workspace-cli/dist/index.js gmail read <message-id> --format json
node ~/Repos/google-workspace-cli/dist/index.js gmail list --unread --format json
```

**Drive Commands:**
```bash
node ~/Repos/google-workspace-cli/dist/index.js drive list --folder <id>
node ~/Repos/google-workspace-cli/dist/index.js drive search "query"
node ~/Repos/google-workspace-cli/dist/index.js drive download <file-id> --output path
```

## Manual Sync (`/client-sync`)

When user runs `/client-sync` or `/client-sync <client-name>`:

### Step 1: Load Sync Config
Read `Operations/client-sync/config.json` for:
- Registered clients and their external identifiers (emails, Drive folder IDs, Slack channels)
- Last sync timestamps per source per client
- Sync preferences (depth, sources to check)

### Step 2: For Each Client (or specified client)

#### 2a. Gmail Sync
1. Read client's `_meta.json` to get all known email addresses
2. For each email address, search Gmail:
   ```bash
   node ~/Repos/google-workspace-cli/dist/index.js gmail search "from:<email> after:<last-sync-date>" --format json
   ```
3. For each new email:
   - Read full content: `gmail read <id> --format json`
   - Save to `_dump/emails/<date>_<subject-slug>.md` with frontmatter (date, from, subject, gmail_id)
   - Extract: new contacts → `_context/contacts.md`, action items → `_context/action-items.md`
   - Append interaction to `_context/history.md`
4. Update `_dump/emails/EMAIL-INDEX.md` with new entries

#### 2b. Google Drive Sync
1. Read client's `_meta.json` for shared Drive folder IDs
2. List folder contents: `drive list --folder <id>`
3. Compare against `_dump/google-drive/INVENTORY.md`
4. For new/modified files:
   - Download if possible: `drive download <file-id> --output _dump/google-drive/files/`
   - Update INVENTORY.md with new entries
   - For Google Sheets/Docs: attempt export, log if export fails

#### 2c. Slack Sync (if Slack MCP available)
1. Check client's `_meta.json` for associated Slack channels
2. Search for recent messages mentioning client keywords
3. Extract new intel, save to `_dump/slack/`

#### 2d. Meeting Reports
1. Search Gmail for Read AI / Fireflies reports mentioning client
   ```bash
   node ~/Repos/google-workspace-cli/dist/index.js gmail search "from:notifications@read.ai <client-keywords> after:<last-sync-date>" --format json
   ```
2. Archive new reports to `_dump/meeting-reports/`

### Step 3: Update Context
After fetching from all sources:
1. **Contacts:** Merge any new names/emails into `_context/contacts.md`
2. **History:** Append chronological entries to `_context/history.md`
3. **Action Items:** Extract and add to `_context/action-items.md`
4. **Status:** Update `_pulse/STATUS.md` with latest activity summary
5. **Overview:** If significant new business intel found, update `_context/overview.md`

### Step 4: Update State
Write sync results to `Operations/client-sync/state/<client-slug>.json`:
```json
{
  "client": "Darius Somekhian",
  "lastSync": "2026-03-12T15:30:00Z",
  "sources": {
    "gmail": { "lastSync": "...", "newItems": 3, "status": "ok" },
    "drive": { "lastSync": "...", "newItems": 1, "status": "ok" },
    "slack": { "lastSync": "...", "newItems": 0, "status": "skipped" },
    "meetings": { "lastSync": "...", "newItems": 2, "status": "ok" }
  },
  "totalNewItems": 6,
  "nextScheduledSync": "..."
}
```

### Step 5: Report
Show summary to user:
```
Client Sync: Darius Somekhian
────────────────────────────────
Gmail:    3 new emails (2 from Darius, 1 from Chris Kelly)
Drive:    1 new file (Updated Automation Journeys sheet)
Meetings: 2 new reports archived
Slack:    No new mentions

Updated: contacts.md (+1 email), history.md (+5 entries), action-items.md (+2 items)
Status pulse refreshed.
```

## Quick Sync (SessionStart)

During SessionStart hook, a lightweight check runs:
1. Read `Operations/client-sync/config.json` for active clients
2. For each client, quick Gmail check: `gmail search "from:<primary-email> is:unread" --format json`
3. If new unread messages found, inject into session context:
   ```
   Client Alert: 2 unread from Darius Somekhian (latest: "Re: HubSpot workflow question")
   ```
4. Does NOT process or file — just alerts. User can run `/client-sync` for full processing.

## Config File

**Location:** `Operations/client-sync/config.json`

```json
{
  "version": "1.0.0",
  "syncInterval": "hourly",
  "clients": {
    "darius-somekhian": {
      "name": "Darius Somekhian",
      "active": true,
      "brainPath": "Entities/Clients/Darius-Somekhian",
      "bb1Path": "Clients/Darius-Somekhian",
      "sources": {
        "gmail": {
          "emails": [
            "dariussomekhian@gmail.com",
            "darius@clouddentistry.com",
            "darius@networkdental.us"
          ],
          "keywords": ["pair dental", "network dental", "dds founders", "dripify"],
          "meetingReportSenders": [
            "notifications@read.ai",
            "app@fireflies.ai"
          ]
        },
        "drive": {
          "folderIds": ["1o1rnY5zVOkB4JRrAL9Xx8AtJMNE5MjI0"],
          "sheetIds": ["1qbkus1hwuszjXd3cna2_qlFJl6yYwHrXKKavH15I83g"]
        },
        "slack": {
          "channels": [],
          "keywords": ["darius", "pair dental", "network dental"]
        }
      }
    }
  }
}
```

## Adding a New Client

When a new client entity is created:
1. Add entry to `Operations/client-sync/config.json`
2. Populate `sources` with known emails, Drive folders, Slack channels
3. Set `active: true`
4. Run `/client-sync <client>` for initial full sync

## BB1 vs BizBrain OS Paths

The sync engine works with BB1 paths (the user's primary brain):
- **BB1 Root:** `C:\Users\Disruptors\Documents\Tech Integration Labs BB1\`
- **Client folders:** `BB1/Clients/<Name>/` (BB1's entity structure)
- **Sync config:** `BB1/Operations/client-sync/`

If the BizBrain OS brain is at `~/bizbrain-os/brain/`, entity paths map to `Entities/Clients/`.

## Error Handling

- **gwcli not available:** Log error, skip Gmail/Drive sources, continue with other sources
- **OAuth expired:** Report "Gmail auth expired — run `gwcli profiles login`"
- **Network error:** Log, retry once, then skip source with warning
- **No new data:** Report "No new data since last sync" — this is normal and expected
- **Partial failure:** Complete what you can, report failures clearly

## Rules

1. **Never delete existing data** — only append/update
2. **Deduplicate** — check EMAIL-INDEX.md / INVENTORY.md before adding entries
3. **Preserve formatting** — match existing file formats exactly
4. **Track everything** — every sync writes to state file and logs
5. **Be fast** — quick sync (SessionStart) must complete in under 10 seconds
6. **Ask before creating** — if sync discovers a new entity, ask user before creating BB1 record
