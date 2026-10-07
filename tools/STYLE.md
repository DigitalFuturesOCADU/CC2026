# How the reference examples are written

The examples in the topic folders (`p5-phone/`, `motion/`, `sound-in/`, `touch/`, `drawing/`,
`images/`, `gifs/`, `sound-out/`, `flashlight/`, `connecting/`) are for graduate students in
Creation & Computation. In Experiment 2 they **type every line themselves**: no copy and paste,
no AI in the editor. So an example is only good if it is short enough to type and plain enough
to read in one go.

## The rules

- **One idea per example.** The title names the idea. If a second idea creeps in, cut it.
- **Short.** Aim for 20 to 40 lines in `sketch.js`, comments included. Never more than 55.
- **p5.js 2.x.** `async function setup()` with `await loadImage()` / `await loadSound()`.
  Never `preload()`. Use `mousePressed()`, `mouseDragged()`, `mouseReleased()`, `mouseX`,
  `mouseY` and `mouseIsPressed` (they cover a finger too). Never `touchStarted()` and the
  other p5 1.x touch callbacks. `touches` holds fingers only, never the mouse, so a sketch
  built on `touches` needs a phone. With several fingers, test `touches.length > 0`:
  `mouseIsPressed` goes false as soon as any one finger lifts.
- **p5-phone 1.15.3.**
  - `lockGestures()` in every `setup()`.
  - Sketches that use hardware make exactly one `enable…Tap('Tap to start')` call (touch,
    drawing, images, GIFs and speech need none): `enableGyroTap`, `enableMicTap`,
    `enableSoundTap`, `enableTorchTap`, or `enablePermissionsTap([...], 'Tap to start')` when a
    sketch needs more than one. Motion is `enableGyroTap`, the name in the p5-phone README.
    `enableSensorTap` is an alias for the same function: don't use it.
  - Read hardware only behind its flag: `window.sensorsEnabled`, `window.micOpen` (not
    `micEnabled`), `window.torchEnabled`. The shape is a positive if around the code that
    reads it, `if (window.sensorsEnabled) { … }`, never the flipped early return
    `if (!window.sensorsEnabled) return;`.
  - Motion values are p5.js's own: `rotationX/Y/Z`, `accelerationX/Y/Z`, `pRotationX`,
    `deviceShaken()`, `deviceMoved()`, `setShakeThreshold()`. There is no `rotationRate*`.
  - **`rotationX/Y/Z` follow `angleMode()`, which is radians by default.** Every sketch that
    reads rotation calls `angleMode(DEGREES);` in `setup()`, right after `lockGestures()`,
    with the comment `// tilt in degrees. p5.js uses radians unless you say so`. With it on,
    `cos()`, `sin()` and `rotate()` take degrees too.
- **No QR code in sketch.js.** `index.html` shows it (written by `tools/examples.py`).
- **Never write index.html by hand.** Add the example to `EXAMPLES` in `tools/examples.py`
  and run it.
- **Input examples show the raw value** as one line of text on the screen, so students see
  the numbers they are working with.
- **Tunable numbers go at the top** under `// change these`, one per line, each with a short
  comment.
- **Plain JavaScript:** `let` (not `const` or `var`), named `function`s, no classes, no arrow
  functions, no template literals. `if`, `for`, arrays, `map()`, `constrain()`, `lerp()`,
  `millis()`, `random()` are all fine.
- **Names that cannot clash with p5.** p5.js 2 global mode breaks when a sketch function or
  variable reuses a p5 name: `step`, `scale`, `color`, `image`, `text`, `point`, `line`,
  `smooth`, `brightness`. Use `level`, `amount`, `picture`, `gifImage`, `count`, `zone`, `glow`.
- **Comments:** short, plain, lower case, like the Experiment 2 intro examples. Say what a
  line is for. No em dashes. Line 1 is `// <Title>`, then one to three lines on what the
  sketch does and what to try.
