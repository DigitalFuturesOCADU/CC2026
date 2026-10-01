// 03 · Still for Light · 1 person
// Motion → flashlight. Together: everyone holds the phone at the same time.
// The flashlight comes on when the phone has been still for a second.
// Any movement turns it off.
// The code is the same in the 1, 2 and 3 person versions. Only these two lines change,
// and the code never uses people. The difference is the people.
let people = 1; // how many people share the phone: 1, 2 or 3
let howTo = 'Rest the phone face down on your palm. Hold still and the light comes on.';

// the feel of the piece. change these before you change anything else.
let stillness = 0.5; // how much movement still counts as still. higher is easier
let waitSeconds = 1; // how long it has to stay still before the light comes on
let lightColour = '#ffdc78'; // the screen shows this while the flashlight is on

let movement = 0;    // how much the phone is moving, smoothed
let stillSince = 0;  // when it last moved, in milliseconds
let lightOn = false; // is the flashlight on?

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();

  // on a laptop, show a QR code of this page so a phone can open it.
  // it only shows on a public https address, like the examples site.
  if (location.protocol === 'https:' && window.self === window.top) {
    showDesktopQr();
  }

  enablePermissionsTap(['motion', 'torch'], 'Tap to start');
}

function draw() {
  // 1. read the movement: acceleration in all three directions, without gravity
  let shake = abs(accelerationX) + abs(accelerationY) + abs(accelerationZ);
  movement = lerp(movement, shake, 0.1);

  // 2. any movement starts the clock again
  if (movement > stillness || !window.sensorsEnabled) {
    stillSince = millis();
  }
  let still = millis() - stillSince > waitSeconds * 1000;

  // 3. switch the light only when it needs to change
  if (still !== lightOn) {
    lightOn = still;
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

  // the movement as a bar along the bottom. past the white line counts as moving
  let most = stillness * 3;
  noStroke();
  fill(60);
  rect(0, height - 16, width, 16);
  fill(100, 200, 255);
  rect(0, height - 16, width * constrain(movement / most, 0, 1), 16);
  fill(255);
  rect(width * stillness / most - 2, height - 24, 4, 24);

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
