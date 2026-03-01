"""Optional speaker diarization using pyannote-audio.

Requires the `diarization` extra: pip install bizbrain-meetings[diarization]
Also requires a HuggingFace token with access to pyannote models.
"""

from __future__ import annotations

from pathlib import Path

from .models import TranscriptSegment, SpeakerSegment

DIARIZATION_AVAILABLE = False
try:
    from pyannote.audio import Pipeline
    DIARIZATION_AVAILABLE = True
except ImportError:
    pass


class SpeakerDiarizer:
    """Identifies speakers in audio and merges with transcript segments.

    Uses pyannote-audio's pretrained speaker diarization pipeline.
    Requires a HuggingFace auth token with access to pyannote/speaker-diarization-3.1.
    """

    def __init__(self, hf_token: str | None = None):
        if not DIARIZATION_AVAILABLE:
            raise RuntimeError(
                "Speaker diarization requires pyannote-audio. "
                "Install with: uv pip install bizbrain-meetings[diarization]"
            )
        self.hf_token = hf_token
        self._pipeline = None

    def _load_pipeline(self):
        if self._pipeline is not None:
            return
        self._pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=self.hf_token,
        )

    def diarize_and_merge(
        self,
        audio_path: Path,
        segments: list[TranscriptSegment],
    ) -> list[SpeakerSegment]:
        """Run diarization on audio and merge speaker labels with transcript segments.

        Each transcript segment gets the speaker label from whoever spoke
        during the majority of that segment's time range.
        """
        self._load_pipeline()
        diarization = self._pipeline(str(audio_path))

        # Build speaker timeline: list of (start, end, speaker)
        speaker_timeline: list[tuple[float, float, str]] = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            speaker_timeline.append((turn.start, turn.end, speaker))

        # Merge: assign each transcript segment to the dominant speaker
        result = []
        for seg in segments:
            speaker = self._find_dominant_speaker(seg.start, seg.end, speaker_timeline)
            result.append(SpeakerSegment(
                start=seg.start,
                end=seg.end,
                text=seg.text,
                speaker=speaker,
                language=seg.language,
            ))

        return result

    @staticmethod
    def _find_dominant_speaker(
        start: float,
        end: float,
        timeline: list[tuple[float, float, str]],
    ) -> str:
        """Find which speaker talked most during [start, end]."""
        overlap: dict[str, float] = {}
        for t_start, t_end, speaker in timeline:
            o_start = max(start, t_start)
            o_end = min(end, t_end)
            if o_start < o_end:
                overlap[speaker] = overlap.get(speaker, 0) + (o_end - o_start)

        if not overlap:
            return "Unknown"
        return max(overlap, key=overlap.get)
