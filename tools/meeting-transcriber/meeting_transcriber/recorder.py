"""WASAPI loopback audio recorder — captures system audio output."""

from __future__ import annotations

import struct
import threading
import time
import wave
from pathlib import Path

import numpy as np

SAMPLE_RATE = 16000  # 16kHz mono for Whisper
CHANNELS = 1
CHUNK_DURATION_SEC = 300  # 5 minutes per chunk


class LoopbackRecorder:
    """Records system audio via WASAPI loopback into WAV chunks.

    Uses pyaudiowpatch to capture whatever is playing through the system's
    default output device — platform-agnostic meeting capture.
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
        import pyaudiowpatch as pyaudio

        pa = pyaudio.PyAudio()
        try:
            device = self._find_loopback_device(pa)
            if device is None:
                return

            chunk_idx = 0
            while self._recording:
                chunk_path = self.output_dir / f"chunk_{chunk_idx:04d}.wav"
                self._record_chunk(pa, device, chunk_path)
                with self._lock:
                    self._chunks.append(chunk_path)
                chunk_idx += 1
        finally:
            pa.terminate()

    def _record_chunk(self, pa, device: dict, output_path: Path) -> None:
        """Record a single chunk of audio to a WAV file."""
        import pyaudiowpatch as pyaudio

        device_rate = int(device["defaultSampleRate"])
        device_channels = min(device["maxInputChannels"], 2)
        frames_per_buffer = 512

        stream = pa.open(
            format=pyaudio.paInt16,
            channels=device_channels,
            rate=device_rate,
            input=True,
            input_device_index=device["index"],
            frames_per_buffer=frames_per_buffer,
        )

        frames: list[bytes] = []
        total_frames = 0
        target_frames = device_rate * self.chunk_seconds

        try:
            while self._recording and total_frames < target_frames:
                data = stream.read(frames_per_buffer, exception_on_overflow=False)
                frames.append(data)
                total_frames += frames_per_buffer
        finally:
            stream.stop_stream()
            stream.close()

        if not frames:
            return

        # Convert to 16kHz mono
        raw = b"".join(frames)
        samples = np.frombuffer(raw, dtype=np.int16)

        # Downmix to mono if stereo
        if device_channels == 2:
            samples = samples.reshape(-1, 2).mean(axis=1).astype(np.int16)

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

    def _find_loopback_device(self, pa) -> dict | None:
        """Find the WASAPI loopback device for the default output."""
        try:
            wasapi_info = pa.get_host_api_info_by_type(
                __import__("pyaudiowpatch").paWASAPI
            )
        except OSError:
            return None

        default_output = pa.get_device_info_by_index(wasapi_info["defaultOutputDevice"])

        # Find the loopback device matching the default output
        for i in range(pa.get_device_count()):
            device = pa.get_device_info_by_index(i)
            if (
                device.get("isLoopbackDevice", False)
                and device["name"].startswith(default_output["name"].split(" (")[0])
            ):
                return device

        # Fallback: any loopback device
        for i in range(pa.get_device_count()):
            device = pa.get_device_info_by_index(i)
            if device.get("isLoopbackDevice", False):
                return device

        return None
