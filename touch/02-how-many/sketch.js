// Touch 02 · How Many
// touches is a list with one entry for each finger on the screen. Each has an x and a y.
// touches.length is how many fingers there are. Try one finger, then two, then five.
// The mouse is not in touches, so try this one on a phone.

// change these
let diameter = 120; // how big each circle is

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures(); // no scrolling, zooming or pull to refresh. touch needs no permission
}

function draw() {
  background(20);
  noStroke();

  // one circle for each finger. see-through, so circles that overlap still show
  fill(255, 150);
  for (let i = 0; i < touches.length; i++) {
    circle(touches[i].x, touches[i].y, diameter);
  }

  // the raw value
  fill(255);
  textSize(18);
  text('touches.length ' + touches.length, 20, 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
