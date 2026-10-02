#!/usr/bin/env python3
"""The reference examples: one list, two outputs.

Each example is a folder with a hand-written sketch.js. This script writes the
folder's index.html (so every example loads the same libraries the same way)
and the reference sections of the main index.html, between the
<!-- REFERENCE:START --> and <!-- REFERENCE:END --> markers.

    python3 tools/examples.py

Then stage and sync the Web Editor copies (see README.md) and run
python3 webeditor/link_index.py to add the "web editor" links.
"""
import html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

P5 = "https://cdn.jsdelivr.net/npm/p5@2.2.3/lib/p5.js"
P5_SOUND = "https://cdn.jsdelivr.net/npm/p5.sound@0.3.0/dist/p5.sound.min.js"
TONE = "https://cdn.jsdelivr.net/npm/tone@15.1.22/build/Tone.js"
P5_PHONE = "https://cdn.jsdelivr.net/npm/p5-phone@1.15.0/dist/p5-phone.min.js"

# section id, heading, one line under the heading
SECTIONS = [
    ("p5-phone", "Phone Basics · p5-phone",
     "The pattern every phone sketch uses: lock the gestures, ask on a tap, check the flag, then read."),
    ("motion", "Input · Motion",
     "Tilt, shake and movement. The values are p5.js's own: rotationX, accelerationX, deviceShaken()."),
    ("sound-in", "Input · Sound",
     "The microphone: how loud, when it gets loud, and how high or low."),
    ("touch", "Input · Touch",
     "Where the fingers are, how many there are, and which part of the screen they hold."),
    ("drawing", "Output · Drawing",
     "Shapes, trails and repeats, drawn on the screen."),
    ("images", "Output · Images",
     "Load an image, fit it to the screen, and change it with input."),
    ("gifs", "Output · GIFs",
     "A GIF is an image with frames. Play it, pick a frame, change its speed."),
    ("sound-out", "Output · Sound",
     "One example for each way of making sound: a recording, a tone, a loop, an instrument, a voice."),
    ("flashlight", "Output · Flashlight",
     "The camera's light, switched by the sketch."),
    ("connecting", "Connecting Input to Output",
     "The small moves between a sensor and an output: map, smooth, threshold, fade, combine."),
]

# folder, title (also the Web Editor name), extra libraries, one line for the index
EXAMPLES = [
    ("p5-phone/01-start-here", "p5-phone 01 · Start Here", [],
     "The blank phone sketch. Lock the gestures, ask on a tap, wait for the flag."),
    ("p5-phone/02-debug-panel", "p5-phone 02 · Debug Panel", [],
     "A phone has no console. showDebug() puts one on the screen."),
    ("p5-phone/03-one-tap-many-permissions", "p5-phone 03 · One Tap, Many Permissions", ["sound"],
     "Motion, microphone and flashlight from one tap, then a check of each flag."),

    ("motion/01-tilt", "Motion 01 · Tilt", [],
     "rotationX and rotationY move a circle."),
    ("motion/02-shake", "Motion 02 · Shake", [],
     "deviceShaken() is an event. Each shake picks a new colour and adds one to a count."),
    ("motion/03-how-much-movement", "Motion 03 · How Much Movement", [],
     "Acceleration, added up and smoothed: how much the phone is moving."),

    ("sound-in/01-level", "Sound In 01 · Level", ["sound"],
     "How loud it is, from 0 to 1, sets the size of a circle."),
    ("sound-in/02-clap", "Sound In 02 · Clap", ["sound"],
     "A loud moment is an event. Each clap counts once."),
    ("sound-in/03-high-and-low", "Sound In 03 · High and Low", ["sound"],
     "The FFT splits sound into bands. Low and high each get a bar."),

    ("touch/01-where", "Touch 01 · Where", [],
     "mouseX and mouseY follow a finger. mouseIsPressed says if one is down."),
    ("touch/02-how-many", "Touch 02 · How Many", [],
     "touches holds every finger on the screen. Count them, draw them. Phone only: the mouse is not a touch."),
    ("touch/03-zones", "Touch 03 · Zones", [],
     "The screen in three parts. Each part lights while a finger holds it. Phone only."),

    ("drawing/01-shapes", "Drawing 01 · Shapes", [],
     "background, fill, circle, rect, line and text, redrawn every frame."),
    ("drawing/02-trails", "Drawing 02 · Trails", [],
     "Tilt steers a pen. A see-through background leaves a fading trail."),
    ("drawing/03-repeat", "Drawing 03 · Repeat", [],
     "A for loop draws a ring of shapes. A finger sets how many."),

    ("images/01-load-and-fit", "Images 01 · Load and Fit", [],
     "await loadImage(), then image() as big as fits the screen."),
    ("images/02-tilt-to-scale", "Images 02 · Tilt to Scale", [],
     "Tipping the phone forward and back scales the image."),
    ("images/03-shake-for-the-next", "Images 03 · Shake for the Next", [],
     "A list of images. Each shake shows the next one."),

    ("gifs/01-play-and-pause", "GIFs 01 · Play and Pause", [],
     "The GIF plays while a finger is down and pauses when it lifts."),
    ("gifs/02-tilt-to-frame", "GIFs 02 · Tilt to Frame", [],
     "Tilt picks the frame with setFrame(). The GIF never plays on its own."),
    ("gifs/03-speed", "GIFs 03 · Speed", [],
     "delay() sets the time between frames. A finger sets the speed."),

    ("sound-out/01-play-a-recording", "Sound Out 01 · Play a Recording", ["sound"],
     "p5.sound. A quick tap starts and stops a loop. Hold and slide to bend its speed."),
    ("sound-out/02-make-a-tone", "Sound Out 02 · Make a Tone", ["sound"],
     "p5.Oscillator. A tone sounds while a finger is down. Left to right is low to high."),
    ("sound-out/03-start-a-loop", "Sound Out 03 · Start a Loop", ["tone"],
     "Tone.js. A pattern of notes on Tone.js's own clock. A tap starts and stops it. A finger sets the tempo."),
    ("sound-out/04-play-an-instrument", "Sound Out 04 · Play an Instrument", [],
     "smplr. A marimba made of recordings. The screen is the keys."),
    ("sound-out/05-say-something", "Sound Out 05 · Say Something", [],
     "The browser's own voice. A tap says the next word."),

    ("flashlight/01-tap-for-light", "Flashlight 01 · Tap for Light", [],
     "A tap switches the flashlight on and off."),
    ("flashlight/02-slow-blink", "Flashlight 02 · Slow Blink", [],
     "A timer blinks the light. Tilt sets how slowly, never faster than 300 ms."),

    ("connecting/01-map", "Connecting 01 · Map", [],
     "map() turns tilt in degrees into screen brightness."),
    ("connecting/02-smooth", "Connecting 02 · Smooth", [],
     "lerp() smooths a jumpy reading. Raw and smoothed side by side."),
    ("connecting/03-threshold", "Connecting 03 · Threshold", [],
     "A stream becomes an event: tipping past a line counts once."),
    ("connecting/04-fade", "Connecting 04 · Fade", [],
     "An event starts a clock. The light fades over three seconds."),
    ("connecting/05-combine", "Connecting 05 · Combine", [],
     "Two inputs at once: the light needs a finger down and the phone tipped."),
]

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #141414;
    }}
    canvas {{
      touch-action: none; /* a finger on the canvas never scrolls the page */
    }}
  </style>

