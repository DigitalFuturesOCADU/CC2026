// Sound Out 04 · Play an Instrument
// smplr plays recordings of a real marimba, one for each note. Tap a key to strike it.
// The recordings download when the page opens, so it says loading until they arrive.

// change these
let notes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5']; // one key for each, low to high

let audio = new AudioContext(); // the browser's own sound system. smplr plays through it
let marimba;     // the instrument
let struck = -1; // the key struck last. -1 is none

async function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  background(20);
  fill(255);
  textSize(18);
  text('loading', 20, 40); // draw() starts once the marimba is ready

  // smplr comes as a module, which a plain script tag cannot load, so import() loads it here
  let smplr = await import('https://cdn.jsdelivr.net/npm/smplr@1.0.0/dist/index.mjs');
  marimba = smplr.Soundfont(audio, { instrument: 'marimba' });
  await marimba.ready;            // wait for the recordings
  enableSoundTap('Tap to start'); // asked for once there is something to play
}

function draw() {
  background(20);
  noStroke();
  let w = width / notes.length;
  for (let i = 0; i < notes.length; i++) {
    fill(60);
    if (i === struck && mouseIsPressed) {
      fill(255, 200, 0); // the key under the finger
    }
    rect(i * w + 2, 80, w - 4, height - 100);
    fill(255);
    text(notes[i], i * w + 8, height - 40);
  }
  text('marimba. tap a key', 20, 40);
}

function mousePressed() {
  // the permission tap only turns the sound on
  if (window.soundEnabled) {
    // the key under the finger: left is 0, right is the last one
    struck = constrain(floor(mouseX / width * notes.length), 0, notes.length - 1);
    marimba.start({ note: notes[struck] });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
