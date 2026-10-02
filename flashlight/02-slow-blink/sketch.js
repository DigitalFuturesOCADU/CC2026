// Flashlight 02 · Slow Blink
// A millis() timer blinks the light. Tilt sets the time between switches:
// flat is slow, upright is quick. Point the light at a wall.

// change these
let slowest = 2000; // milliseconds between switches with the phone flat
let fastest = 300;  // milliseconds between switches with the phone upright

let lightOn = false; // should the light be on?
let lastSwitch = 0;  // when it last switched, in milliseconds

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  angleMode(DEGREES); // tilt in degrees. p5.js uses radians unless you say so
  enablePermissionsTap(['motion', 'torch'], 'Tap to start');
}

function draw() {
  background(20);
  if (!window.sensorsEnabled) return;

  let wait = map(rotationX, 0, 90, slowest, fastest, true); // tilt sets the time
  wait = max(wait, 300); // never quicker than 300: fast flashing can trigger seizures

  // when the time is up, switch. setTorch() runs only here, when the light changes
  if (millis() - lastSwitch > wait) {
    lightOn = !lightOn;
    lastSwitch = millis();
    if (window.torchEnabled) {
      setTorch(lightOn);
    }
  }

  // the screen shows what the light is doing. torchActive is true while it is on
  if (window.torchActive) {
    background(255);
  }

  // the numbers on a dark band, then any flashlight problem
  fill(0);
  rect(0, 0, width, 60);
  fill(255);
  textSize(18);
  text('rotationX ' + round(rotationX) + '   wait ' + round(wait), 20, 38);
  if (window.torchError) {
    text('flashlight problem: ' + window.torchError, 20, 90, width - 40);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