{scripts}

  <!-- on a laptop, a QR code of this page, to open it on a phone. only on the https examples site -->
  <script>
    if (location.protocol === 'https:' && window.self === window.top) {{
      addEventListener('load', function () {{ showDesktopQr(); }});
    }}
  </script>
</head>
<body>
  <script src="sketch.js"></script>
</body>
</html>
"""


GUARD = """  <!-- a laptop has no tilt sensor but still sends one empty reading. ignore it, so rotationX stays a number -->
  <script>
    window.addEventListener('deviceorientation', function (e) {
      if (e.beta === null) e.stopImmediatePropagation();
    }, true);
  </script>
"""


def scripts_for(libs):
    lines = [GUARD, "  <!-- p5.js 2.x -->", f'  <script src="{P5}"></script>']
    if "sound" in libs:
        lines += ["", "  <!-- p5.sound: the microphone, recordings and tones -->",
                  f'  <script src="{P5_SOUND}"></script>']
    if "tone" in libs:
        lines += ["", "  <!-- Tone.js: loops and synths on their own clock -->",
                  f'  <script src="{TONE}"></script>']
    lines += ["", "  <!-- p5-phone: the permission tap, the gesture lock, the sensors and the flashlight -->",
              f'  <script src="{P5_PHONE}"></script>']
    return "\n".join(lines)


def write_pages():
    for folder, title, libs, _ in EXAMPLES:
        target = ROOT / folder
        target.mkdir(parents=True, exist_ok=True)
        page = PAGE.format(title=html.escape(title, quote=False), scripts=scripts_for(libs))
        (target / "index.html").write_text(page, encoding="utf-8")


def write_index():
    code_base = "https://github.com/DigitalFuturesOCADU/CC2026/tree/main/"
    parts = ["<!-- REFERENCE:START -->",
             "    <!-- Written by tools/examples.py. Edit the lists there, not here. -->"]
    for section, heading, intro in SECTIONS:
        items = [e for e in EXAMPLES if e[0].split("/")[0] == section]
        if not items:
            continue
        parts.append(f'    <h2 id="{section}">{html.escape(heading)}</h2>')
        parts.append(f'    <p class="intro">{html.escape(intro)}</p>')
        parts.append("    <ul>")
        for folder, title, _, what in items:
            name = title.split(" · ", 1)[1]
            number = folder.split("/")[1][:2]
            parts.append(
                f'      <li><a href="{folder}/">{number} {html.escape(name)}</a> '
                f'<a class="code" href="{code_base}{folder}">code</a>'
                f'<span class="what">{html.escape(what)}</span></li>'
            )
        parts.append("    </ul>")
        parts.append("")
    parts.append("    <!-- REFERENCE:END -->")
    block = "\n".join(parts)

    index_path = ROOT / "index.html"
    page = index_path.read_text(encoding="utf-8")
    start, end = "<!-- REFERENCE:START -->", "<!-- REFERENCE:END -->"
    if start in page:
        before = page.split(start)[0]
        after = page.split(end)[1]
        page = before + block + after
    else:
        page = page.replace("  </main>", "    " + block + "\n\n  </main>")
    index_path.write_text(page, encoding="utf-8")


if __name__ == "__main__":
    write_pages()
    write_index()
    print(f"{len(EXAMPLES)} examples, {len(SECTIONS)} sections")
