// 02 · Tilt to Speed · 3 people
// Motion → sound. In turn: the phone is passed from person to person.
// One recording loops. Each person gets their own copy of it: their own voice.
// Tilt the phone to set the speed of your voice. Flat is slow, upright is fast.
// Every 15 seconds the colour changes and the phone goes to the next person.
// Your voice keeps playing at the speed you left it.
// The 1, 2 and 3 person versions are the same sketch. Only these two lines change:
let people = 3; // how many people share the phone: 1, 2 or 3
let howTo = 'Tilt to set your speed. When the colour changes, pass it on.';

// The recording: RAVAG interval signal, 1925. Austrian radio's clock, ticking between
// programmes. Public domain. https://commons.wikimedia.org/wiki/File:RAVAG-Pausenzeichen.ogg
let soundFile = 'https://digitalfuturesocadu.github.io/CC2026/experiment-2/media/wait-ravag.mp3';

// the feel of the piece. change these before you change anything else.
let turnSeconds = 15; // how long each turn lasts
let slowest = 0.5;    // half speed, when the phone lies flat
let fastest = 2;      // double speed, when it stands upright
let colours = ['#ff8c1a', '#2ab7ff', '#ff4fa3']; // one colour for each person

let voices = [];      // one copy of the recording for each person
let speeds = [];      // how fast each voice plays. 0 until that person's first turn
let hands = [];       // where each clock hand points. only for the drawing
let unlocked = false; // has the tap turned on motion and sound?
let startTime = -1;   // when the first turn started, in milliseconds

// p5-phone calls this once the tap has turned everything on
function userSetupComplete() {
  unlocked = true;
}

async function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();

  // on a laptop, show a QR code of this page so a phone can open it.
  // it only shows on a public https address, like the examples site, and in the p5.js web editor.
  if (location.protocol === 'https:' || location.protocol === 'blob:') {
    showDesktopQr();
  }

  angleMode(DEGREES);
  enablePermissionsTap(['motion', 'sound'], 'Tap to start');

  // load one copy of the recording for each person
  for (let i = 0; i < people; i++) {
    voices[i] = await loadSound(soundFile);
    speeds[i] = 0;
    hands[i] = 0;
  }
}

function draw() {
  background(20);
  if (!unlocked) {
    return;
  }
  if (startTime < 0) {
    startTime = millis();
  }

  // 1. whose turn is it? 0 is the first person
  let seconds = (millis() - startTime) / 1000;
  let turn = floor(seconds / turnSeconds) % people;

  // 2. read the tilt: flat is 0, upright is 90. keep it inside that range first
  let tilt = constrain(rotationX, 0, 90);

  // 3. map the tilt onto a speed, and give it to this person's voice
  if (speeds[turn] === 0) {
    // this person's first turn: start their voice
    voices[turn].loop();
    voices[turn].play();
  }
  speeds[turn] = map(tilt, 0, 90, slowest, fastest);
  voices[turn].rate(speeds[turn]);

  // 4. one clock for each voice
  for (let i = 0; i < people; i++) {
    drawClock(i, i === turn);
  }
  drawBanner(turn, turnSeconds - (seconds % turnSeconds));

  noStroke();
  fill(160);
  textSize(13);
  textAlign(LEFT, BASELINE);
  text('No sound? Check silent mode.', 16, height - 12);
}

// one voice as a clock. its hand turns at the speed of the voice.
// the person whose turn it is has the thick ring.
function drawClock(i, isTurn) {
  let x = width / 2;
  let y = 100 + (height - 130) * (i + 0.5) / people;
  let size = min(width * 0.55, (height - 130) / people * 0.65);
  hands[i] = hands[i] + speeds[i] * 3;

  noFill();
  stroke(colours[i]);
  if (isTurn) {
    strokeWeight(8);
  } else {
    strokeWeight(3);
  }
  circle(x, y, size);
  line(x, y, x + size * 0.4 * sin(hands[i]), y - size * 0.4 * cos(hands[i]));

  noStroke();
  fill(255);
  textSize(15);
  textAlign(CENTER, TOP);
  if (speeds[i] === 0) {
    text('waiting', x, y + size / 2 + 6);
  } else {
    text(nf(speeds[i], 1, 2) + '×', x, y + size / 2 + 6);
  }
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
}
