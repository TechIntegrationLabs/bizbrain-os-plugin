"""Data models for meeting transcription."""

from __future__ import annotations

import json
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path


@dataclass
class MeetingInfo:
    """Metadata about a detected or active meeting."""

    platform: str  # zoom, meet, teams, slack, discord, unknown
    title: str
    started_at: datetime
    ended_at: datetime | None = None
    process_name: str = ""
    window_title: str = ""
    audio_chunks: list[Path] = field(default_factory=list)
    transcript_path: Path | None = None

    @property
    def slug(self) -> str:
        """URL-safe slug for filenames."""
        safe = self.title.lower().replace(" ", "-")
        safe = "".join(c for c in safe if c.isalnum() or c == "-")
        return safe[:60] or self.platform

    @property
    def duration_minutes(self) -> float:
        end = self.ended_at or datetime.now()
        return (end - self.started_at).total_seconds() / 60

    def to_dict(self) -> dict:
        d = asdict(self)
        d["started_at"] = self.started_at.isoformat()
        d["ended_at"] = self.ended_at.isoformat() if self.ended_at else None
        d["audio_chunks"] = [str(p) for p in self.audio_chunks]
        d["transcript_path"] = str(self.transcript_path) if self.transcript_path else None
        return d


@dataclass
class TranscriptSegment:
    """A single transcribed segment from Whisper."""

    start: float  # seconds
    end: float
    text: str
    language: str = "en"
    probability: float = 0.0


@dataclass
class SpeakerSegment:
    """A transcript segment with speaker attribution."""

    start: float
    end: float
    text: str
    speaker: str = "Unknown"
    language: str = "en"


@dataclass
class DaemonStatus:
    """Status of the meeting transcription daemon."""

    running: bool = False
    pid: int | None = None
    meeting_active: bool = False
    current_meeting: MeetingInfo | None = None
    chunks_recorded: int = 0
    chunks_transcribed: int = 0
    started_at: str | None = None
    last_check: str | None = None

    def save(self, path: Path) -> None:
        data = {
            "running": self.running,
            "pid": self.pid,
            "meeting_active": self.meeting_active,
            "chunks_recorded": self.chunks_recorded,
            "chunks_transcribed": self.chunks_transcribed,
            "started_at": self.started_at,
            "last_check": self.last_check,
        }
        if self.current_meeting:
            data["current_meeting"] = self.current_meeting.to_dict()
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, indent=2))

    @classmethod
    def load(cls, path: Path) -> DaemonStatus:
        if not path.exists():
            return cls()
        try:
            data = json.loads(path.read_text())
            return cls(
                running=data.get("running", False),
                pid=data.get("pid"),
                meeting_active=data.get("meeting_active", False),
                chunks_recorded=data.get("chunks_recorded", 0),
                chunks_transcribed=data.get("chunks_transcribed", 0),
                started_at=data.get("started_at"),
                last_check=data.get("last_check"),
            )
        except (json.JSONDecodeError, KeyError):
            return cls()
