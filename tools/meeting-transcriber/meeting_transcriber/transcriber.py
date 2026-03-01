"""Whisper-based transcription using faster-whisper (CTranslate2 backend)."""

from __future__ import annotations

from pathlib import Path

from .models import TranscriptSegment


# Model sizes in order of speed → accuracy
MODEL_SIZES = ("tiny", "base", "small", "medium", "large-v3")
DEFAULT_MODEL = "base"


class WhisperTranscriber:
    """Transcribes WAV audio files using faster-whisper.

    Models are downloaded on first use (~75MB for base, ~3GB for large-v3).
    VAD filtering is enabled by default to skip silence.
    """

    def __init__(self, model_size: str = DEFAULT_MODEL, device: str = "auto"):
        if model_size not in MODEL_SIZES:
            raise ValueError(f"Invalid model size: {model_size}. Choose from {MODEL_SIZES}")
        self.model_size = model_size
        self.device = device
        self._model = None

    def _load_model(self):
        if self._model is not None:
            return
        from faster_whisper import WhisperModel

        compute_type = "int8" if self.device == "cpu" else "auto"
        self._model = WhisperModel(
            self.model_size,
            device=self.device,
            compute_type=compute_type,
        )

    def transcribe(self, audio_path: Path, language: str | None = None) -> list[TranscriptSegment]:
        """Transcribe a WAV file and return segments.

        Args:
            audio_path: Path to 16kHz mono WAV file.
            language: ISO language code (e.g., "en"). None for auto-detect.

        Returns:
            List of TranscriptSegment with timestamps and text.
        """
        self._load_model()

        segments, info = self._model.transcribe(
            str(audio_path),
            language=language,
            vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 500},
            beam_size=5,
            word_timestamps=False,
        )

        result = []
        for seg in segments:
            text = seg.text.strip()
            if not text:
                continue
            result.append(TranscriptSegment(
                start=seg.start,
                end=seg.end,
                text=text,
                language=info.language,
                probability=seg.avg_logprob,
            ))

        return result

    def transcribe_chunks(
        self,
        chunk_paths: list[Path],
        language: str | None = None,
    ) -> list[TranscriptSegment]:
        """Transcribe multiple chunks with cumulative timestamps.

        Adjusts timestamps so they're continuous across all chunks.
        """
        self._load_model()
        all_segments: list[TranscriptSegment] = []
        time_offset = 0.0

        for chunk_path in sorted(chunk_paths):
            if not chunk_path.exists():
                continue

            # Get chunk duration for offset calculation
            chunk_duration = self._get_wav_duration(chunk_path)
            segments = self.transcribe(chunk_path, language=language)

            for seg in segments:
                all_segments.append(TranscriptSegment(
                    start=seg.start + time_offset,
                    end=seg.end + time_offset,
                    text=seg.text,
                    language=seg.language,
                    probability=seg.probability,
                ))

            time_offset += chunk_duration

        return all_segments

    @staticmethod
    def _get_wav_duration(path: Path) -> float:
        import wave
        with wave.open(str(path), "rb") as wf:
            return wf.getnframes() / wf.getframerate()
