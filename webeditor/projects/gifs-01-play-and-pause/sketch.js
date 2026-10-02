// GIFs 01 · Play and Pause
// loadImage() loads a GIF too, and it plays by itself. pause() stops it, play() starts it.
// Hold a finger on the screen to play the GIF. Lift it to pause.

let gifImage; // the GIF, once it has loaded

async function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  imageMode(CENTER);
  gifImage = await loadImage('https://digitalfuturesocadu.github.io/CC2026/media/gifs/hand.gif');
  gifImage.pause(); // still, until a finger is down
}

function draw() {
  background(20);
  // as big as fits the screen, as in Images 01
  let fit = min(width / gifImage.width, height / gifImage.height);
  image(gifImage, width / 2, height / 2, gifImage.width * fit, gifImage.height * fit);

  // frames are counted from 0, so the last one is numFrames() - 1
  fill(255);
  textSize(18);
  text('frame ' + gifImage.getCurrentFrame() + ' of ' + gifImage.numFrames(), 20, 40);
}

function mousePressed() {
  // pause() stops the picture, not the GIF's clock. setting the frame restarts the clock,
  // so the GIF carries on from this frame instead of jumping ahead
  gifImage.setFrame(gifImage.getCurrentFrame());
  gifImage.play();
}

function mouseReleased() {
  gifImage.pause();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
