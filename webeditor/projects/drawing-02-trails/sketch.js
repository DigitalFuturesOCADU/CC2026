// Drawing 02 · Trails
// Tilt steers a pen, like a marble on a tray. The background is see-through, so the
// last frames still show, a little darker each time. Hold the phone flat, then tip it.

// change these
let speed = 0.2; // how far the pen moves each frame, for each degree of tilt
let fade = 20;   // how fast the trail fades. 0 never fades, 255 leaves no trail

let x; // where the pen is
let y;

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  angleMode(DEGREES); // tilt in degrees. p5.js uses radians unless you say so
  enableSensorTap('Tap to start');
  x = width / 2;
  y = height / 2;
}

function draw() {
  background(0, fade); // black, made see-through by the second number
  if (!window.sensorsEnabled) return;

  // each frame the pen moves by the tilt. constrain() keeps it on the screen
  x = constrain(x + rotationY * speed, 0, width);
  y = constrain(y + rotationX * speed, 0, height);

  noStroke();
  fill(255);
  circle(x, y, 30);

  // the raw values, on a solid band so the numbers do not leave a trail
  fill(0);
  rect(0, 0, width, 60);
  fill(255);
  textSize(18);
  text('rotationX ' + round(rotationX) + '   rotationY ' + round(rotationY), 20, 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
