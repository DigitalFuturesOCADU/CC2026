// 01 · Tilt to Draw · 1 person
// Motion → screen. In turn: the phone is passed from person to person.
// Tilt the phone and the pen moves, leaving a line in your colour.
// Every 15 seconds the colour changes and the phone goes to the next person.
// The 1, 2 and 3 person versions are the same sketch. Only these two lines change:
let people = 1; // how many people share the phone: 1, 2 or 3
let howTo = 'Hold the phone flat. Tip it to draw.';

// the feel of the piece. change these before you change anything else.
let turnSeconds = 15; // how long each turn lasts
let maxTilt = 30;     // degrees of tilt that reach the edge of the screen
let fade = 10;        // how much the old lines fade, once a second. 0 never fades
let colours = ['#ff8c1a', '#2ab7ff', '#ff4fa3']; // one colour for each person

let x, y;             // where the pen is
let startTime = -1;   // when the first turn started, in milliseconds

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();

  // on a laptop, show a QR code of this page so a phone can open it.
  // it only shows on a public https address, like the examples site, and in the p5.js web editor.
  if (location.protocol === 'https:' || location.protocol === 'blob:') {
    showDesktopQr();
  }

  angleMode(DEGREES);
  enableGyroTap('Tap to start');
  x = width / 2;
  y = height / 2;
  background(0);
}

function draw() {
  if (!window.sensorsEnabled) {
    return;
  }
  if (startTime < 0) {
    startTime = millis();
  }

  // 1. whose turn is it? 0 is the first person
  let seconds = (millis() - startTime) / 1000;
  let turn = floor(seconds / turnSeconds) % people;

  // 2. read the tilt. keep it inside the range first, then map it onto the screen
  let tiltX = constrain(rotationY, -maxTilt, maxTilt);
  let tiltY = constrain(rotationX, -maxTilt, maxTilt);
  let targetX = map(tiltX, -maxTilt, maxTilt, 0, width);
  let targetY = map(tiltY, -maxTilt, maxTilt, 0, height);

  // 3. move the pen part of the way there, and draw a line in this person's colour
  let px = x;
  let py = y;
  x = lerp(x, targetX, 0.1);
  y = lerp(y, targetY, 0.1);
  stroke(colours[turn]);
  strokeWeight(10);
  line(px, py, x, y);

  // once a second, a see-through black layer, so old lines slowly fade
  if (frameCount % 60 === 0) {
    noStroke();
    fill(0, fade);
    rect(0, 0, width, height);
  }

  drawBanner(turn, turnSeconds - (seconds % turnSeconds));
}

// the band across the top: whose turn it is, and what to do
function drawBanner(turn, secondsLeft) {
  noStroke();
  fill(colours[turn]);
  rect(0, 0, width, 100);
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  if (people > 1) {
    text('Person ' + (turn + 1) + ' of ' + people + ' · ' + ceil(secondsLeft) + ' s', 16, 14);
    text(howTo, 16, 40, width - 32);
  } else {
    text(howTo, 16, 14, width - 32);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
