// p5-phone 03 · One Tap, Many Permissions
// One tap can ask for several things at once. Then check each flag before you use it.
// A flag stays false if the person says no, or if the phone has no such hardware.

let mic; // p5-phone looks for a variable with exactly this name

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  mic = new p5.AudioIn();
  enablePermissionsTap(['motion', 'mic', 'torch'], 'Tap to start');
}

function draw() {
  background(20);
  if (window.micOpen) {
    mic.disconnect(); // keep the microphone out of the speaker
  }

  fill(255);
  textSize(18);
  text('motion: ' + (window.sensorsEnabled === true), 20, 40);
  text('microphone: ' + (window.micOpen === true), 20, 70);
  text('flashlight: ' + (window.torchEnabled === true), 20, 100);
  if (window.torchError) {
    text('flashlight problem: ' + window.torchError, 20, 130, width - 40);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
