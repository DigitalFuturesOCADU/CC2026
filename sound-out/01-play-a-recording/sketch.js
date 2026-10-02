// Sound Out 01 · Play a Recording
// p5.sound loads a recording and loops it. A quick tap starts or stops it.
// Hold a finger down and slide up and down to bend the speed. Slower is also lower.

// change these
let slowest = 0.5; // the speed at the bottom of the screen. 1 is as it was recorded
let fastest = 2;   // the speed at the top

let recording;         // the loaded sound file
let speed = 1;         // how fast it plays now
let downTime = -10000; // when the finger went down

async function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  recording = await loadSound('https://digitalfuturesocadu.github.io/CC2026/experiment-2/media/wait-ravag.mp3');
  recording.loop();               // start again at the end. loop() does not play it, play() does
  enableSoundTap('Tap to start'); // asked for once the recording has loaded
}

function draw() {
  background(20);

  // while a finger is down, its height sets the speed
  if (mouseIsPressed && window.soundEnabled) {
    speed = map(mouseY, height, 0, slowest, fastest, true);
    recording.rate(speed);
  }

  fill(255);
  textSize(18);
  text('playing ' + recording.isPlaying() + '   speed ' + nf(speed, 1, 2), 20, 40);
}

function mousePressed() {
  if (!window.soundEnabled) return; // the permission tap only turns the sound on
  downTime = millis();
}

function mouseReleased() {
  // a quick tap starts or stops the loop. a longer hold only bends the speed
  if (millis() - downTime > 300) return;
  if (recording.isPlaying()) {
    recording.stop();
  } else {
    recording.play();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
