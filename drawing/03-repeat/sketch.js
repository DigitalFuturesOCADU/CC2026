// Drawing 03 · Repeat
// A for loop draws the same circle again and again, each one further around a ring.
// Slide a finger left and right: its x position sets how many circles there are.

// change these
let fewest = 3; // circles with a finger at the left edge
let most = 40;  // circles with a finger at the right edge

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  angleMode(DEGREES); // angles in degrees: once around the ring is 360
}

function draw() {
  background(20);

  // the finger's x position becomes a whole number of circles
  let count = round(map(mouseX, 0, width, fewest, most, true));
  let ring = width * 0.35; // how far the circles sit from the centre

  noStroke();
  fill(255);
  for (let i = 0; i < count; i++) {
    let angle = i * 360 / count; // spread evenly around the ring
    let x = width / 2 + cos(angle) * ring;
    let y = height / 2 + sin(angle) * ring;
    circle(x, y, 20);
  }

  textSize(18);
  text('mouseX ' + round(mouseX) + '   count ' + count, 20, 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
