---
name: meeting-transcription
description: |
  Use for local meeting transcription — starting/stopping the daemon, viewing transcripts,
  checking status, managing meeting recordings, and processing AI summaries. Triggers on:
  /meetings, "transcribe my meeting", "start recording", "meeting notes", "what was discussed",
  reviewing transcripts, "summarize meeting". This is a Local-First Free Alternative — replaces
  Otter.ai/Fireflies for $0/month. Supports Windows (WASAPI) and macOS (BlackHole).
version: 2.0.0
---

# Meeting Transcription

You manage local meeting transcription for BizBrain OS. This feature captures system audio
via platform-native loopback, transcribes with faster-whisper (local, offline), and saves
brain-compatible transcripts with automatic intake integration, entity detection, and
AI summary preparation.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## Platform Support

| Platform | Audio Capture | Meeting Detection | Setup Required |
|----------|--------------|-------------------|----------------|
| **Windows** | WASAPI loopback (built-in) | Win32 window titles (ctypes) | None — works out of the box |
| **macOS** | BlackHole virtual device | psutil + Quartz window API | Install BlackHole + configure Multi-Output Device |

## How It Works

1. **Audio Capture:** Platform-native loopback records whatever plays through speakers/headphones
2. **Platform Agnostic:** Works with Zoom, Meet, Teams, Slack, Discord — any audio source
3. **Local Transcription:** faster-whisper runs entirely on the user's machine (no cloud, no API keys)
4. **Brain Integration:** Transcripts saved as markdown, enriched intake files dropped for AI summarization
5. **Entity Detection:** Automatically detects mentioned entities from ENTITY-INDEX.md
6. **Permanent Recordings:** Full meeting audio stitched into single WAV files (kept forever by default)
7. **Optional Diarization:** pyannote-audio identifies individual speakers across full meeting (not just first chunk)

## Key Paths

| Item | Path |
|------|------|
| Transcripts | `<BRAIN>/Operations/meetings/transcripts/` |
| Recordings | `<BRAIN>/Operations/meetings/recordings/` |
| Audio chunks (temp) | `<BRAIN>/Operations/meetings/_audio/` |
| Daemon PID | `<BRAIN>/.bizbrain/meeting-daemon.pid` |
| Daemon status | `<BRAIN>/.bizbrain/meeting-daemon-status.json` |
| Intake summaries | `<BRAIN>/_intake-dump/files/meeting-*.md` |
| Python package | `${CLAUDE_PLUGIN_ROOT}/tools/meeting-transcriber/` |

## Prerequisites

The meeting transcriber is a standalone Python package that needs to be installed once:

**Windows:**
```bash
cd ${CLAUDE_PLUGIN_ROOT}/tools/meeting-transcriber
uv pip install -e ".[windows]"
```

**macOS:**
```bash
cd ${CLAUDE_PLUGIN_ROOT}/tools/meeting-transcriber
uv pip install -e ".[macos]"
```

Or without platform extras (core only):
```bash
pip install -e ${CLAUDE_PLUGIN_ROOT}/tools/meeting-transcriber
```

Required: Python 3.10+

### First-Time Setup

When a user first uses `/meetings`, check:

1. **Python available?** — Run `python --version` or `python3 --version`
2. **Package installed?** — Run `bizbrain-meetings setup` to check all deps
3. **Brain folder exists?** — Check BIZBRAIN_PATH or ~/bizbrain-os/
4. **Meeting directories exist?** — Create `Operations/meetings/transcripts/`, `Operations/meetings/recordings/`, and `Operations/meetings/_audio/` if missing

If not installed, guide the user through setup:
```
To set up meeting transcription:

1. Install the package:
   cd ${CLAUDE_PLUGIN_ROOT}/tools/meeting-transcriber
   uv pip install -e ".[windows]"   # Windows
   uv pip install -e ".[macos]"     # macOS

2. (Optional) For speaker identification:
   uv pip install -e ".[diarization]"
   Set HF_TOKEN env var with your HuggingFace token

3. Start the daemon:
   bizbrain-meetings daemon
```

### macOS Setup (BlackHole)

macOS requires BlackHole for system audio capture. Run `bizbrain-meetings setup` for
automated checks, or follow these manual steps:

1. **Install BlackHole 2ch:**
   - Download from https://existential.audio/blackhole/
   - Or: `brew install blackhole-2ch`

2. **Create Multi-Output Device:**
   - Open Audio MIDI Setup (Applications > Utilities)
   - Click '+' → Create Multi-Output Device
   - Check both your speakers/headphones AND BlackHole 2ch

3. **Set as system output:**
   - System Preferences > Sound > Output
   - Select the Multi-Output Device

This routes audio to both your ears AND BlackHole for capture. The daemon
detects the BlackHole input device automatically.

## Commands

### `/meetings` or `/meetings status`

Show current daemon status:
1. Read `<BRAIN>/.bizbrain/meeting-daemon-status.json`
2. Show: running/stopped, PID, meeting active, chunks recorded
3. If meeting is active, show platform, title, duration so far

