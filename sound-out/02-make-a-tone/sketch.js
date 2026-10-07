// Sound Out 02 · Make a Tone
// p5.Oscillator makes a sound from nothing, a wave many times a second.
// Hold a finger down to hear it. Left is low, right is high.

// change these
let lowest = 220;  // hertz at the left edge
let highest = 880; // hertz at the right edge, two octaves up
let volume = 0.5;  // from 0 to 1
let fade = 0.1;    // seconds to fade in and out. with 0 it clicks

let osc;             // the oscillator
let started = false; // the first finger down starts it
let pitch = 220;     // in hertz: waves each second

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  osc = new p5.Oscillator(pitch, 'sine'); // or 'triangle', 'square', 'sawtooth'
  osc.amp(0); // silent until a finger is down
  enableSoundTap('Tap to start');
}

function draw() {
  background(20);
  noStroke();
  fill(255);
  if (mouseIsPressed) {
    pitch = map(mouseX, 0, width, lowest, highest, true);
    osc.freq(pitch);
    circle(mouseX, mouseY, 80); // where the finger is
  }
  textSize(18);
  text('pitch ' + round(pitch) + ' hertz', 20, 40);
}

function mousePressed() {
  // the permission tap only turns the sound on
  if (window.soundEnabled) {
    if (!started) {
      osc.start(); // from now on it runs. amp() decides if you hear it
      started = true;
    }
    osc.amp(volume, fade); // fade in
  }
}

function mouseReleased() {
  osc.amp(0, fade); // fade out
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
