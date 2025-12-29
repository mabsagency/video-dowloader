#!/usr/bin/env python3
import sys
print("Python version:", sys.version)
print("Testing yt-dlp import...")

try:
    import yt_dlp
    print("yt-dlp imported successfully")
    print("yt-dlp version:", yt_dlp.version.__version__)
except ImportError as e:
    print("Failed to import yt-dlp:", e)

print("Testing basic yt-dlp functionality...")
try:
    with yt_dlp.YoutubeDL() as ydl:
        print("YoutubeDL created successfully")
except Exception as e:
    print("Failed to create YoutubeDL:", e)