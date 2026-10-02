// Motion 03 · How Much Movement
// accelerationX, Y and Z say how hard the phone is pushed each way. Gravity is left out.
// Add all three up for one number: how much the phone is moving. lerp() smooths it.
// Hold the phone still, then walk with it, then wave it around.

// change these
let amount = 0.1; // smoothing. lower is smoother and slower. 1 is no smoothing
let most = 20;    // the movement that makes the biggest circle

let movement = 0; // the smoothed movement, kept from frame to frame

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  enableSensorTap('Tap to start');
}

function draw() {
  background(20);
  if (!window.sensorsEnabled) return;

  // abs() drops the minus sign, so a push either way adds to the total
  let raw = abs(accelerationX) + abs(accelerationY) + abs(accelerationZ);
  movement = lerp(movement, raw, amount);

  // more movement, bigger circle
  let diameter = map(movement, 0, most, 40, width, true);
  noStroke();
  fill(255);
  circle(width / 2, height / 2, diameter);

  // the raw and smoothed values
  textSize(18);
  text('raw ' + nf(raw, 1, 1) + '   smoothed ' + nf(movement, 1, 1), 20, 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
