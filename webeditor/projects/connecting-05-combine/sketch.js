// Connecting 05 · Combine
// Two inputs at once. The light needs a finger on the screen AND the phone tipped forward.
// Give each input to a different person and the light needs both of them.
// && means and. Change it to || (or) and see how the relation changes.

// change these
let threshold = 20; // degrees of forward tilt that count as tipped

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  angleMode(DEGREES); // tilt in degrees. p5.js uses radians unless you say so
  enableGyroTap('Tap to start');
}

function draw() {
  background(20);
  if (!window.sensorsEnabled) return;

  let touching = mouseIsPressed;
  let tipped = rotationX > threshold;

  if (touching && tipped) {
    background(255);
  }

  fill(0);
  rect(0, 0, width, 60);
  fill(255);
  textSize(18);
  text('touching ' + touching + '   tipped ' + tipped, 20, 38);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
