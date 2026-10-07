// Motion 01 · Tilt
// rotationX and rotationY say how far the phone is tipped, in degrees.
// Tip it left and right, then forward and back, to move the circle.

// change these
let range = 45; // degrees of tilt that reach the edge of the screen

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  angleMode(DEGREES); // tilt in degrees. p5.js uses radians unless you say so
  enableGyroTap('Tap to start');
}

function draw() {
  background(20);
  if (window.sensorsEnabled) {
    // rotationY: tipped left and right. rotationX: tipped forward and back
    let x = map(rotationY, -range, range, 0, width, true);
    let y = map(rotationX, -range, range, 0, height, true);

    noStroke();
    fill(255);
    circle(x, y, 80);

    // the raw values
    textSize(18);
    text('rotationX ' + round(rotationX) + '   rotationY ' + round(rotationY), 20, 40);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
