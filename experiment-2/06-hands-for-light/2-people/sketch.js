// 06 · Hands for Light · 2 people
// Touch → flashlight. Together: everyone touches the screen at the same time.
// The light blinks while some people are touching, faster with more fingers.
// When everyone is touching, it stays on.
// The 1, 2 and 3 person versions are the same sketch. Only these two lines change:
let people = 2; // how many people share the phone: 1, 2 or 3
let howTo = 'Point the light at a wall. One finger each. Both touching keeps it on.';

// the feel of the piece. change these before you change anything else.
let slowest = 0.8;   // seconds between blinks with one finger. two fingers: half that
let lightColour = '#ffdc78'; // the screen shows this while the flashlight is on
let colours = ['#ff8c1a', '#2ab7ff', '#ff4fa3']; // one colour for each person

let lightOn = false; // is the flashlight on?
let lastSwitch = 0;  // when the light last switched, in milliseconds

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();

  // on a laptop, show a QR code of this page so a phone can open it.
  // it only shows on a public https address, like the examples site, and in the p5.js web editor.
  if (location.protocol === 'https:' || location.protocol === 'blob:') {
    showDesktopQr();
  }

  enableTorchTap('Tap to start');
}

function draw() {
  // 1. count the fingers on the screen. on a laptop, the mouse counts as one
  let fingers = touches.length;
  if (fingers === 0 && mouseIsPressed) {
    fingers = 1;
  }
  fingers = min(fingers, people);

  // 2. what should the light do?
  let wanted = lightOn;
  if (fingers === 0) {
    wanted = false; // no one: off
  } else if (fingers === people) {
    wanted = true; // everyone: on
  } else if (millis() - lastSwitch > slowest * 1000 / fingers) {
    wanted = !lightOn; // some: blink. more fingers, faster
  }

  // 3. switch the light only when it needs to change
  if (wanted !== lightOn) {
    lightOn = wanted;
    lastSwitch = millis();
    if (window.torchEnabled) {
      setTorch(lightOn);
    }
  }

  // the screen shows what the light is doing
  if (lightOn) {
    background(lightColour);
  } else {
    background(20);
  }

  // one circle for each person, filled for each finger on the screen
  for (let i = 0; i < people; i++) {
    let x = width * (i + 0.5) / people;
    let size = min(width / people * 0.6, 120);
    stroke(colours[i]);
    strokeWeight(6);
    if (i < fingers) {
      fill(colours[i]);
    } else {
      noFill();
    }
    circle(x, height * 0.6, size);
  }

  drawHowTo(torchNote());
}

// what the flashlight is doing, for the band at the top
function torchNote() {
  if (window.torchError) {
    return 'Flashlight: ' + window.torchError;
  }
  if (!window.torchEnabled) {
    return 'Tap to start. The flashlight needs a phone.';
  }
  return '';
}

// the band across the top: what to do, and a note when there is one
function drawHowTo(note) {
  noStroke();
  fill(0, 180);
  rect(0, 0, width, 110);
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(howTo, 16, 14, width - 32);
  if (note) {
    fill(255, 200, 0);
    text(note, 16, 80, width - 32);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
