// Images 02 · Tilt to Scale
// rotationX, the tilt forward and back, sets how big the picture is drawn.
// Lay the phone flat for small, stand it up for big. Scale 1 is the picture's own size.

// change these
let smallest = 0.5; // the scale with the phone lying flat
let biggest = 2;    // the scale with the phone standing up

let picture; // the image, once it has loaded

async function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  angleMode(DEGREES); // tilt in degrees. p5.js uses radians unless you say so
  enableGyroTap('Tap to start');
  imageMode(CENTER);
  picture = await loadImage('https://digitalfuturesocadu.github.io/CC2026/media/images/spaceSuit.png');
}

function draw() {
  background(20);
  if (window.sensorsEnabled) {
    // flat (0 degrees) to standing (90) becomes smallest to biggest. true keeps it in between
    let amount = map(rotationX, 0, 90, smallest, biggest, true);
    image(picture, width / 2, height / 2, picture.width * amount, picture.height * amount);

    // the raw value and the scale it became, on a band so the picture never hides them
    fill(20);
    rect(0, 0, width, 60);
    fill(255);
    textSize(18);
    text('rotationX ' + round(rotationX) + '   scale ' + nf(amount, 1, 2), 20, 40);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
