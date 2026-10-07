// Sound In 02 · Clap
// A loud moment is an event. Clap: each clap counts once and flashes the screen.

// change these
let threshold = 0.5; // the line: how loud a clap has to be, from 0 to 1
let cooldown = 250;  // milliseconds after a clap when nothing counts
let boost = 5;       // multiplies the level. phones hear quietly

let mic;               // p5-phone looks for a variable with exactly this name
let meter;             // measures how loud the microphone is
let wasLoud = false;   // was it over the line last frame?
let clapTime = -10000; // when the last clap counted. long ago, to start
let count = 0;         // how many claps so far

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
    let level = constrain(meter.getLevel() * boost, 0, 1);

    // over the line now, not last frame, and not just after a clap: a new clap
    let loud = level > threshold;
    if (loud && !wasLoud && millis() - clapTime > cooldown) {
      count = count + 1;
      clapTime = millis();
    }
    wasLoud = loud;

    // the flash: a bright screen for a moment after each clap
    if (millis() - clapTime < 100) {
      background(255, 200, 0);
    }

    noStroke();
    fill(255);
    rect(0, height - 40, level * width, 40);     // the level, as a bar
    rect(threshold * width, height - 60, 4, 60); // the line
    textSize(18);
    text('level ' + nf(level, 1, 2) + '   claps ' + count, 20, 40);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
