// Sound In 03 · High and Low
// p5.FFT splits sound into thin slices, low to high. Hum for the low bar, whistle for the high one.

// change these
let lowBand = [80, 400];     // from and to, in hertz. a hum is here
let highBand = [2000, 8000]; // a whistle and "sss" are here
let quietDb = -75; // decibels that count as nothing. raise it in a noisy room
let loudDb = -35;  // decibels that fill a bar

let mic; // p5-phone looks for a variable with exactly this name
let fft; // splits the sound into slices

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  mic = new p5.AudioIn();
  fft = new p5.FFT(256); // 256 slices
  enableMicTap('Tap to start');
}

function draw() {
  background(20);
  // micOpen is true only while sound is really arriving
  if (window.micOpen) {
    mic.disconnect(); // unplug the microphone from the speaker...
    mic.connect(fft); // ...and plug it into the FFT
    let slices = fft.analyze(); // how much sound is in each slice, lowest first
    let low = bandLevel(slices, lowBand);
    let high = bandLevel(slices, highBand);
    // one bar for each band: low on the left, high on the right
    noStroke();
    fill(100, 200, 255);
    rect(width * 0.15, height - low * height, width * 0.3, low * height);
    fill(255, 200, 0);
    rect(width * 0.55, height - high * height, width * 0.3, high * height);
    fill(255);
    textSize(18);
    text('low ' + nf(low, 1, 2) + '   high ' + nf(high, 1, 2), 20, 40);
  }
}

// the loudest slice in a band, from 0 to 1
function bandLevel(slices, band) {
  let hzPerSlice = getAudioContext().sampleRate / 2 / slices.length;
  let loudest = 0.00001; // almost silent. 0 would break the decibels below
  for (let i = round(band[0] / hzPerSlice); i <= round(band[1] / hzPerSlice); i++) {
    loudest = max(loudest, slices[i]);
  }
  // the numbers are tiny, so read them in decibels, the way a sound meter does
  return map(20 * Math.log10(loudest), quietDb, loudDb, 0, 1, true);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
