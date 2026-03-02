"""BlackHole virtual audio recorder — captures system audio on macOS."""

from __future__ import annotations

import threading
import wave
from pathlib import Path

import numpy as np
import sounddevice as sd

SAMPLE_RATE = 16000  # 16kHz mono for Whisper
CHANNELS = 1
CHUNK_DURATION_SEC = 300  # 5 minutes per chunk


def _find_blackhole_device() -> int | None:
    """Find the BlackHole virtual audio device index."""
    devices = sd.query_devices()
    for i, dev in enumerate(devices):
        name = dev["name"].lower()
        if "blackhole" in name and dev["max_input_channels"] > 0:
            return i
    return None


class BlackHoleRecorder:
    """Records system audio via BlackHole virtual audio device on macOS.

    Requires BlackHole (https://existential.audio/blackhole/) to be installed
    and configured as part of a Multi-Output Device in Audio MIDI Setup so that
    system audio is routed to both speakers and BlackHole simultaneously.
    """

    def __init__(self, output_dir: Path, chunk_seconds: int = CHUNK_DURATION_SEC):
        self.output_dir = output_dir
        self.chunk_seconds = chunk_seconds
        self._recording = False
        self._thread: threading.Thread | None = None
        self._chunks: list[Path] = []
        self._lock = threading.Lock()

    @property
    def chunks(self) -> list[Path]:
        with self._lock:
            return list(self._chunks)

    def start(self) -> None:
        """Start recording system audio in background thread."""
        if self._recording:
            return
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._recording = True
        self._thread = threading.Thread(target=self._record_loop, daemon=True)
        self._thread.start()

    def stop(self) -> list[Path]:
        """Stop recording and return list of chunk file paths."""
        self._recording = False
        if self._thread:
            self._thread.join(timeout=10)
            self._thread = None
        return self.chunks

    def _record_loop(self) -> None:
        """Main recording loop — captures audio in chunks."""
        device_idx = _find_blackhole_device()
        if device_idx is None:
            print(
                "Error: BlackHole audio device not found.\n"
                "Install BlackHole: https://existential.audio/blackhole/\n"
                "Then run: bizbrain-meetings setup"
            )
            return

        chunk_idx = 0
        while self._recording:
            chunk_path = self.output_dir / f"chunk_{chunk_idx:04d}.wav"
            self._record_chunk(device_idx, chunk_path)
            with self._lock:
                self._chunks.append(chunk_path)
            chunk_idx += 1

    def _record_chunk(self, device_idx: int, output_path: Path) -> None:
        """Record a single chunk of audio to a WAV file."""
        device_info = sd.query_devices(device_idx)
        device_rate = int(device_info["default_samplerate"])
        device_channels = min(device_info["max_input_channels"], 2)

        # Calculate total frames for this chunk
        total_samples = device_rate * self.chunk_seconds

        # Record the chunk (blocking, but we check _recording via callback)
        frames_collected: list[np.ndarray] = []
        samples_so_far = 0
        block_size = 1024

        def callback(indata, frames, time_info, status):
            nonlocal samples_so_far
            if not self._recording:
                raise sd.CallbackAbort
            frames_collected.append(indata.copy())
            samples_so_far += frames

        try:
            with sd.InputStream(
                samplerate=device_rate,
                channels=device_channels,
                dtype="int16",
                device=device_idx,
                blocksize=block_size,
                callback=callback,
            ):
                # Wait until chunk duration reached or recording stopped
                import time
                while self._recording and samples_so_far < total_samples:
                    time.sleep(0.1)
        except sd.CallbackAbort:
            pass

        if not frames_collected:
            return

        # Concatenate all captured frames
        samples = np.concatenate(frames_collected, axis=0)

        # Downmix to mono if stereo
        if device_channels > 1:
            samples = samples.mean(axis=1).astype(np.int16)
        else:
            samples = samples.flatten()

        # Resample to 16kHz if needed
        if device_rate != SAMPLE_RATE:
            num_output = int(len(samples) * SAMPLE_RATE / device_rate)
            indices = np.linspace(0, len(samples) - 1, num_output).astype(int)
            samples = samples[indices]

        # Write WAV
        with wave.open(str(output_path), "wb") as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(2)  # 16-bit
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(samples.tobytes())
