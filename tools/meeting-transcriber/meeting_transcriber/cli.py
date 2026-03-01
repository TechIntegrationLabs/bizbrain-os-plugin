"""CLI entry point for bizbrain-meetings."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path


def find_brain_path() -> Path | None:
    """Locate the brain folder."""
    # BIZBRAIN_PATH env
    env_path = os.environ.get("BIZBRAIN_PATH")
    if env_path:
        p = Path(env_path)
        if p.exists():
            return p

    # ~/bizbrain-os/
    home = Path.home() / "bizbrain-os"
    if home.exists():
        return home

    return None


def cmd_daemon(args: list[str]) -> None:
    """Start the meeting transcription daemon."""
    brain_path = find_brain_path()
    if not brain_path:
        print("Error: No brain folder found. Set BIZBRAIN_PATH or run /brain setup.")
        sys.exit(1)

    model = "base"
    language = None
    diarize = False
    hf_token = os.environ.get("HF_TOKEN")

    # Parse flags
    i = 0
    while i < len(args):
        if args[i] in ("--model", "-m") and i + 1 < len(args):
            model = args[i + 1]
            i += 2
        elif args[i] in ("--language", "-l") and i + 1 < len(args):
            language = args[i + 1]
            i += 2
        elif args[i] == "--diarize":
            diarize = True
            i += 1
        elif args[i] == "--hf-token" and i + 1 < len(args):
            hf_token = args[i + 1]
            i += 2
        else:
            i += 1

    from .daemon import MeetingDaemon

    daemon = MeetingDaemon(
        brain_path=brain_path,
        model_size=model,
        language=language,
        diarize=diarize,
        hf_token=hf_token,
    )
    daemon.start()


def cmd_transcribe(args: list[str]) -> None:
    """Transcribe a specific audio file."""
    if not args:
        print("Usage: bizbrain-meetings transcribe <audio-file> [--model base]")
        sys.exit(1)

    audio_path = Path(args[0])
    if not audio_path.exists():
        print(f"Error: File not found: {audio_path}")
        sys.exit(1)

    model = "base"
    for i, arg in enumerate(args[1:], 1):
        if arg in ("--model", "-m") and i + 1 < len(args):
            model = args[i + 1]

    from .transcriber import WhisperTranscriber

    transcriber = WhisperTranscriber(model_size=model)
    segments = transcriber.transcribe(audio_path)

    for seg in segments:
        h = int(seg.start // 3600)
        m = int((seg.start % 3600) // 60)
        s = int(seg.start % 60)
        ts = f"{h:02d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"
        print(f"[{ts}] {seg.text}")


def cmd_status(args: list[str]) -> None:
    """Show daemon status."""
    brain_path = find_brain_path()
    if not brain_path:
        print("No brain folder found.")
        return

    status_file = brain_path / ".bizbrain" / "meeting-daemon-status.json"
    if not status_file.exists():
        print("Meeting daemon has not been run yet.")
        return

    data = json.loads(status_file.read_text())
    print(f"Running: {data.get('running', False)}")
    print(f"PID: {data.get('pid', 'N/A')}")
    print(f"Meeting active: {data.get('meeting_active', False)}")
    print(f"Chunks recorded: {data.get('chunks_recorded', 0)}")
    print(f"Chunks transcribed: {data.get('chunks_transcribed', 0)}")
    print(f"Last check: {data.get('last_check', 'N/A')}")

    if data.get("current_meeting"):
        m = data["current_meeting"]
        print(f"\nCurrent meeting:")
        print(f"  Platform: {m.get('platform')}")
        print(f"  Title: {m.get('title')}")
        print(f"  Started: {m.get('started_at')}")


def cmd_stop(args: list[str]) -> None:
    """Stop the running daemon."""
    brain_path = find_brain_path()
    if not brain_path:
        print("No brain folder found.")
        return

    pid_file = brain_path / ".bizbrain" / "meeting-daemon.pid"
    if not pid_file.exists():
        print("No daemon PID file found.")
        return

    try:
        pid = int(pid_file.read_text().strip())
        import psutil
        proc = psutil.Process(pid)
        proc.terminate()
        proc.wait(timeout=10)
        print(f"Daemon (PID {pid}) stopped.")
    except Exception as e:
        print(f"Error stopping daemon: {e}")
        if pid_file.exists():
            pid_file.unlink()


def cmd_setup(args: list[str]) -> None:
    """Check prerequisites and show setup instructions."""
    print("BizBrain Meetings — Setup Check\n")

    # Check brain
    brain = find_brain_path()
    print(f"Brain folder: {brain or 'NOT FOUND'}")

    # Check Python packages
    deps = {
        "faster_whisper": "faster-whisper",
        "pyaudiowpatch": "pyaudiowpatch",
        "sounddevice": "sounddevice",
        "numpy": "numpy",
        "psutil": "psutil",
    }

    missing = []
    for module, package in deps.items():
        try:
            __import__(module)
            print(f"  {package}: installed")
        except ImportError:
            print(f"  {package}: MISSING")
            missing.append(package)

    # Optional deps
    print("\nOptional (for speaker diarization):")
    for module, package in [("pyannote.audio", "pyannote-audio"), ("torch", "torch")]:
        try:
            __import__(module)
            print(f"  {package}: installed")
        except ImportError:
            print(f"  {package}: not installed")

    if missing:
        print(f"\nInstall missing deps:")
        print(f"  cd tools/meeting-transcriber && uv pip install -e .")
    else:
        print(f"\nAll dependencies installed. Ready to use!")
        print(f"  Start daemon: bizbrain-meetings daemon")
        print(f"  Or via plugin: /meetings start")


COMMANDS = {
    "daemon": cmd_daemon,
    "transcribe": cmd_transcribe,
    "status": cmd_status,
    "stop": cmd_stop,
    "setup": cmd_setup,
}


def main() -> None:
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print("Usage: bizbrain-meetings <command> [args]")
        print("\nCommands:")
        print("  daemon      Start the meeting transcription daemon")
        print("  transcribe  Transcribe a specific audio file")
        print("  status      Show daemon status")
        print("  stop        Stop the running daemon")
        print("  setup       Check prerequisites and show setup info")
        sys.exit(0)

    cmd = sys.argv[1]
    if cmd not in COMMANDS:
        print(f"Unknown command: {cmd}")
        print(f"Available: {', '.join(COMMANDS.keys())}")
        sys.exit(1)

    COMMANDS[cmd](sys.argv[2:])


if __name__ == "__main__":
    main()
