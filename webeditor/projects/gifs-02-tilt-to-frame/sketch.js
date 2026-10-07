// GIFs 02 · Tilt to Frame
// The GIF never plays on its own. rotationY, the tilt left and right, picks the frame
// with setFrame(). Tip the phone slowly from side to side and the fingers move with it.

// change these
let range = 45; // degrees of tilt, each way, that reach the first and the last frame

let gifImage; // the GIF, once it has loaded

async function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  angleMode(DEGREES); // tilt in degrees. p5.js uses radians unless you say so
  enableGyroTap('Tap to start');
  imageMode(CENTER);
  gifImage = await loadImage('https://digitalfuturesocadu.github.io/CC2026/media/gifs/hand.gif');
  gifImage.pause(); // the tilt picks the frame, not the clock
}

function draw() {
  background(20);
  if (!window.sensorsEnabled) return;

  // tipped left is the first frame (0), tipped right is the last (numFrames() - 1)
  let index = round(map(rotationY, -range, range, 0, gifImage.numFrames() - 1, true));
  gifImage.setFrame(index);

  // as big as fits the screen, as in Images 01
  let fit = min(width / gifImage.width, height / gifImage.height);
  image(gifImage, width / 2, height / 2, gifImage.width * fit, gifImage.height * fit);

  fill(255);
  textSize(18);
  text('rotationY ' + round(rotationY) + '   frame ' + index, 20, 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
