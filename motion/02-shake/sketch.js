// Motion 02 · Shake
// deviceShaken() is an event. p5.js calls it when the phone is shaken hard enough.
// Each shake picks a new colour and adds one to the count. Try a small shake, then a big one.

// change these
let threshold = 30; // how hard a shake has to be. lower is easier
let gap = 500;      // milliseconds before the next shake can count

let count = 0;     // how many shakes so far
let lastShake = 0; // when the last shake counted, in milliseconds
let colour;        // the background colour

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  enableGyroTap('Tap to start');
  setShakeThreshold(threshold);
  colour = color(20);
}

function draw() {
  background(colour);
  if (window.sensorsEnabled) {
    // the count, on a dark band so it shows on any colour
    fill(0);
    rect(0, 0, width, 60);
    fill(255);
    textSize(18);
    text('shakes ' + count, 20, 38);
  }
}

// p5.js calls this when the phone is shaken
function deviceShaken() {
  // one shake calls this several times in a row, so count it only once
  if (millis() - lastShake < gap) return;
  lastShake = millis();
  count = count + 1;
  colour = color(random(255), random(255), random(255));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
