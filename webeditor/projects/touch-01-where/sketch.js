// Touch 01 · Where
// mouseX and mouseY are where the finger is. mouseIsPressed is true while it is down.
// Put a finger on the screen and drag it around. On a laptop, the mouse does the same.

// change these
let diameter = 120; // how big the circle is

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures(); // no scrolling, zooming or pull to refresh. touch needs no permission
}

function draw() {
  background(20);
  noStroke();
  fill(255);

  // while a finger is down, a circle sits under it
  if (mouseIsPressed) {
    circle(mouseX, mouseY, diameter);
  }

  // the raw values
  textSize(18);
  text('mouseX ' + round(mouseX) + '   mouseY ' + round(mouseY), 20, 40);
  text('mouseIsPressed ' + mouseIsPressed, 20, 70);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
