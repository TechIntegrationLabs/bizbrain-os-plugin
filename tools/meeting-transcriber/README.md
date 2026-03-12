# BizBrain Meetings

Local meeting transcription for BizBrain OS — replaces Otter.ai for $0/month.

## Features

- **WASAPI loopback** (Windows) / **BlackHole** (macOS) audio capture
- **faster-whisper** for local, free transcription
- **Speaker diarization** via pyannote (optional)
- Auto-detection of meeting apps (Zoom, Meet, Teams, Slack, Discord)
- BB1 intake integration — transcripts auto-route to brain

## Usage

```bash
# Transcribe a file
bizbrain-meetings transcribe recording.mp4 --model medium

# Start live daemon
bizbrain-meetings daemon --model base

# Check setup
bizbrain-meetings setup

# Auto-install with platform deps
bizbrain-meetings install
```

## Models

| Model | Size | Speed | Accuracy |
|-------|------|-------|----------|
| tiny | 75 MB | Fastest | Basic |
| base | 140 MB | Fast | Good |
| small | 460 MB | Medium | Better |
| medium | 1.5 GB | Slow | Great |
| large-v3 | 3 GB | Slowest | Best |
