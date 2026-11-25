/*
Servo Example 5: Collision Detection
Two boxes on the canvas. Hold the mouse over the Servo 0 box and servo 0 wiggles; over
the Servo 1 box, servo 1 wiggles. A servo that isn't wiggling is detached (limp).
Outside both boxes, both servos are detached.

collidePointRect() comes from the p5.collide2D library (loaded in index.html):
it is true when a point (the mouse) is inside a rectangle (a box).
https://github.com/bmoren/p5.collide2D

Detaching: send -1 in place of that servo's angle. "-1,90\n" makes servo 0 limp and
moves servo 1 to 90.

The servos plug into headers 0 and 1 of the Servo FeatherWing.
Works with the servoWingTest Arduino sketch (on Canvas). Use Chrome or Edge.

The bar along the top shows whether the Feather is connected, the last line sent to
it, and the last message it sent back.

To extend this example:
- Add more boxes for more servos
- Give each box its own wave speed (see Example 5b, Collision Array)
*/

let port;                // the serial connection to the Feather
let connectButton;
let lastLine = '';       // the last line sent to the Feather
let featherSays = '';    // the last message the Feather sent back
let lastSend = 0;        // when we last sent, in milliseconds
let sendEvery = 30;      // send at most every 30 ms (the Feather needs about 15 ms)
let servoAngle0 = 90;    // the angle for the servo on header 0
let servoAngle1 = 90;    // the angle for the servo on header 1
let waveSpeed0 = 2000;   // one wiggle of servo 0, in milliseconds
let waveSpeed1 = 2000;   // one wiggle of servo 1, in milliseconds

// how far through its wave each servo is (1 = one full wiggle). It only moves on
// while that servo is wiggling, so a servo carries on from where it stopped
let wavePos0 = 0;
let wavePos1 = 0;

// servo 0's range
let servo0Min = 45;
let servo0Max = 135;
let servo0Center;        // worked out in setup(): the middle of min and max

// servo 1's range
let servo1Min = 30;
let servo1Max = 150;
let servo1Center;

// attached (true) or detached (false)
let servoAttach0 = false;
let servoAttach1 = false;

// the two boxes
let box0X, box0Y, box0W, box0H;  // left box: servo 0
let box1X, box1Y, box1W, box1H;  // right box: servo 1

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textFont('sans-serif');

  servo0Center = (servo0Min + servo0Max) / 2;
  servo1Center = (servo1Min + servo1Max) / 2;

  connectButton = createButton('Connect');
  connectButton.position(20, 20);
  connectButton.mousePressed(connectOrDisconnect);

  // Web Serial only exists in Chrome and Edge
  if ('serial' in navigator) {
    port = createSerial();
  }

  // the boxes, in different sizes
  box0X = 100;
  box0Y = 150;
  box0W = 200;
  box0H = 150;

  box1X = width - 350;
  box1Y = 170;
  box1W = 250;
  box1H = 120;
}

function draw() {
  background(245);

  // is the mouse inside either box?
  let box0Active = collidePointRect(mouseX, mouseY, box0X, box0Y, box0W, box0H);
  let box1Active = collidePointRect(mouseX, mouseY, box1X, box1Y, box1W, box1H);

  if (box0Active) {
    // box 0: servo 0 wiggles, servo 1 is detached where it stopped
    // deltaTime is the milliseconds since the last frame
    wavePos0 = wavePos0 + deltaTime / waveSpeed0;
    servoAngle0 = getWaveAngle(wavePos0, servo0Min, servo0Max, servo0Center);
    servoAttach0 = true;
    servoAttach1 = false;
  } else if (box1Active) {
    // box 1: servo 1 wiggles, servo 0 is detached where it stopped
    wavePos1 = wavePos1 + deltaTime / waveSpeed1;
    servoAngle1 = getWaveAngle(wavePos1, servo1Min, servo1Max, servo1Center);
    servoAttach0 = false;
    servoAttach1 = true;
  } else {
    // no box: both servos are detached where they stopped
    servoAttach0 = false;
    servoAttach1 = false;
  }

  drawBox(box0X, box0Y, box0W, box0H, 'Servo 0', box0Active);
  drawBox(box1X, box1Y, box1W, box1H, 'Servo 1', box1Active);
  drawServos();

  if (port) {
    readFromFeather();
    sendAngles();
  }

  drawStatusBar('Hold the mouse over a box to wiggle that servo. Servos with no box under the mouse go limp.');
}

function getWaveAngle(wavePos, minAngle, maxAngle, centerAngle) {
  // how far the wave swings either side of the centre
  let amplitude = (maxAngle - minAngle) / 2;

  // a sine wave: one full wiggle (centre, max, centre, min, centre)
  // each time wavePos goes up by 1
  let value = sin(360 * wavePos) * amplitude + centerAngle;

  // keep it inside the limits
  return round(constrain(value, minAngle, maxAngle));
}

