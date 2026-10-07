// p5-phone 02 · Debug Panel
// A phone has no console you can see, so console.log() goes nowhere.
// showDebug() puts a panel on the screen and debug() writes to it.
// Errors land in the panel too, with their line numbers.

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  angleMode(DEGREES); // tilt in degrees. p5.js uses radians unless you say so
  showDebug(); // call it first, so it catches errors from the start
  enableGyroTap('Tap to start');
  debug('setup is done');
}

function draw() {
  background(20);
  if (window.sensorsEnabled) {
    // about once a second, write the tilt to the panel
    if (frameCount % 60 === 0) {
      debug('rotationX ' + round(rotationX) + '   rotationY ' + round(rotationY));
    }
  }
}

function mousePressed() {
  debugWarn('tap at ' + round(mouseX) + ', ' + round(mouseY)); // a warning stands out
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
