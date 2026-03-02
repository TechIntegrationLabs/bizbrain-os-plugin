"""Optional speaker diarization using pyannote-audio.

Requires the `diarization` extra: pip install bizbrain-meetings[diarization]
Also requires a HuggingFace token with access to pyannote models.
"""

from __future__ import annotations

import tempfile
import wave
from pathlib import Path

import numpy as np

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
        """Run diarization on a single audio file and merge with transcript segments.

        Each transcript segment gets the speaker label from whoever spoke
        during the majority of that segment's time range.
        """
        self._load_pipeline()
        diarization = self._pipeline(str(audio_path))

        speaker_timeline = _build_speaker_timeline(diarization)
        return _merge_speakers(segments, speaker_timeline)

    def diarize_full_meeting(
        self,
        chunk_paths: list[Path],
        segments: list[TranscriptSegment],
        tmp_dir: Path | None = None,
    ) -> list[SpeakerSegment]:
        """Stitch all audio chunks and run diarization on the full meeting.

        Fixes the single-chunk diarization bug by concatenating all WAV chunks
        into one temp file, running pyannote on the complete audio, then cleaning up.
        """
        if not chunk_paths:
            return [
                SpeakerSegment(
                    start=s.start, end=s.end, text=s.text,
                    speaker="Unknown", language=s.language,
                )
                for s in segments
            ]

        # Single chunk — no stitching needed
        if len(chunk_paths) == 1:
            return self.diarize_and_merge(chunk_paths[0], segments)

        # Stitch all chunks into a single temp WAV
        self._load_pipeline()
        cleanup_tmp_dir = tmp_dir is None
        if tmp_dir is None:
            tmp_dir = Path(tempfile.mkdtemp(prefix="bizbrain-diarize-"))

        stitched_path = tmp_dir / "full_meeting.wav"
        try:
            _stitch_wav_files(chunk_paths, stitched_path)
            diarization = self._pipeline(str(stitched_path))
            speaker_timeline = _build_speaker_timeline(diarization)
            return _merge_speakers(segments, speaker_timeline)
        finally:
            # Clean up temp file
            if stitched_path.exists():
                stitched_path.unlink()
            if cleanup_tmp_dir and tmp_dir.exists():
                try:
                    tmp_dir.rmdir()
                except OSError:
                    pass

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


def _build_speaker_timeline(diarization) -> list[tuple[float, float, str]]:
    """Extract speaker timeline from pyannote diarization result."""
    timeline: list[tuple[float, float, str]] = []
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        timeline.append((turn.start, turn.end, speaker))
    return timeline


def _merge_speakers(
    segments: list[TranscriptSegment],
    speaker_timeline: list[tuple[float, float, str]],
) -> list[SpeakerSegment]:
    """Assign each transcript segment to its dominant speaker."""
    result = []
    for seg in segments:
        speaker = SpeakerDiarizer._find_dominant_speaker(
            seg.start, seg.end, speaker_timeline
        )
        result.append(SpeakerSegment(
            start=seg.start,
            end=seg.end,
            text=seg.text,
            speaker=speaker,
            language=seg.language,
        ))
    return result


def _stitch_wav_files(chunk_paths: list[Path], output_path: Path) -> None:
    """Concatenate multiple WAV files into a single file.

    All chunks must have the same sample rate, channels, and sample width.
    """
    if not chunk_paths:
        return

    # Read params from first chunk
    with wave.open(str(chunk_paths[0]), "rb") as first:
        params = first.getparams()

    with wave.open(str(output_path), "wb") as out:
        out.setparams(params)
        for chunk_path in chunk_paths:
            if not chunk_path.exists():
                continue
            with wave.open(str(chunk_path), "rb") as chunk:
                out.writeframes(chunk.readframes(chunk.getnframes()))
