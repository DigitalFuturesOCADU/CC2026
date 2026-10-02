// p5-phone 01 · Start Here
// The blank phone sketch. Every phone sketch starts this way:
// lock the gestures, ask for the sensors on a tap, and read nothing until the flag says yes.

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();                  // no scrolling, zooming or pull to refresh
  angleMode(DEGREES);              // tilt in degrees. p5.js uses radians unless you say so
  enableSensorTap('Tap to start'); // a phone asks for the sensors only after a tap
}

function draw() {
  background(20);
  fill(255);
  textSize(18);

  // until the tap, there is nothing to read
  if (!window.sensorsEnabled) {
    text('waiting for the tap', 20, 40);
    return;
  }

  // after the tap: your sketch goes here
  text('sensors on. rotationX is ' + round(rotationX), 20, 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
