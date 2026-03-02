"""Meeting transcription daemon — orchestrates detect → record → transcribe → save."""

from __future__ import annotations

import os
import signal
import sys
import time
from datetime import datetime
from pathlib import Path

from .detector import detect_meeting, is_meeting_still_active, DetectedMeeting
from .formatter import save_transcript
from .models import DaemonStatus, MeetingInfo
from .recorder import LoopbackRecorder
from .transcriber import WhisperTranscriber

POLL_INTERVAL_SEC = 5  # How often to check for meetings


class MeetingDaemon:
    """Main orchestrator: polls for meetings, records, transcribes, saves.

    Lifecycle:
        1. Poll detector every POLL_INTERVAL_SEC
        2. When meeting detected → start loopback recorder
        3. When meeting ends → stop recorder → transcribe chunks → save to brain
        4. Optionally clean up old audio files based on retention policy
    """

    def __init__(
        self,
        brain_path: Path,
        model_size: str = "base",
        language: str | None = None,
        diarize: bool = False,
        hf_token: str | None = None,
        audio_retention_days: int | None = None,
    ):
        self.brain_path = brain_path
        self.model_size = model_size
        self.language = language
        self.diarize = diarize
        self.hf_token = hf_token
        self.audio_retention_days = audio_retention_days  # None = keep forever

        self._bizbrain_dir = brain_path / ".bizbrain"
        self._pid_file = self._bizbrain_dir / "meeting-daemon.pid"
        self._status_file = self._bizbrain_dir / "meeting-daemon-status.json"
        self._audio_dir = brain_path / "Operations" / "meetings" / "_audio"
        self._recordings_dir = brain_path / "Operations" / "meetings" / "recordings"
        self._running = False
        self._current_meeting: MeetingInfo | None = None
        self._recorder: LoopbackRecorder | None = None

    def start(self) -> None:
        """Start the daemon. Writes PID file and enters main loop."""
        self._bizbrain_dir.mkdir(parents=True, exist_ok=True)
        self._audio_dir.mkdir(parents=True, exist_ok=True)
        self._recordings_dir.mkdir(parents=True, exist_ok=True)

        # Check for existing daemon
        if self._pid_file.exists():
            try:
                existing_pid = int(self._pid_file.read_text().strip())
                import psutil
                if psutil.pid_exists(existing_pid):
                    print(f"Daemon already running (PID {existing_pid})")
                    sys.exit(1)
            except (ValueError, ImportError):
                pass

        # Write PID
        self._pid_file.write_text(str(os.getpid()))
        self._running = True

        # Handle graceful shutdown
        signal.signal(signal.SIGTERM, self._handle_signal)
        signal.signal(signal.SIGINT, self._handle_signal)

        retention_msg = (
            f"delete after {self.audio_retention_days} days"
            if self.audio_retention_days is not None
            else "keep forever"
        )
        self._update_status(running=True)
        print(f"Meeting daemon started (PID {os.getpid()}, model: {self.model_size})")
        print(f"Brain: {self.brain_path}")
        print(f"Audio retention: {retention_msg}")
        print("Listening for meetings...")

        try:
            self._main_loop()
        finally:
            self._cleanup()

    def stop(self) -> None:
        """Signal the daemon to stop."""
        self._running = False

    def _main_loop(self) -> None:
        while self._running:
            try:
                if self._current_meeting:
                    # Meeting in progress — check if it ended
                    detected = detect_meeting()
                    if detected is None:
                        self._on_meeting_end()
                    else:
                        self._update_status(meeting_active=True)
                else:
                    # No meeting — poll for one
                    detected = detect_meeting()
                    if detected is not None:
                        self._on_meeting_start(detected)
            except Exception as e:
                print(f"Error in main loop: {e}")

            time.sleep(POLL_INTERVAL_SEC)

    def _on_meeting_start(self, detected: DetectedMeeting) -> None:
        """Called when a new meeting is detected."""
        now = datetime.now()
        self._current_meeting = MeetingInfo(
            platform=detected.platform,
            title=detected.window_title or detected.platform,
            started_at=now,
            process_name=detected.process_name,
            window_title=detected.window_title,
        )

        # Start recording to a session-specific audio directory
        session_dir = self._audio_dir / now.strftime("%Y-%m-%d_%H%M%S")
        self._recorder = LoopbackRecorder(session_dir)
        self._recorder.start()

        print(f"\nMeeting detected: {detected.platform} — {detected.window_title}")
        print(f"Recording to: {session_dir}")
        self._update_status(meeting_active=True)

    def _on_meeting_end(self) -> None:
        """Called when the active meeting ends."""
        if not self._current_meeting or not self._recorder:
            return

        self._current_meeting.ended_at = datetime.now()
        print(f"\nMeeting ended ({self._current_meeting.duration_minutes:.0f} min)")

        # Stop recording
        chunk_paths = self._recorder.stop()
        self._current_meeting.audio_chunks = chunk_paths
        print(f"Recorded {len(chunk_paths)} audio chunk(s)")

        if not chunk_paths:
            print("No audio recorded — skipping transcription")
            self._current_meeting = None
            self._recorder = None
            self._update_status(meeting_active=False)
            return

        # Stitch chunks into a single permanent recording
        recording_path = self._stitch_recording(chunk_paths)
        if recording_path:
            self._current_meeting.recording_path = recording_path
            print(f"Recording saved: {recording_path}")

        # Transcribe
        print(f"Transcribing with {self.model_size} model...")
        transcriber = WhisperTranscriber(model_size=self.model_size)
        segments = transcriber.transcribe_chunks(chunk_paths, language=self.language)
        print(f"Transcribed {len(segments)} segments")

        # Optional diarization — now uses full meeting audio
        if self.diarize:
            try:
                from .diarizer import SpeakerDiarizer, DIARIZATION_AVAILABLE
                if DIARIZATION_AVAILABLE:
                    print("Running speaker diarization (full meeting)...")
                    diarizer = SpeakerDiarizer(hf_token=self.hf_token)
                    segments = diarizer.diarize_full_meeting(chunk_paths, segments)
                    speakers = {s.speaker for s in segments}
                    print(f"Identified speakers: {speakers}")
            except Exception as e:
                print(f"Diarization failed (continuing without): {e}")

        # Save transcript to brain
        transcript_path = save_transcript(
            self.brain_path, self._current_meeting, segments
        )
        self._current_meeting.transcript_path = transcript_path
        print(f"Transcript saved: {transcript_path}")

        # Proactive BB1 brain updates (entity history)
        try:
            from .brain_updater import BrainUpdater
            updater = BrainUpdater(self.brain_path)
            updated = updater.update_entity_histories(self._current_meeting, segments)
            if updated:
                print(f"Updated entity histories: {', '.join(updated)}")
        except Exception as e:
            print(f"Brain update skipped: {e}")

        # Clean up old audio (if retention policy set)
        self._cleanup_old_audio()

        # Reset state
        self._current_meeting = None
        self._recorder = None
        self._update_status(meeting_active=False)

    def _stitch_recording(self, chunk_paths: list[Path]) -> Path | None:
        """Stitch audio chunks into a single clean WAV file for permanent storage."""
        if not chunk_paths:
            return None

        date_str = self._current_meeting.started_at.strftime("%Y-%m-%d")
        slug = self._current_meeting.slug
        recording_path = self._recordings_dir / f"{date_str}-{slug}.wav"

        try:
            from .diarizer import _stitch_wav_files
            _stitch_wav_files(chunk_paths, recording_path)
            return recording_path
        except Exception:
            # Fallback: manual stitching without diarizer import
            try:
                _stitch_wav_chunks(chunk_paths, recording_path)
                return recording_path
            except Exception as e:
                print(f"Warning: Could not stitch recording: {e}")
                return None

    def _cleanup_old_audio(self) -> None:
        """Delete audio chunks older than retention period.

        When audio_retention_days is None, audio is kept forever.
        """
        if self.audio_retention_days is None:
            return
        if not self._audio_dir.exists():
            return
        cutoff = time.time() - (self.audio_retention_days * 86400)
        for session_dir in self._audio_dir.iterdir():
            if session_dir.is_dir() and session_dir.stat().st_mtime < cutoff:
                for f in session_dir.iterdir():
                    f.unlink()
                session_dir.rmdir()

    def _update_status(self, **kwargs) -> None:
        status = DaemonStatus.load(self._status_file)
        status.pid = os.getpid()
        status.last_check = datetime.now().isoformat()
        for k, v in kwargs.items():
            setattr(status, k, v)
        if self._recorder:
            status.chunks_recorded = len(self._recorder.chunks)
        status.save(self._status_file)

    def _handle_signal(self, signum, frame) -> None:
        print(f"\nReceived signal {signum} — stopping...")
        self._running = False

    def _cleanup(self) -> None:
        """Final cleanup on daemon exit."""
        if self._current_meeting:
            # _on_meeting_end handles stopping the recorder internally
            self._on_meeting_end()
        elif self._recorder:
            # No active meeting but recorder running — just stop it
            self._recorder.stop()
        if self._pid_file.exists():
            self._pid_file.unlink()
        self._update_status(running=False, meeting_active=False)
        print("Daemon stopped.")


def _stitch_wav_chunks(chunk_paths: list[Path], output_path: Path) -> None:
    """Concatenate WAV chunks into a single file (standalone fallback)."""
    import wave

    valid_paths = [p for p in chunk_paths if p.exists()]
    if not valid_paths:
        return

    with wave.open(str(valid_paths[0]), "rb") as first:
        params = first.getparams()

    with wave.open(str(output_path), "wb") as out:
        out.setparams(params)
        for chunk_path in valid_paths:
            with wave.open(str(chunk_path), "rb") as chunk:
                out.writeframes(chunk.readframes(chunk.getnframes()))
