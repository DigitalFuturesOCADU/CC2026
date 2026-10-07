// Connecting 04 · Fade
// An event starts a clock. Each shake lights the screen, and the light fades over three seconds.
// millis() is the time since the sketch started. Subtract the time of the event
// and you know how long ago it happened.

// change these
let fadeTime = 3000; // milliseconds from full light to dark

let shakeTime = -100000; // when the last shake happened. long ago, to start dark

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  enableGyroTap('Tap to start');
}

function draw() {
  let since = millis() - shakeTime;
  let glow = map(since, 0, fadeTime, 255, 20, true);
  background(glow);

  fill(0);
  rect(0, 0, width, 60);
  fill(255);
  textSize(18);
  text('shake it. last shake ' + nf(since / 1000, 1, 1) + ' s ago', 20, 38);
}

// p5.js calls this when the phone is shaken
function deviceShaken() {
  shakeTime = millis();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
