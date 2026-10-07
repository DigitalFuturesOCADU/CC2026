// Connecting 03 · Threshold
// A stream becomes an event. Tip the phone forward past the line and it counts once.
// To count it only once, remember whether it was already past the line last frame.

// change these
let threshold = 30; // degrees of forward tilt that count as tipped

let wasTipped = false; // was it past the line last frame?
let count = 0;         // how many times it has crossed

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  angleMode(DEGREES); // tilt in degrees. p5.js uses radians unless you say so
  enableGyroTap('Tap to start');
}

function draw() {
  background(20);
  if (window.sensorsEnabled) {
    let tipped = rotationX > threshold;
    if (tipped && !wasTipped) {
      count = count + 1; // the moment it crosses the line: the event
    }
    wasTipped = tipped;

    // the stream as a dot moving down the screen, the threshold as a line
    let y = map(rotationX, -90, 90, 0, height, true);
    let lineY = map(threshold, -90, 90, 0, height);
    stroke(255);
    line(0, lineY, width, lineY);
    noStroke();
    if (tipped) {
      fill(255, 200, 0);
    } else {
      fill(255);
    }
    circle(width / 2, y, 50);

    fill(255);
    textSize(18);
    text('rotationX ' + round(rotationX) + '   count ' + count, 20, 40);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