### `/meetings setup`

Run first-time setup:
1. Execute `bizbrain-meetings setup` via Bash
2. Report any missing dependencies
3. Guide user through platform-specific installation

### `/meetings start`

Start the transcription daemon:
1. Check if daemon is already running (read PID file, check if process exists)
2. If not running, start it in the background:
   ```bash
   bizbrain-meetings daemon --model base &
   ```
3. Available flags:
   - `--model tiny|base|small|medium|large-v3` — Whisper model size (default: base)
   - `--language en` — Force language (default: auto-detect)
   - `--diarize` — Enable speaker diarization (needs pyannote + HF_TOKEN)
   - `--keep-audio` — Keep recordings forever (default)
   - `--delete-audio-after N` — Delete audio chunks after N days
4. Confirm daemon started, show PID

**Important:** The daemon is resource-intensive when transcribing (loads Whisper model into memory).
The `base` model uses ~150MB RAM; `large-v3` uses ~3GB. Only start when the user expects a meeting.

### `/meetings stop`

Stop the running daemon:
1. Execute `bizbrain-meetings stop`
2. Confirm stopped
3. If a meeting was in progress, it will be transcribed before stopping

### `/meetings list`

List recent transcripts:
1. Read files in `<BRAIN>/Operations/meetings/transcripts/*.md`
2. Show table: date, title, platform, duration, word count
3. Sort by date descending, show last 10

### `/meetings <filename>`

View a specific transcript:
1. Read the file from `<BRAIN>/Operations/meetings/transcripts/<filename>`
2. If filename doesn't end in .md, append it
3. Display the transcript content
4. Also read the `.meta.json` sidecar if it exists for additional context

## Transcript Format

Transcripts are saved as markdown:

```markdown
# Meeting Transcript — Weekly Standup

**Platform:** zoom
**Date:** 2026-02-28
**Started:** 09:00
**Ended:** 09:30
**Duration:** 30 minutes
**Recording:** Operations/meetings/recordings/2026-02-28-weekly-standup.wav

---

## Transcript

[00:00] Welcome everyone, let's start with updates...
[00:45] The API refactor is on track for Friday.
[02:15] Can we talk about the deployment pipeline?
...

---

*Transcribed locally by BizBrain OS meeting transcriber.*
```

With speaker diarization:

```markdown
## Transcript

**SPEAKER_00** [00:00]
> Welcome everyone, let's start with updates.

**SPEAKER_01** [00:15]
> The API refactor is on track for Friday.
```

## Intake Integration & AI Summary

When a meeting is transcribed, an enriched intake file is dropped to `<BRAIN>/_intake-dump/files/`.
This file includes the **full transcript text** and a `Needs-AI-Summary: true` flag.

### Post-Meeting AI Summary Workflow

When you detect an intake file with `Needs-AI-Summary: true`:

1. **Read** the full intake file (contains complete transcript)
2. **Generate** summary sections:
   - Executive summary (3-5 sentences)
   - Key topics (bullet points)
   - Decisions made
   - Action items (with assignees if mentioned)
3. **Write** the generated content back to the intake file, replacing the HTML comment placeholders
4. **Route action items** to appropriate entity files:
   ```python
   from meeting_transcriber.brain_updater import BrainUpdater
   updater = BrainUpdater(brain_path)
   updater.write_action_items(meeting_info, action_items)
   ```
   Each action item dict: `{"text": "...", "owner": "Name", "entity": "EntityName"}`
5. **Remove** the `Needs-AI-Summary: true` flag (or set to `false`)

### Entity Detection

The intake file includes a `Detected-Entities:` field listing entities found by
keyword-matching against ENTITY-INDEX.md. Entity history files are automatically
updated with a meeting reference entry (no LLM needed for this step).

## Audio Retention

- **Permanent recordings:** Stitched single WAV files in `Operations/meetings/recordings/` — kept forever by default
- **Temp chunks:** Raw 5-minute WAV chunks in `Operations/meetings/_audio/` — kept forever by default, configurable via `--delete-audio-after N`
- **Transcripts:** Always kept permanently

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No loopback device found" (Windows) | Check that a WASAPI audio output device is active. Plug in headphones or speakers. |
| "BlackHole audio device not found" (macOS) | Install BlackHole and run `bizbrain-meetings setup` for instructions. |
| "Model download failed" | faster-whisper downloads models on first use. Ensure internet connection for initial setup. |
| Daemon exits immediately | Run `bizbrain-meetings daemon` in foreground (without &) to see error messages |
| No audio captured (Windows) | Ensure meeting audio plays through the default output device |
| No audio captured (macOS) | Ensure Multi-Output Device is set as system output and includes both speakers + BlackHole |
| Poor transcription quality | Try a larger model: `--model small` or `--model medium` |
| Only first speaker labeled | Upgrade to v0.2.0 — fixes full-meeting diarization (was only first 5-min chunk) |