- **Text on screen:** `textSize(18)`, white or light grey on a dark background, inside the
  screen at 375 px wide (an iPhone). Keep it to a line or two. On a bright or changing
  background, or over a picture, put it on a dark band: `fill(0); rect(0, 0, width, 60);`
  then the text at y 38.
- **Trails:** a see-through background over black, `background(0, fade)`. Over grey
  (`background(20, 20)`) 8-bit rounding leaves permanent ghost lines.
- **Media by full address.** Images, GIFs and sounds load from
  `https://digitalfuturesocadu.github.io/CC2026/media/...` (or the `experiment-2/media/`
  files), so the Web Editor copy runs with nothing uploaded.
- **Always** end with
  ```js
  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }
  ```

## Laptops and the tilt sensor

A laptop has no tilt sensor, but desktop Chrome still sends one orientation reading with
empty values. With `angleMode(DEGREES)` that makes `rotationX` `null`, and every `map()` or
`round()` on it logs a p5.js warning, hundreds a second. Every `index.html` (written by
`tools/examples.py`, the intro generator, and the CC2026 starter) ignores that reading, so
`rotationX` stays 0 on a laptop. Do not add null checks to `sketch.js`.

## GIFs

`pause()` stops the picture but not the GIF's clock, so a later `play()` jumps ahead. To
resume where it stopped, call `gifImage.setFrame(gifImage.getCurrentFrame())` just before
`play()`. `delay(ms)` with no frame number replaces every frame's own timing for good, and
anything under about 33 ms runs at about 33 ms (one draw frame at 30 frames a second).

## The microphone (sound-in examples)

p5.sound 0.3.0 plays the microphone out of the speaker unless it is unplugged, and
`mic.getLevel()` does not exist. Use this shape, as in `sound-in/01-level`:

```js
let mic;   // p5-phone looks for a variable with exactly this name
let meter; // measures how loud the microphone is

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  mic = new p5.AudioIn();
  meter = new p5.Amplitude();
  enableMicTap('Tap to start');
}

function draw() {
  background(20);
  // micOpen is true only while sound is really arriving
  if (window.micOpen) {
    mic.disconnect();   // unplug the microphone from the speaker...
    mic.connect(meter); // ...and plug it into the meter
    let level = meter.getLevel();
  }
}
```

## Making sound (sound-out examples)

Phones start sound only inside a tap. `enableSoundTap('Tap to start')` starts p5.sound, Tone.js
and any `new AudioContext()` the sketch made, then calls `userSetupComplete()`. Do not add
`userStartAudio()` or a first-tap listener of your own. On an iPhone the first spoken sentence
must come from a tap.

- **The permission tap is also a press.** On a laptop its release can reach `mouseReleased()`
  with `soundEnabled` already true. Record what you need in `mousePressed()` only when the
  flag is true, and act on the release only if that press was recorded.
- **Tap or hold:** when a sketch both toggles and drags, a quick tap (under 300 ms) toggles
  and a hold only drags. Toggling on the press would stop the sound whenever a drag starts.
- **p5.sound 0.3.0:** `loop()` only turns repeating on; `play()` plays. Use `stop()` and
  `play()`, not `pause()`: `rate()` after `pause()` quietly resumes playback. Everything is
  scheduled about 0.1 s ahead, so start an oscillator on the first press, not in `setup()` or
  `userSetupComplete()`, or it blips when the sound turns on.
- **Load first, then ask.** Call `enableSoundTap()` after `await loadSound()` (or a
  sampler's `ready`), so the first tap always has something to play.
- **Decibels:** `Math.log10(0)` is minus infinity, and p5.js 2 warns on every frame that
  `map()` gets it. Floor the value first, as `sound-in/03` does.

## Testing

Every example must load with no console errors and run its `draw()` loop. Test in a browser with
simulated input before it is synced: device orientation and motion events on `window`, mouse or
pointer events on the canvas, and a fake microphone. Real phones are still the final check.
