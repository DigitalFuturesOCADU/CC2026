# CC2026

Example sketches for Creation & Computation (Fall 2026). p5.js 2.x with
[p5-phone](https://npuckett.github.io/p5-phone/examples/homepage/). Published with GitHub Pages.
The index of every example is https://digitalfuturesocadu.github.io/CC2026/ and each folder
opens on a phone at `https://digitalfuturesocadu.github.io/CC2026/<folder>/`.

Each example is one folder with its own `index.html` and `sketch.js`. Read `sketch.js` first.
Open an example on your laptop and a QR code of it appears in the top right corner. Scan it to
open the same example on your phone.

**Do not edit inside this folder. Copy.** Copy an example folder into your own project and
change it there. Pull often: new examples arrive with every class.

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
