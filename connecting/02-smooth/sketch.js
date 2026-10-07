// Connecting 02 · Smooth
// Sensor readings jump around. lerp() moves a value part of the way to its target
// every frame, so it follows smoothly. Shake the phone and compare the two bars.

// change these
let amount = 0.1; // how far to move each frame. 0.02 is slow and smooth, 1 is no smoothing
let most = 20;    // the movement that fills a bar

let smoothed = 0; // kept from frame to frame, so it is declared up here

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  enableGyroTap('Tap to start');
}

function draw() {
  background(20);
  if (window.sensorsEnabled) {
    let raw = abs(accelerationX) + abs(accelerationY) + abs(accelerationZ);
    smoothed = lerp(smoothed, raw, amount);

    // raw on the left in grey, smoothed on the right in white
    let rawHeight = map(raw, 0, most, 0, height - 80, true);
    let smoothHeight = map(smoothed, 0, most, 0, height - 80, true);
    noStroke();
    fill(120);
    rect(width * 0.15, height - rawHeight, width * 0.3, rawHeight);
    fill(255);
    rect(width * 0.55, height - smoothHeight, width * 0.3, smoothHeight);

    textSize(18);
    text('raw ' + nf(raw, 1, 1) + '   smoothed ' + nf(smoothed, 1, 1), 20, 40);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
