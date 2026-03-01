"""Meeting detection via process and window title monitoring."""

from __future__ import annotations

import re
from dataclasses import dataclass

import psutil


# Patterns: (process_name_pattern, platform_id, window_title_pattern or None)
MEETING_PATTERNS: list[tuple[str, str, str | None]] = [
    (r"zoom\.exe", "zoom", r"zoom meeting|zoom webinar"),
    (r"slack\.exe", "slack", r"huddle|slack call"),
    (r"teams\.exe", "teams", r"meeting|call"),
    (r"discord\.exe", "discord", r"voice connected"),
    (r"webex\.exe", "webex", r"meeting|webex"),
    # Browser-based meetings detected by window title
    (r"chrome\.exe|msedge\.exe|firefox\.exe|brave\.exe", "meet", r"meet\.google\.com"),
    (r"chrome\.exe|msedge\.exe|firefox\.exe|brave\.exe", "teams-web", r"teams\.microsoft\.com.*meeting"),
    (r"chrome\.exe|msedge\.exe|firefox\.exe|brave\.exe", "zoom-web", r"zoom\.us/j/"),
]


@dataclass
class DetectedMeeting:
    """A detected meeting process."""

    platform: str
    process_name: str
    window_title: str
    pid: int


def detect_meeting() -> DetectedMeeting | None:
    """Scan running processes for active meeting applications.

    Returns the first detected meeting, or None if no meeting is active.
    Checks both native apps and browser-based meetings.
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

            # For browser processes, we need to check window titles
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
                # Native app — process running is enough
                return DetectedMeeting(
                    platform=platform,
                    process_name=name,
                    window_title=name,
                    pid=pid,
                )

    return None


def is_meeting_still_active(meeting: DetectedMeeting) -> bool:
    """Check if a previously detected meeting is still running."""
    try:
        proc = psutil.Process(meeting.pid)
        return proc.is_running() and proc.status() != psutil.STATUS_ZOMBIE
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return False


def _get_window_title(pid: int) -> str:
    """Get the window title for a process. Windows-specific via ctypes."""
    try:
        import ctypes
        from ctypes import wintypes

        user32 = ctypes.windll.user32
        titles: list[str] = []

        def enum_callback(hwnd, _):
            if not user32.IsWindowVisible(hwnd):
                return True
            window_pid = wintypes.DWORD()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(window_pid))
            if window_pid.value == pid:
                length = user32.GetWindowTextLengthW(hwnd)
                if length > 0:
                    buf = ctypes.create_unicode_buffer(length + 1)
                    user32.GetWindowTextW(hwnd, buf, length + 1)
                    titles.append(buf.value)
            return True

        WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, wintypes.LPARAM)
        user32.EnumWindows(WNDENUMPROC(enum_callback), 0)
        return titles[0] if titles else ""
    except Exception:
        return ""
