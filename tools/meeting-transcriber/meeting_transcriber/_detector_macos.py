"""macOS meeting detection via psutil and Quartz window APIs."""

from __future__ import annotations

import re

import psutil

from .detector_base import DetectedMeeting

# macOS process names and their meeting indicators
# (process_name_pattern, platform_id, window_title_pattern or None)
MEETING_PATTERNS: list[tuple[str, str, str | None]] = [
    # Native apps
    (r"^zoom\.us$|^zoom$", "zoom", r"zoom meeting|zoom webinar"),
    (r"^Slack$|^slack$", "slack", r"huddle|slack call"),
    (r"^Microsoft Teams$|^MSTeams$|^Teams$", "teams", r"meeting|call"),
    (r"^Discord$|^discord$", "discord", r"voice connected"),
    (r"^Webex$|^webex$|^Cisco Webex", "webex", r"meeting|webex"),
    # Browser-based meetings (macOS browser names)
    (r"^Google Chrome$|^Safari$|^Firefox$|^Brave Browser$|^Microsoft Edge$", "meet", r"meet\.google\.com"),
    (r"^Google Chrome$|^Safari$|^Firefox$|^Brave Browser$|^Microsoft Edge$", "teams-web", r"teams\.microsoft\.com.*meeting"),
    (r"^Google Chrome$|^Safari$|^Firefox$|^Brave Browser$|^Microsoft Edge$", "zoom-web", r"zoom\.us/j/"),
]

# Try to import Quartz for window title access
_QUARTZ_AVAILABLE = False
try:
    from Quartz import (
        CGWindowListCopyWindowInfo,
        kCGNullWindowID,
        kCGWindowListOptionOnScreenOnly,
    )
    _QUARTZ_AVAILABLE = True
except ImportError:
    pass


class MacOSDetector:
    """Meeting detection using macOS APIs."""

    @staticmethod
    def detect() -> DetectedMeeting | None:
        """Scan running processes for active meeting applications.

        Returns the first detected meeting, or None if no meeting is active.
        """
        for proc in psutil.process_iter(["pid", "name"]):
            try:
                name = proc.info["name"] or ""
                pid = proc.info["pid"]
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

            for proc_pattern, platform, title_pattern in MEETING_PATTERNS:
                if not re.search(proc_pattern, name, re.IGNORECASE):
                    continue

                if title_pattern:
                    window_title = _get_window_title(pid)
                    if not window_title or not re.search(title_pattern, window_title, re.IGNORECASE):
                        continue
                    return DetectedMeeting(
                        platform=platform,
                        process_name=name,
                        window_title=window_title,
                        pid=pid,
                    )
                else:
                    return DetectedMeeting(
                        platform=platform,
                        process_name=name,
                        window_title=name,
                        pid=pid,
                    )

        return None

    @staticmethod
    def is_still_active(meeting: DetectedMeeting) -> bool:
        """Check if a previously detected meeting is still running."""
        try:
            proc = psutil.Process(meeting.pid)
            return proc.is_running() and proc.status() != psutil.STATUS_ZOMBIE
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return False


def _get_window_title(pid: int) -> str:
    """Get the window title for a process via Quartz CGWindowList."""
    if not _QUARTZ_AVAILABLE:
        # Without Quartz, fall back to process name only
        try:
            proc = psutil.Process(pid)
            return proc.name()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return ""

    try:
        window_list = CGWindowListCopyWindowInfo(
            kCGWindowListOptionOnScreenOnly, kCGNullWindowID
        )
        for window in window_list:
            owner_pid = window.get("kCGWindowOwnerPID", 0)
            if owner_pid == pid:
                title = window.get("kCGWindowName", "")
                if title:
                    return title
        return ""
    except Exception:
        return ""
