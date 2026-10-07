// Connecting 01 · Map
// map() turns one range of numbers into another.
// Tilt in degrees becomes the brightness of the whole screen: the screen is a light.
// The last argument, true, keeps the answer inside the new range, like constrain().

// change these
let darkTilt = -30;  // tilt (degrees) that gives a black screen
let lightTilt = 30;  // tilt (degrees) that gives a white screen

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  angleMode(DEGREES); // tilt in degrees. p5.js uses radians unless you say so
  enableGyroTap('Tap to start');
}

function draw() {
  background(20);
  if (!window.sensorsEnabled) return;

  let glow = map(rotationX, darkTilt, lightTilt, 0, 255, true);
  background(glow);

  // the numbers, on a dark band so they show on any brightness
  fill(0);
  rect(0, 0, width, 60);
  fill(255);
  textSize(18);
  text('rotationX ' + round(rotationX) + '  becomes  ' + round(glow), 20, 38);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
