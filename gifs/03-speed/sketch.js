// GIFs 03 · Speed
// delay() sets how long every frame stays on the screen, in milliseconds. It replaces
// the timing saved in the file. Drag a finger up for fast, down for slow.

// change these
let fastest = 20;  // milliseconds for each frame, with a finger at the top
let slowest = 400; // milliseconds for each frame, with a finger at the bottom

let gifImage;    // the GIF, once it has loaded
let amount = 60; // the delay now. it starts at 60, the speed saved in this GIF

async function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  imageMode(CENTER);
  gifImage = await loadImage('https://digitalfuturesocadu.github.io/CC2026/media/gifs/cow.gif');
  gifImage.delay(amount); // every frame now waits this long
}

function draw() {
  background(20);
  // as big as fits the screen, as in Images 01
  let fit = min(width / gifImage.width, height / gifImage.height);
  image(gifImage, width / 2, height / 2, gifImage.width * fit, gifImage.height * fit);

  fill(255);
  textSize(18);
  text('delay ' + amount + ' ms', 20, 40);
}

// a finger dragged up and down: the top of the screen is fast, the bottom is slow
function mouseDragged() {
  amount = round(map(mouseY, 0, height, fastest, slowest, true));
  gifImage.delay(amount);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
