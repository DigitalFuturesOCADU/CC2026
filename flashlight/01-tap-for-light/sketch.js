// Flashlight 01 · Tap for Light
// The flashlight is the camera's light, so the first tap asks for the camera.
// After that, each tap switches the light on or off. The screen shows what the light is doing.

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  enableTorchTap('Tap to start');
}

function draw() {
  // torchActive is true while the light is on
  if (window.torchActive) {
    background(255);
  } else {
    background(20);
  }

  // the raw value, on a dark band so it shows on white
  fill(0);
  rect(0, 0, width, 60);
  fill(255);
  textSize(18);
  text('torchActive ' + window.torchActive, 20, 38);

  // some phones and browsers have no flashlight. this says why
  if (window.torchError) {
    text('flashlight problem: ' + window.torchError, 20, 90, width - 40);
  }
}

function mousePressed() {
  // the first tap only asks for the camera
  if (window.torchEnabled) {
    toggleTorch();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
