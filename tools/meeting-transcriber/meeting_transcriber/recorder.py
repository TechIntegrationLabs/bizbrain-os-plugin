"""Platform-dispatching audio recorder — routes to WASAPI (Windows) or BlackHole (macOS)."""

from __future__ import annotations

import platform

_system = platform.system()

if _system == "Darwin":
    from ._recorder_macos import BlackHoleRecorder as LoopbackRecorder
elif _system == "Windows":
    from ._recorder_windows import WASAPILoopbackRecorder as LoopbackRecorder
else:
    class LoopbackRecorder:  # type: ignore[no-redef]
        """Stub for unsupported platforms — raises at runtime, not import time."""

        def __init__(self, *args, **kwargs):
            raise RuntimeError(
                f"Meeting recording is not supported on {_system}. "
                "Supported platforms: Windows (WASAPI), macOS (BlackHole)."
            )

__all__ = ["LoopbackRecorder"]
