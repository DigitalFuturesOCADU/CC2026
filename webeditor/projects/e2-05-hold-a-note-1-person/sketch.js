// 05 · Hold a Note · 1 person
// Touch → sound. Side by side: the screen is split into one strip for each person.
// Each strip plays one note. Hold a finger on your strip to play it.
// Slide up for a higher note, down for a lower one.
// The 1, 2 and 3 person versions are the same sketch. Only these two lines change:
let people = 1; // how many people share the phone: 1, 2 or 3
let howTo = 'Hold a finger down to play. Slide up for higher, down for lower.';

// the notes you can slide between, low to high. a pentatonic scale,
// so any of them played together sound good together
let notes = [220, 247, 277, 330, 370, 440, 494, 554, 659, 740];

// the feel of the piece
let waveType = 'triangle'; // 'sine', 'triangle', 'sawtooth' or 'square'
let volume = 0.3;          // for each note. three notes together reach 0.9
let colours = ['#ff8c1a', '#2ab7ff', '#ff4fa3']; // one colour for each person

let voices = [];      // one oscillator for each person
let playing = [];     // is each person's note sounding?
let unlocked = false; // has the tap turned the sound on?
let started = false;  // are the oscillators running?

// p5-phone calls this once the tap has turned the sound on
function userSetupComplete() {
  unlocked = true;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();

  // on a laptop, show a QR code of this page so a phone can open it.
  // it only shows on a public https address, like the examples site.
  if (location.protocol === 'https:' && window.self === window.top) {
    showDesktopQr();
  }

  enableSoundTap('Tap to start');

  // one oscillator for each person. they run all the time, silent until a finger is down
  for (let i = 0; i < people; i++) {
    voices[i] = new p5.Oscillator(notes[0], waveType);
    voices[i].amp(0);
    playing[i] = false;
  }
}

function draw() {
  background(20);

  // the oscillators start once the tap has turned the sound on
  if (unlocked && !started) {
    for (let i = 0; i < people; i++) {
      voices[i].start();
    }
    started = true;
  }

  let stripWidth = width / people;
  let noteHeight = height / notes.length;
  for (let i = 0; i < people; i++) {
    let left = i * stripWidth;

    // the strip, in this person's colour, faint
    let faint = color(colours[i]);
    faint.setAlpha(50);
    noStroke();
    fill(faint);
    rect(left + 2, 0, stripWidth - 4, height);

    // 1. find a finger on this strip. -1 means there is none
    let y = fingerY(left, left + stripWidth);

    if (y >= 0 && started) {
      // 2. keep it on the screen, then map it onto a note: the bottom is low, the top high
      y = constrain(y, 1, height);
      let n = floor(map(y, height, 0, 0, notes.length));

      // 3. play that note
      voices[i].freq(notes[n]);
      if (!playing[i]) {
        voices[i].amp(volume, 0.1); // fade in
        playing[i] = true;
      }
      fill(colours[i]);
      rect(left + 2, height - (n + 1) * noteHeight, stripWidth - 4, noteHeight);
    } else if (playing[i]) {
      voices[i].amp(0, 0.3); // fade out
      playing[i] = false;
    }
  }

  // a line between the notes
  stroke(255, 40);
  strokeWeight(1);
  for (let n = 1; n < notes.length; n++) {
    line(0, n * noteHeight, width, n * noteHeight);
  }

  drawHowTo('No sound? Check silent mode.');
}

// how high a finger between left and right is. -1 if there is none.
// on a laptop, the mouse counts as one finger
function fingerY(left, right) {
  for (let i = 0; i < touches.length; i++) {
    if (touches[i].x >= left && touches[i].x < right) {
      return touches[i].y;
    }
  }
  if (touches.length === 0 && mouseIsPressed && mouseX >= left && mouseX < right) {
    return mouseY;
  }
  return -1;
}

// the band across the top: what to do, and a note when there is one
function drawHowTo(note) {
  noStroke();
  fill(0, 180);
  rect(0, 0, width, 110);
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(howTo, 16, 14, width - 32);
  if (note) {
    fill(255, 200, 0);
    text(note, 16, 80, width - 32);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
