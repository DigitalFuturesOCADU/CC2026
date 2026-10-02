// 08 · Quiet for Light · 2 people
// Sound → flashlight. Together: everyone is quiet, or not, for the same phone.
// The flashlight comes on after three seconds of silence. Any sound turns it off.
// The code is the same in the 1, 2 and 3 person versions. Only these two lines change,
// and the code never uses people. The difference is the people.
let people = 2; // how many people share the phone: 1, 2 or 3
let howTo = 'Both stay quiet for three seconds and the light comes on. Any sound turns it off.';

// the feel of the piece. change these before you change anything else.
let quietSeconds = 3;   // how long it has to be quiet before the light comes on
let margin = 0.1;       // how much louder than the quiet room counts as sound
let listenSeconds = 2;  // how long to listen to the quiet room at the start
let boost = 5;          // phones hear quietly. this turns the level up
let lightColour = '#ffdc78'; // the screen shows this while the flashlight is on

let mic;                // the microphone
let meter;              // measures how loud the microphone is
let roomLevel = 0;      // the loudest the quiet room got while the sketch listened
let listenUntil = -1;   // when the listening to the room ends, in milliseconds
let quietSince = 0;     // when the last sound was, in milliseconds
let lightOn = false;    // is the flashlight on?

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();

  // on a laptop, show a QR code of this page so a phone can open it.
  // it only shows on a public https address, like the examples site.
  if (location.protocol === 'https:' && window.self === window.top) {
    showDesktopQr();
  }

  setupMic();
  enablePermissionsTap(['mic', 'torch'], 'Tap to start');
}

function draw() {
  let level = getMicLevel();

  // 1. the first seconds the microphone is on: listen to the quiet room
  if (window.micOpen && listenUntil < 0) {
    listenUntil = millis() + listenSeconds * 1000;
  }
  let listening = millis() < listenUntil;
  if (listening) {
    roomLevel = max(roomLevel, level);
  }
  let threshold = roomLevel + margin;

  // 2. any sound starts the clock again. so does listening, or no microphone yet
  if (level > threshold || listening || !window.micOpen) {
    quietSince = millis();
  }
  let quiet = (millis() - quietSince) / 1000; // seconds of quiet so far

  // 3. switch the light only when it needs to change
  let wanted = quiet > quietSeconds;
  if (wanted !== lightOn) {
    lightOn = wanted;
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

  // the quiet so far, as a bar that fills up the middle. any sound empties it
  noStroke();
  fill(255, 200, 0);
  let h = (height - 200) * constrain(quiet / quietSeconds, 0, 1);
  rect(width / 2 - 30, height - 50 - h, 60, h);

  drawLevel(level, threshold);
  let note = micNote(listening);
  if (note === '') {
    note = torchNote();
  }
  drawHowTo(note);
}

// what the microphone is doing, for the band at the top
function micNote(listening) {
  if (listening) {
    return 'Stay quiet for a moment: listening to the room.';
  }
  if (window.micOpen) {
    return '';
  }
  if (window.micEnabled) {
    return 'Waiting for the microphone.';
  }
  return 'Tap to start.';
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

// ---------- the microphone. this part is the same in every sound sketch. ----------

// call this once in setup
function setupMic() {
  mic = new p5.AudioIn(); // p5-phone looks for a variable with exactly this name
  meter = new p5.Amplitude();
  routeMic();
}

// p5.sound sends the microphone straight to the speaker unless you stop it.
// this unplugs it from the speaker and plugs it into the level meter.
function routeMic() {
  mic.disconnect();
  mic.connect(meter);
}

// how loud it is right now, from 0 to 1. it is 0 when there is no microphone.
// window.micOpen is true only while sound is really arriving.
function getMicLevel() {
  if (!window.micOpen) {
    return 0;
  }
  routeMic();
  return constrain(meter.getLevel() * boost, 0, 1);
}

// the level as a bar along the bottom, with a white line where sound starts to count
function drawLevel(level, threshold) {
  noStroke();
  fill(60);
  rect(0, height - 16, width, 16);
  fill(100, 200, 255);
  rect(0, height - 16, width * level, 16);
  fill(255);
  rect(width * threshold - 2, height - 24, 4, 24);
}
