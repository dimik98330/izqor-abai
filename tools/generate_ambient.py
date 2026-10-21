"""Create an original, quiet instrumental bed. No recordings or samples are used."""
import math
import pathlib
import struct
import subprocess
import wave
ROOT = pathlib.Path(__file__).resolve().parents[1]
RATE, SECONDS = 22050, 48
out = ROOT / ".research" / "audio"
out.mkdir(parents=True, exist_ok=True)
wav = out / "steppe-ambient.wav"
notes = [146.832, 220.0, 261.626, 293.665, 349.228, 440.0]
events = [(i * 2.0, notes[[0, 1, 3, 2, 4, 1, 3, 5, 2, 1, 4, 3][i % 12]]) for i in range(24)]
frames = bytearray()
for i in range(RATE * SECONDS):
    t = i / RATE
    fade = min(1.0, t / 3, (SECONDS - t) / 4)
    pad = sum(math.sin(math.tau * f * t) * (.025 if j < 2 else .012)
              for j, f in enumerate([73.416, 110.0, 146.832, 220.0]))
    pluck = 0.0
    for start, f in events:
        dt = t - start
        if 0 <= dt < 7:
            env = (1 - math.exp(-dt * 30)) * math.exp(-dt / 1.8)
            pluck += env * (.065 * math.sin(math.tau * f * dt)
                            + .018 * math.sin(math.tau * f * 2 * dt)
                            + .007 * math.sin(math.tau * f * 3 * dt))
    value = (pad + pluck) * max(0, fade)
    left = int(max(-.8, min(.8, value * (.95 + .05 * math.sin(t * .3)))) * 32767)
    right = int(max(-.8, min(.8, value * (.95 - .05 * math.sin(t * .3)))) * 32767)
    frames.extend(struct.pack("<hh", left, right))
with wave.open(str(wav), "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(RATE)
    f.writeframes(frames)
target = ROOT / "public" / "media" / "steppe-ambient.mp3"
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav),
                "-codec:a", "libmp3lame", "-b:a", "128k", str(target)], check=True)
print(f"Original audio: {target}; {SECONDS}s; {target.stat().st_size} bytes")
