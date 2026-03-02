"""Format transcripts as brain-compatible markdown + JSON metadata."""

from __future__ import annotations

import json
import re
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

    # Include recording reference if available
    if meeting.recording_path:
        rel_path = meeting.recording_path
        # Try to make path relative to brain
        try:
            rel_path = meeting.recording_path.relative_to(meeting.recording_path.parents[3])
        except (ValueError, IndexError):
            pass
        lines.append(f"**Recording:** {rel_path}")

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
    detected_entities: list[str] | None = None,
) -> dict:
    """Generate JSON metadata sidecar for brain integration."""
    speakers = set()
    if segments and isinstance(segments[0], SpeakerSegment):
        for seg in segments:
            if isinstance(seg, SpeakerSegment):
                speakers.add(seg.speaker)

    word_count = sum(len(seg.text.split()) for seg in segments)

    meta = {
        "type": "meeting-transcript",
        "version": "2.0.0",
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
        "needs_ai_summary": True,
        "detected_entities": detected_entities or [],
        "generated_at": datetime.now().isoformat(),
        "generator": "bizbrain-meetings",
    }

    if meeting.recording_path:
        meta["recording_path"] = str(meeting.recording_path)

    return meta


def format_intake_summary(
    meeting: MeetingInfo,
    segments: list[TranscriptSegment | SpeakerSegment],
    brain_path: Path | None = None,
) -> str:
    """Generate an enriched intake summary for the brain's intake system.

    Dropped into _intake-dump/files/ for entity linking, action item extraction,
    and AI summarization. Includes the full transcript text so Claude can generate
    a proper summary without needing to read additional files.
    """
    word_count = sum(len(seg.text.split()) for seg in segments)
    full_text = "\n".join(
        f"[{format_timestamp(seg.start)}] {seg.text}" for seg in segments
    )

    # Detect entities if brain path available
    detected = []
    if brain_path:
        detected = _detect_entities_in_transcript(
            segments, brain_path
        )

    date_str = meeting.started_at.strftime("%Y-%m-%d")
    transcript_ref = f"Operations/meetings/transcripts/{date_str}-{meeting.slug}.md"

    recording_ref = ""
    if meeting.recording_path:
        recording_ref = f"\n**Recording:** Operations/meetings/recordings/{date_str}-{meeting.slug}.wav"

    entities_line = ""
    if detected:
        entities_line = f"\n**Detected-Entities:** {', '.join(detected)}"

    lines = [
        f"# Meeting Summary — {meeting.title}",
        "",
        f"**Platform:** {meeting.platform}",
        f"**Date:** {meeting.started_at.strftime('%Y-%m-%d %H:%M')}",
        f"**Duration:** {meeting.duration_minutes:.0f} minutes",
        f"**Word count:** {word_count}",
        f"**Needs-AI-Summary:** true",
        f"**Full transcript:** {transcript_ref}",
    ]

    if recording_ref:
        lines.append(recording_ref)
    if entities_line:
        lines.append(entities_line)

    lines.extend([
        "",
        "## Summary",
        "",
        "<!-- AI: Generate a 3-5 sentence executive summary of this meeting. -->",
        "",
        "## Key Topics",
        "",
        "<!-- AI: List the main topics discussed as bullet points. -->",
        "",
        "## Decisions Made",
        "",
        "<!-- AI: List any decisions that were made during this meeting. -->",
        "",
        "## Action Items",
        "",
        "<!-- AI: Extract action items with assignee if mentioned. Format as checkboxes: - [ ] Action (Owner) -->",
        "",
        "---",
        "",
        "## Full Transcript",
        "",
        full_text,
        "",
        "---",
        "*Process this file for entity linking, action item extraction, and AI summary generation.*",
        "",
    ])

    return "\n".join(lines)


def _detect_entities_in_transcript(
    segments: list[TranscriptSegment | SpeakerSegment],
    brain_path: Path,
) -> list[str]:
    """Scan transcript text against ENTITY-INDEX.md names and aliases.

    Returns a list of entity names that appear in the transcript.
    """
    entity_index = brain_path / "Operations" / "entity-watchdog" / "ENTITY-INDEX.md"
    if not entity_index.exists():
        return []

    # Parse entity names and aliases from the index
    try:
        content = entity_index.read_text(encoding="utf-8")
    except Exception:
        return []

    # Build keyword set from entity names
    # The ENTITY-INDEX.md typically has lines like:
    # | Entity Name | Type | Aliases | ...
    keywords: dict[str, str] = {}  # lowercase keyword → entity name
    for line in content.splitlines():
        if not line.startswith("|") or "---" in line or "Entity" in line:
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) >= 3:
            entity_name = parts[1]
            if entity_name:
                # Add the entity name itself
                keywords[entity_name.lower()] = entity_name
                # Add aliases if present (typically in column 3 or 4)
                for part in parts[2:]:
                    for alias in part.split(","):
                        alias = alias.strip()
                        if alias and len(alias) > 2:
                            keywords[alias.lower()] = entity_name

    if not keywords:
        return []

    # Combine all transcript text
    all_text = " ".join(seg.text for seg in segments).lower()

    # Find matches
    found = set()
    for keyword, entity_name in keywords.items():
        # Use word boundary matching to avoid partial matches
        if re.search(r"\b" + re.escape(keyword) + r"\b", all_text):
            found.add(entity_name)

    return sorted(found)


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

    # Detect entities for metadata
    detected_entities = _detect_entities_in_transcript(segments, brain_path)

    # Transcript directory
    transcript_dir = brain_path / "Operations" / "meetings" / "transcripts"
    transcript_dir.mkdir(parents=True, exist_ok=True)

    # Save markdown transcript
    md_path = transcript_dir / f"{filename}.md"
    md_path.write_text(format_transcript_markdown(meeting, segments), encoding="utf-8")

    # Save JSON metadata sidecar
    meta_path = transcript_dir / f"{filename}.meta.json"
    meta = format_metadata_json(meeting, segments, detected_entities=detected_entities)
    meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")

    # Save enriched intake summary for entity linking and AI summarization
    intake_dir = brain_path / "_intake-dump" / "files"
    intake_dir.mkdir(parents=True, exist_ok=True)
    intake_path = intake_dir / f"meeting-{filename}.md"
    intake_path.write_text(
        format_intake_summary(meeting, segments, brain_path=brain_path),
        encoding="utf-8",
    )

    return md_path