// one number per servo: its angle when attached, -1 when detached
function makeLine() {
  let value0;
  if (servoAttach0) {
    value0 = servoAngle0;  // attached: send its angle
  } else {
    value0 = -1;           // detached: -1 makes it go limp
  }

  let value1;
  if (servoAttach1) {
    value1 = servoAngle1;
  } else {
    value1 = -1;
  }

  return value0 + ',' + value1;  // for example "-1,72"
}
// ---- Serial ----

function connectOrDisconnect() {
  if (!port) {
    return;
  }
  if (port.opened()) {
    port.close();
  } else {
    port.open(115200); // opens Chrome's list of ports: pick the Feather
  }
}

function sendAngles() {
  if (!port.opened()) {
    connectButton.html('Connect');
    lastLine = '';       // so the angles are sent again after connecting
    return;
  }
  connectButton.html('Disconnect');

  // only send when the line changed, and not more often than sendEvery
  let dataString = makeLine();
  if (dataString !== lastLine && millis() - lastSend >= sendEvery) {
    port.print(dataString + '\n');
    lastLine = dataString;
    lastSend = millis();
  }
}

// keep the Feather's last message, and send the angles again:
// the Feather may have just restarted and missed them
function readFromFeather() {
  let message = port.readUntil('\n');
  if (message.length > 0) {
    featherSays = message.trim();
    lastLine = '';
  }
}

// ---- The status bar ----

// along the top: whether the Feather is connected, the last line sent to it,
// the last message it sent back, and how to use this sketch
function drawStatusBar(instructions) {
  noStroke();
  fill(255);
  rect(0, 0, width, 90);

  textSize(15);
  textAlign(LEFT, CENTER);

  // a green dot when connected, red when not
  if (port && port.opened()) {
    fill(40, 170, 80);
    circle(132, 32, 14);
    fill(40);
    text('Connected', 146, 32);
  } else {
    fill(210, 60, 60);
    circle(132, 32, 14);
    fill(40);
    if (port) {
      text('Not connected: click Connect and choose the Feather', 146, 32);
    } else {
      text('No Web Serial: open this page in Chrome or Edge', 146, 32);
    }
  }

  // what went to the Feather, and what came back
  fill(120);
  text('Sent:', 20, 66);
  text('Feather:', 400, 66);
  fill(40);
  textFont('monospace');
  text(lastLine, 70, 66);
  text(featherSays, 470, 66);
  textFont('sans-serif');

  fill(110);
  text(instructions, 20, 115);
}
// ---- Drawing ----

// a box: shaded with a blue outline while the mouse is over it
function drawBox(x, y, w, h, label, active) {
  if (active) {
    fill(225, 236, 250);
    stroke(30, 120, 220);
    strokeWeight(3);
  } else {
    fill(255);
    stroke(200);
    strokeWeight(1);
  }
  rect(x, y, w, h, 10);

  noStroke();
  fill(40);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
}

function drawServos() {
  let y = height - 70;
  drawRange(width / 4, y, 90, servo0Min, servo0Max);
  drawServo(width / 4, y, 90, 'Servo 0', servoAngle0, servoAttach0);
  drawRange(3 * width / 4, y, 90, servo1Min, servo1Max);
  drawServo(3 * width / 4, y, 90, 'Servo 1', servoAngle1, servoAttach1);
}

// one servo as a half circle: 0° on the left, 90° at the top, 180° on the right.
// Attached: a blue pointer and its angle. Detached: a grey pointer and LIMP
function drawServo(x, y, r, label, angle, attached) {
  // the track
  noFill();
  stroke(225);
  strokeWeight(12);
  arc(x, y, r * 2, r * 2, 180, 360);

  // blue when attached, grey when limp
  let c = color(170);
  if (attached) {
    c = color(30, 120, 220);
  }

  // the pointer, from the centre out to the angle
  let px = x + cos(180 + angle) * r;
  let py = y + sin(180 + angle) * r;
  stroke(c);
  strokeWeight(4);
  line(x, y, px, py);
  noStroke();
  fill(c);
  circle(px, py, 24);
  circle(x, y, 10);

  // the name above, the angle (or LIMP) below
  textAlign(CENTER, CENTER);
  fill(40);
  textSize(16);
  text(label, x, y - r - 40);
  textSize(28);
  if (attached) {
    text(angle + '°', x, y + 30);
  } else {
    fill(150);
    text('LIMP', x, y + 30);
  }
}
// a thin arc just outside the half circle: the range a servo moves through
function drawRange(x, y, r, minAngle, maxAngle) {
  noFill();
  stroke(150, 190, 240);
  strokeWeight(5);
  arc(x, y, r * 2 + 30, r * 2 + 30, 180 + minAngle, 180 + maxAngle);

  noStroke();
  fill(120);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(minAngle + '°', x + cos(180 + minAngle) * (r + 32), y + sin(180 + minAngle) * (r + 32));
  text(maxAngle + '°', x + cos(180 + maxAngle) * (r + 32), y + sin(180 + maxAngle) * (r + 32));
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  box1X = width - 350;  // keep box 1 on the right
}
