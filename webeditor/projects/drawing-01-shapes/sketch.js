// Drawing 01 · Shapes
// The shapes p5.js draws, placed by the size of the screen so they fit any phone.
// draw() runs about 60 times a second. The circle's size is worked out again each frame.

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures(); // no scrolling, zooming or pull to refresh
}

function draw() {
  // 0,0 is the top left corner. x grows to the right, y grows down the screen
  background(20); // paint over the last frame

  // a size that changes over time. sin() swings from -1 to 1 and back as millis() grows
  let amount = width * 0.5 + sin(millis() / 500) * width * 0.15;

  // a circle: the x and y of its centre, then how wide
  fill(255);
  stroke(255, 140, 0); // the colour of the outline
  strokeWeight(8);     // how thick the outline is
  circle(width / 2, height * 0.35, amount);

  // a line: from one x and y to another
  stroke(150);
  strokeWeight(2);
  line(20, height * 0.65, width - 20, height * 0.65);

  // a rectangle: the x and y of its top left corner, then its width and height
  noStroke(); // no outline from here on
  fill(255, 140, 0);
  rect(20, height * 0.7, width - 40, height * 0.15);

  // text: the words, then the x and y where the line of text starts
  fill(255);
  textSize(18);
  text('circle ' + round(amount) + ' wide', 20, 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
