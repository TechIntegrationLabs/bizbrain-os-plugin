"""Proactive BB1 brain updates after meeting transcription.

Updates entity histories with meeting references and provides
action item routing for post-AI processing.
"""

from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path

from .models import MeetingInfo, TranscriptSegment, SpeakerSegment


class BrainUpdater:
    """Updates BB1 entity records and todos after meeting transcription.

    Immediate (keyword-based, no LLM):
        - update_entity_histories() — appends meeting entry to entity history files

    Deferred (called by skill after AI processing):
        - write_action_items() — routes extracted action items to entity/todo files
    """

    def __init__(self, brain_path: Path):
        self.brain_path = brain_path
        self._entity_map: dict[str, dict] | None = None

    def _load_entity_map(self) -> dict[str, dict]:
        """Parse ENTITY-INDEX.md into keyword → entity info lookup.

        Returns dict mapping lowercase keywords to:
            {"name": str, "type": str, "folder": str}
        """
        if self._entity_map is not None:
            return self._entity_map

        self._entity_map = {}
        index_path = self.brain_path / "Operations" / "entity-watchdog" / "ENTITY-INDEX.md"
        if not index_path.exists():
            return self._entity_map

        try:
            content = index_path.read_text(encoding="utf-8")
        except Exception:
            return self._entity_map

        for line in content.splitlines():
            if not line.startswith("|") or "---" in line:
                continue
            parts = [p.strip() for p in line.split("|")]
            if len(parts) < 4:
                continue

            name = parts[1]
            entity_type = parts[2].lower() if len(parts) > 2 else ""
            aliases_str = parts[3] if len(parts) > 3 else ""

            # Skip header row
            if not name or name.lower() in ("entity", "name", "entity name"):
                continue

            # Determine BB1 folder
            type_folder_map = {
                "client": "Clients",
                "partner": "Partners",
                "vendor": "Vendors",
                "project": "Projects",
            }
            folder = type_folder_map.get(entity_type, "")

            info = {"name": name, "type": entity_type, "folder": folder}

            # Map the entity name
            self._entity_map[name.lower()] = info

            # Map aliases
            for alias in aliases_str.split(","):
                alias = alias.strip()
                if alias and len(alias) > 2:
                    self._entity_map[alias.lower()] = info

        return self._entity_map

    def _detect_entity_slugs(
        self,
        segments: list[TranscriptSegment | SpeakerSegment],
    ) -> list[dict]:
        """Find entities mentioned in transcript segments.

        Returns list of entity info dicts for matched entities.
        """
        entity_map = self._load_entity_map()
        if not entity_map:
            return []

        all_text = " ".join(seg.text for seg in segments).lower()

        found: dict[str, dict] = {}  # entity name → info (deduplicated)
        for keyword, info in entity_map.items():
            if re.search(r"\b" + re.escape(keyword) + r"\b", all_text):
                found[info["name"]] = info

        return list(found.values())

    def update_entity_histories(
        self,
        meeting: MeetingInfo,
        segments: list[TranscriptSegment | SpeakerSegment],
    ) -> list[str]:
        """Append meeting reference to each detected entity's history file.

        This is keyword-based (no LLM needed) and runs immediately after transcription.
        Returns list of entity names that were updated.
        """
        detected = self._detect_entity_slugs(segments)
        if not detected:
            return []

        date_str = meeting.started_at.strftime("%Y-%m-%d")
        time_str = meeting.started_at.strftime("%H:%M")
        duration = f"{meeting.duration_minutes:.0f}" if meeting.ended_at else "ongoing"
        transcript_ref = f"Operations/meetings/transcripts/{date_str}-{meeting.slug}.md"

        entry = (
            f"\n### {date_str} — Meeting ({meeting.platform})\n"
            f"- **Time:** {time_str}\n"
            f"- **Duration:** {duration} min\n"
            f"- **Title:** {meeting.title}\n"
            f"- **Transcript:** [{date_str}-{meeting.slug}]({transcript_ref})\n"
            f"- **Source:** Auto-detected by BizBrain meeting transcriber\n"
        )

        updated = []
        for entity_info in detected:
            if not entity_info["folder"]:
                continue

            history_path = (
                self.brain_path
                / entity_info["folder"]
                / entity_info["name"]
                / "_context"
                / "history.md"
            )

            try:
                if history_path.exists():
                    existing = history_path.read_text(encoding="utf-8")
                    # Avoid duplicate entries for the same meeting
                    if transcript_ref in existing:
                        continue
                    history_path.write_text(
                        existing.rstrip() + "\n" + entry,
                        encoding="utf-8",
                    )
                else:
                    # Create the history file if the entity folder exists
                    if history_path.parent.parent.exists():
                        history_path.parent.mkdir(parents=True, exist_ok=True)
                        history_path.write_text(
                            f"# History — {entity_info['name']}\n" + entry,
                            encoding="utf-8",
                        )
                updated.append(entity_info["name"])
            except Exception:
                continue

        return updated

    def write_action_items(
        self,
        meeting: MeetingInfo,
        action_items: list[dict],
    ) -> int:
        """Route AI-extracted action items to entity files or operational todos.

        Called by the skill after Claude processes the transcript and extracts items.

        Each action_item dict should have:
            - "text": str — the action item description
            - "owner": str | None — assignee name (matched against entities)
            - "entity": str | None — related entity name

        Returns count of items written.
        """
        entity_map = self._load_entity_map()
        date_str = meeting.started_at.strftime("%Y-%m-%d")
        written = 0

        for item in action_items:
            text = item.get("text", "")
            entity_name = item.get("entity")
            target_path = None

            # Try to route to entity action-items file
            if entity_name and entity_name.lower() in entity_map:
                info = entity_map[entity_name.lower()]
                if info["folder"]:
                    target_path = (
                        self.brain_path
                        / info["folder"]
                        / info["name"]
                        / "_context"
                        / "action-items.md"
                    )

            # Fallback to operational todos
            if target_path is None:
                target_path = (
                    self.brain_path / "Operations" / "todos" / "ACTIVE-TODOS.md"
                )

            try:
                entry = f"- [ ] {text} *(from meeting {date_str}: {meeting.title})*\n"

                if target_path.exists():
                    existing = target_path.read_text(encoding="utf-8")
                    if text not in existing:  # Avoid duplicates
                        target_path.write_text(
                            existing.rstrip() + "\n" + entry,
                            encoding="utf-8",
                        )
                        written += 1
                else:
                    target_path.parent.mkdir(parents=True, exist_ok=True)
                    target_path.write_text(entry, encoding="utf-8")
                    written += 1
            except Exception:
                continue

        return written
