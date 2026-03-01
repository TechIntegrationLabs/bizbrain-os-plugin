"""Format transcripts as brain-compatible markdown + JSON metadata."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from .models import MeetingInfo, TranscriptSegment, SpeakerSegment


def format_timestamp(seconds: float) -> str:
    """Convert seconds to HH:MM:SS format."""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def format_transcript_markdown(
    meeting: MeetingInfo,
    segments: list[TranscriptSegment | SpeakerSegment],
) -> str:
    """Generate brain-compatible markdown transcript.

    Output format matches the brain's entity/project file conventions:
    YAML-style header, then structured content.
    """
    lines = [
        f"# Meeting Transcript — {meeting.title}",
        "",
        f"**Platform:** {meeting.platform}",
        f"**Date:** {meeting.started_at.strftime('%Y-%m-%d')}",
        f"**Started:** {meeting.started_at.strftime('%H:%M')}",
    ]

    if meeting.ended_at:
        lines.append(f"**Ended:** {meeting.ended_at.strftime('%H:%M')}")
        lines.append(f"**Duration:** {meeting.duration_minutes:.0f} minutes")

    lines.extend(["", "---", "", "## Transcript", ""])

    has_speakers = segments and isinstance(segments[0], SpeakerSegment)
    current_speaker = None

    for seg in segments:
        timestamp = format_timestamp(seg.start)

        if has_speakers and isinstance(seg, SpeakerSegment):
            if seg.speaker != current_speaker:
                current_speaker = seg.speaker
                lines.append(f"\n**{current_speaker}** [{timestamp}]")
            lines.append(f"> {seg.text}")
        else:
            lines.append(f"[{timestamp}] {seg.text}")

    lines.extend(["", "---", "", "*Transcribed locally by BizBrain OS meeting transcriber.*", ""])

    return "\n".join(lines)


def format_metadata_json(
    meeting: MeetingInfo,
    segments: list[TranscriptSegment | SpeakerSegment],
) -> dict:
    """Generate JSON metadata sidecar for brain integration."""
    speakers = set()
    if segments and isinstance(segments[0], SpeakerSegment):
        for seg in segments:
            if isinstance(seg, SpeakerSegment):
                speakers.add(seg.speaker)

    word_count = sum(len(seg.text.split()) for seg in segments)

    return {
        "type": "meeting-transcript",
        "version": "1.0.0",
        "meeting": {
            "platform": meeting.platform,
            "title": meeting.title,
            "date": meeting.started_at.strftime("%Y-%m-%d"),
            "started_at": meeting.started_at.isoformat(),
            "ended_at": meeting.ended_at.isoformat() if meeting.ended_at else None,
            "duration_minutes": round(meeting.duration_minutes, 1),
        },
        "transcript": {
            "segments": len(segments),
            "word_count": word_count,
            "speakers": sorted(speakers) if speakers else [],
            "has_diarization": bool(speakers),
        },
        "generated_at": datetime.now().isoformat(),
        "generator": "bizbrain-meetings",
    }


def format_intake_summary(
    meeting: MeetingInfo,
    segments: list[TranscriptSegment | SpeakerSegment],
) -> str:
    """Generate a short summary for the brain's intake system.

    Dropped into _intake-dump/files/ for entity linking and action item extraction.
    """
    word_count = sum(len(seg.text.split()) for seg in segments)
    full_text = " ".join(seg.text for seg in segments[:20])  # First ~20 segments for summary

    lines = [
        f"# Meeting Summary — {meeting.title}",
        "",
        f"**Platform:** {meeting.platform}",
        f"**Date:** {meeting.started_at.strftime('%Y-%m-%d %H:%M')}",
        f"**Duration:** {meeting.duration_minutes:.0f} minutes",
        f"**Word count:** {word_count}",
        "",
        "## Opening excerpt",
        "",
        full_text[:1000],
        "",
        f"**Full transcript:** Operations/meetings/transcripts/{meeting.started_at.strftime('%Y-%m-%d')}-{meeting.slug}.md",
        "",
        "---",
        "*Process this file for entity linking and action item extraction.*",
        "",
    ]

    return "\n".join(lines)


def save_transcript(
    brain_path: Path,
    meeting: MeetingInfo,
    segments: list[TranscriptSegment | SpeakerSegment],
) -> Path:
    """Save transcript markdown, JSON metadata, and intake summary to brain.

    Returns the path to the saved transcript markdown file.
    """
    date_str = meeting.started_at.strftime("%Y-%m-%d")
    filename = f"{date_str}-{meeting.slug}"

    # Transcript directory
    transcript_dir = brain_path / "Operations" / "meetings" / "transcripts"
    transcript_dir.mkdir(parents=True, exist_ok=True)

    # Save markdown transcript
    md_path = transcript_dir / f"{filename}.md"
    md_path.write_text(format_transcript_markdown(meeting, segments), encoding="utf-8")

    # Save JSON metadata sidecar
    meta_path = transcript_dir / f"{filename}.meta.json"
    meta = format_metadata_json(meeting, segments)
    meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")

    # Save intake summary for entity linking
    intake_dir = brain_path / "_intake-dump" / "files"
    intake_dir.mkdir(parents=True, exist_ok=True)
    intake_path = intake_dir / f"meeting-{filename}.md"
    intake_path.write_text(format_intake_summary(meeting, segments), encoding="utf-8")

    return md_path
