"""BizBrain OS — Local Meeting Transcription.

Captures system audio via platform-native loopback (WASAPI on Windows,
BlackHole on macOS), transcribes with faster-whisper, and saves brain-compatible
markdown transcripts with automatic intake integration, entity detection, and
AI summary preparation. Works with Zoom, Meet, Teams, Slack, Discord, or any
audio source.
"""

__version__ = "0.2.0"
