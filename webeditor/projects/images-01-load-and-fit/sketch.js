// Images 01 · Load and Fit
// p5.js 2 loads a file with await, inside an async setup(). setup() waits on that line
// until the file arrives. Then the picture is drawn as big as fits, without stretching.
// Turn the phone sideways to see it fit again.

let picture; // the image, once it has loaded

async function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  imageMode(CENTER); // image() now places the picture by its centre
  picture = await loadImage('https://digitalfuturesocadu.github.io/CC2026/media/images/spaceSuit.png');
}

function draw() {
  background(20);

  // how much to grow the picture to fill the width, and to fill the height.
  // the smaller of the two fits both ways. the same number for both sides keeps its shape
  let fit = min(width / picture.width, height / picture.height);
  image(picture, width / 2, height / 2, picture.width * fit, picture.height * fit);

  // how many times its own size the picture is drawn
  fill(255);
  textSize(18);
  text('fit ' + nf(fit, 1, 2), 20, 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
