"""Platform-dispatching meeting detector — routes to Windows or macOS implementation."""

from __future__ import annotations

import platform

from .detector_base import DetectedMeeting

_system = platform.system()

if _system == "Darwin":
    from ._detector_macos import MacOSDetector as _Detector
elif _system == "Windows":
    from ._detector_windows import WindowsDetector as _Detector
else:
    _Detector = None


def detect_meeting() -> DetectedMeeting | None:
    """Scan running processes for active meeting applications."""
    if _Detector is None:
        return None
    return _Detector.detect()


def is_meeting_still_active(meeting: DetectedMeeting) -> bool:
    """Check if a previously detected meeting is still running."""
    if _Detector is None:
        return False
    return _Detector.is_still_active(meeting)


__all__ = ["DetectedMeeting", "detect_meeting", "is_meeting_still_active"]
