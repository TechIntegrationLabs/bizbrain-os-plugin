---
name: meeting-transcription
description: |
  Use for local meeting transcription — starting/stopping the daemon, viewing transcripts,
  checking status, and managing meeting recordings. Triggers on: /meetings, "transcribe my
  meeting", "start recording", "meeting notes", "what was discussed", reviewing transcripts.
  This is a Local-First Free Alternative — replaces Otter.ai/Fireflies for $0/month.
version: 1.0.0
---

# Meeting Transcription

You manage local meeting transcription for BizBrain OS. This feature captures system audio
via WASAPI loopback, transcribes with faster-whisper (local, offline), and saves brain-compatible
transcripts with automatic intake integration for entity linking and action item extraction.

## Brain Location

Check: BIZBRAIN_PATH env → ~/bizbrain-os/

## How It Works

1. **Audio Capture:** WASAPI loopback records whatever plays through the system's speakers/headphones
2. **Platform Agnostic:** Works with Zoom, Meet, Teams, Slack, Discord — any audio source
3. **Local Transcription:** faster-whisper runs entirely on the user's machine (no cloud, no API keys)
4. **Brain Integration:** Transcripts saved as markdown, summaries dropped to intake for entity/action extraction
5. **Optional Diarization:** pyannote-audio can identify individual speakers (requires HuggingFace token)

## Key Paths

| Item | Path |
|------|------|
| Transcripts | `<BRAIN>/Operations/meetings/transcripts/` |
| Audio chunks | `<BRAIN>/Operations/meetings/_audio/` |
| Daemon PID | `<BRAIN>/.bizbrain/meeting-daemon.pid` |
| Daemon status | `<BRAIN>/.bizbrain/meeting-daemon-status.json` |
| Intake summaries | `<BRAIN>/_intake-dump/files/meeting-*.md` |
| Python package | `${CLAUDE_PLUGIN_ROOT}/tools/meeting-transcriber/` |

## Prerequisites

The meeting transcriber is a standalone Python package that needs to be installed once:

```bash
cd ${CLAUDE_PLUGIN_ROOT}/tools/meeting-transcriber
uv pip install -e .
```

Or without uv:
```bash
pip install -e ${CLAUDE_PLUGIN_ROOT}/tools/meeting-transcriber
```

Required: Python 3.10+, Windows (for WASAPI loopback)

### First-Time Setup

When a user first uses `/meetings`, check:

1. **Python available?** — Run `python --version` or `python3 --version`
2. **Package installed?** — Run `bizbrain-meetings setup` to check all deps
3. **Brain folder exists?** — Check BIZBRAIN_PATH or ~/bizbrain-os/
4. **Meeting directories exist?** — Create `Operations/meetings/transcripts/` and `Operations/meetings/_audio/` if missing

If not installed, guide the user through setup:
```
To set up meeting transcription:

1. Install the package:
   cd ${CLAUDE_PLUGIN_ROOT}/tools/meeting-transcriber
   uv pip install -e .

2. (Optional) For speaker identification:
   uv pip install -e ".[diarization]"
   Set HF_TOKEN env var with your HuggingFace token

3. Start the daemon:
   bizbrain-meetings daemon
```

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
3. Guide user through installation

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

## Intake Integration

When a meeting is transcribed, a summary is automatically dropped to `<BRAIN>/_intake-dump/files/`.
This enables the brain's intake system to:
- Link mentions to known entities (clients, partners, vendors)
- Extract action items into the todo system
- Update project status based on discussion content

## Audio Retention

Raw audio chunks are stored in `<BRAIN>/Operations/meetings/_audio/` and auto-deleted
after 7 days. This is configurable in the daemon. Transcripts are kept permanently.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No loopback device found" | Check that a WASAPI audio output device is active. Plug in headphones or speakers. |
| "Model download failed" | faster-whisper downloads models on first use. Ensure internet connection for initial setup. |
| Daemon exits immediately | Run `bizbrain-meetings daemon` in foreground (without &) to see error messages |
| No audio captured | Ensure the meeting audio is playing through the default output device |
| Poor transcription quality | Try a larger model: `--model small` or `--model medium` |
