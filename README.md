# CC2026

Example sketches for Creation & Computation (Fall 2026). p5.js 2.x with
[p5-phone](https://npuckett.github.io/p5-phone/examples/homepage/). Published with GitHub Pages.
The Experiment 2 examples are at https://digitalfuturesocadu.github.io/CC2026/, the reference
examples at https://digitalfuturesocadu.github.io/CC2026/reference/, and each folder
opens on a phone at `https://digitalfuturesocadu.github.io/CC2026/<folder>/`.

Each example is one folder with its own `index.html` and `sketch.js`. Read `sketch.js` first.
Open an example on your laptop and a QR code of it appears in the top right corner. Scan it to
open the same example on your phone.

**Do not edit inside this folder. Copy.** Copy an example folder into your own project and
change it there. Pull often: new examples arrive with every class.

**In the p5.js Web Editor.** Every example also has a copy on the course's Web Editor account,
[creationcomputation](https://editor.p5js.org/creationcomputation/sketches). The index links each
one as "web editor". Log in, open it, then File › Duplicate to make it yours. The QR code shows
there too and opens the last saved version on the phone, so save before you scan.

For instructors: `python3 webeditor/stage.py` copies the examples into `webeditor/projects/`,
then `XDG_CONFIG_HOME=~/.config/p5-candc node ../p5-webeditor-sync/bin/p5-webeditor-sync.mjs sync --batch <batch>`
pushes them (the prefix selects the creationcomputation session), and
`python3 webeditor/link_index.py` adds the links to the index.

## Experiment 2 · One Phone, More People

Eight examples in `experiment-2/`. Motion, touch and sound go in; the screen, sound and the
flashlight come out. Each one has a version for 1, 2 and 3 people sharing one phone, in
`1-person/`, `2-people/` and `3-people/`. The three are the same sketch: only `people` and
`howTo` at the top change. Open all three and compare.

| Example | In → out | How the people share it |
| --- | --- | --- |
| [01-tilt-to-draw](experiment-2/01-tilt-to-draw/) | tilt → a pen that draws | in turn, 15 seconds each, one colour each |
| [02-tilt-to-speed](experiment-2/02-tilt-to-speed/) | tilt → the speed of a loop | in turn, one voice each |
| [03-still-for-light](experiment-2/03-still-for-light/) | stillness → flashlight | together, everyone holding the phone |
| [04-hold-to-reveal](experiment-2/04-hold-to-reveal/) | touch → part of a picture | side by side, one strip each |
| [05-hold-a-note](experiment-2/05-hold-a-note/) | touch → a note | side by side, one strip each |
| [06-hands-for-light](experiment-2/06-hands-for-light/) | fingers → flashlight blinks | together, everyone touching |
| [07-hum-to-play](experiment-2/07-hum-to-play/) | sound → a GIF plays | together, humming in a relay |
| [08-quiet-for-light](experiment-2/08-quiet-for-light/) | silence → flashlight | together, everyone quiet |

The media in `experiment-2/media/` loads by its full web address, so a copied sketch runs
anywhere, the web editor included. The recording is the RAVAG interval signal (1925, public
domain). The GIFs are from the Atelier 1 GIF library.

07 and 08 listen to the room for two seconds when the microphone turns on. Stay quiet then:
anything louder than that counts as sound.

## Experiment 4 · Servo FeatherWing tests

Two laptop sketches in `experiment-4/` that drive the 8 servo channels of the Servo FeatherWing
over Web Serial (Chrome or Edge). Both talk to the same Arduino sketch, `servoWingTest` (on
Canvas), which reads one line of 8 angles (0 to 180, or -1 to let it turn freely) at 115200 baud:
`90,90,45,180,0,90,90,90`.

| Example | What it does |
| --- | --- |
| [servo-wing-test](experiment-4/servo-wing-test/) | drag the pointer on each half circle to set that servo's angle; untick Attach to let it go free |
| [servo-wing-animate](experiment-4/servo-wing-animate/) | tick a box and that servo sweeps on its own, in a wave with the others |

### Servo examples

Six examples, converted from the 2025 course to the Servo FeatherWing and p5.js 2.x. They use the
same `servoWingTest` Arduino sketch, and move the servos on headers 0 and 1. Each sends the two
angles as one line, `90,45`, and `-1` in place of an angle detaches that servo (it goes free).

| Example | What it does |
| --- | --- |
| [servo-mouse-xy](experiment-4/servo-mouse-xy/) | 1: the mouse's X sets servo 0, its Y sets servo 1 |
| [servo-wiggle](experiment-4/servo-wiggle/) | 2: the half of the canvas the mouse is on chooses which servo wiggles |
| [servo-timing](experiment-4/servo-timing/) | 3: click to set targets; each servo gets there in a set time (a Servo class) |
| [servo-wiggle-detach](experiment-4/servo-wiggle-detach/) | 4: Example 2, with the idle servo detached |
| [servo-collision](experiment-4/servo-collision/) | 5: hold the mouse over a box to wiggle its servo (p5.collide2D) |
| [servo-collision-array](experiment-4/servo-collision-array/) | 5b: four boxes in an array, a slow and a fast one for each servo |

## Reference examples

Short examples, one idea each, short enough to type. Each folder matches a Canvas page. They are
listed on their own page, [reference/](reference/), not the main index.

| Folder | Canvas page | Examples |
| --- | --- | --- |
| `p5-phone/` | p5-phone Basics | Start Here, Debug Panel, One Tap Many Permissions |
| `motion/` | Input · Motion | Tilt, Shake, How Much Movement |
| `sound-in/` | Input · Sound | Level, Clap, High and Low |
| `touch/` | Input · Touch | Where, How Many, Zones |
| `drawing/` | Output · Drawing | Shapes, Trails, Repeat |
| `images/` | Output · Images | Load and Fit, Tilt to Scale, Shake for the Next |
| `gifs/` | Output · GIFs | Play and Pause, Tilt to Frame, Speed |
| `sound-out/` | Output · Sound | Play a Recording, Make a Tone, Start a Loop, Play an Instrument, Say Something |
| `flashlight/` | Output · Flashlight | Tap for Light, Slow Blink |
| `connecting/` | Connecting Input to Output | Map, Smooth, Threshold, Fade, Combine |

Their media is in `media/`. For instructors: `tools/examples.py` lists them and writes each
folder's `index.html` and the lists on `reference/index.html`; `tools/STYLE.md` is how they are written.
