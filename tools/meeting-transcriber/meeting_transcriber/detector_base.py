"""Shared types for meeting detection across platforms."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class DetectedMeeting:
    """A detected meeting process."""

    platform: str
    process_name: str
    window_title: str
    pid: int
