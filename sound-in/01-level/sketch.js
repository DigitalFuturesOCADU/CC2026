// Sound In 01 · Level
// How loud it is, from 0 to 1, sets the size of the circle.
// Hum, talk, clap. Phones hear quietly, so the level is turned up by boost.

// change these
let boost = 5; // multiplies the level. raise it if the circle barely moves

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
  if (!window.micOpen) return; // true only while sound is really arriving

  mic.disconnect();   // unplug the microphone from the speaker...
  mic.connect(meter); // ...and plug it into the meter
  let level = constrain(meter.getLevel() * boost, 0, 1);

  noStroke();
  fill(255);
  circle(width / 2, height / 2, 40 + level * width);

  // the raw value
  textSize(18);
  text('level ' + nf(level, 1, 2), 20, 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
