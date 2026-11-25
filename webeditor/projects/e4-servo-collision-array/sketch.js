/*
Servo Example 5b: Collision Array
Four boxes, kept in an array: two for each servo, one slow and one fast. Hold the mouse
over a box and that servo wiggles at that box's speed. A servo with no box under the
mouse is detached (limp).

Each box is an object: {x, y, w, h, servo, speed, label}. To add a box, push
another one onto the array in setup().

collidePointRect() comes from the p5.collide2D library (loaded in index.html):
it is true when a point (the mouse) is inside a rectangle (a box).
https://github.com/bmoren/p5.collide2D

Detaching: send -1 in place of that servo's angle. "-1,90\n" makes servo 0 limp and
moves servo 1 to 90.

The servos plug into headers 0 and 1 of the Servo FeatherWing.
Works with the servoWingTest Arduino sketch (on Canvas). Use Chrome or Edge.

The bar along the top shows whether the Feather is connected, the last line sent to
it, and the last message it sent back.
*/

let port;                // the serial connection to the Feather
let connectButton;
let lastLine = '';       // the last line sent to the Feather
let featherSays = '';    // the last message the Feather sent back
let lastSend = 0;        // when we last sent, in milliseconds
let sendEvery = 30;      // send at most every 30 ms (the Feather needs about 15 ms)
let servoAngle0 = 90;    // the angle for the servo on header 0
let servoAngle1 = 90;    // the angle for the servo on header 1

// attached (true) or detached (false)
let servoAttach0 = false;
let servoAttach1 = false;

// each servo's range
let servo0Min = 45;
let servo0Max = 135;
let servo0Center;        // worked out in setup(): the middle of min and max

let servo1Min = 30;
let servo1Max = 150;
let servo1Center;

// how far through its wave each servo is (1 = one full wiggle). It only moves on
// while that servo is wiggling, so a servo carries on from where it stopped
let wavePos0 = 0;
let wavePos1 = 0;

// the boxes: each one moves one servo at its own speed
let boxes = [];

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

  // 4 boxes: 2 for servo 0, 2 for servo 1
  // box format: {x, y, w, h, servo, speed, label}
  boxes.push({ x: 100, y: 150, w: 150, h: 120, servo: 0, speed: 3000, label: 'Servo 0\nslow' });
  boxes.push({ x: 300, y: 150, w: 120, h: 150, servo: 0, speed: 1000, label: 'Servo 0\nfast' });
  boxes.push({ x: width - 420, y: 150, w: 120, h: 150, servo: 1, speed: 2500, label: 'Servo 1\nslow' });
  boxes.push({ x: width - 250, y: 150, w: 150, h: 120, servo: 1, speed: 800, label: 'Servo 1\nfast' });
}

function draw() {
  background(245);

  // the box under the mouse for each servo (null when there isn't one)
  let activeBox0 = null;
  let activeBox1 = null;
  for (let box of boxes) {
    if (collidePointRect(mouseX, mouseY, box.x, box.y, box.w, box.h)) {
      if (box.servo === 0) {
        activeBox0 = box;
      } else if (box.servo === 1) {
        activeBox1 = box;
      }
    }
  }

  // servo 0: wiggle at the box's speed, or wait where it stopped, detached
  if (activeBox0) {
    // deltaTime is the milliseconds since the last frame
    wavePos0 = wavePos0 + deltaTime / activeBox0.speed;
    servoAngle0 = getWaveAngle(wavePos0, servo0Min, servo0Max, servo0Center);
    servoAttach0 = true;
  } else {
    servoAttach0 = false;
  }

  // servo 1: the same
  if (activeBox1) {
    wavePos1 = wavePos1 + deltaTime / activeBox1.speed;
    servoAngle1 = getWaveAngle(wavePos1, servo1Min, servo1Max, servo1Center);
    servoAttach1 = true;
  } else {
    servoAttach1 = false;
  }

  // each box, with its speed in the label
  for (let box of boxes) {
    let active = box === activeBox0 || box === activeBox1;
    drawBox(box.x, box.y, box.w, box.h, box.label + '\n' + box.speed + ' ms', active);
  }
  drawServos();

  if (port) {
    readFromFeather();
    sendAngles();
  }

  drawStatusBar('Hold the mouse over a box to move that servo at that speed. Servos with no box under the mouse go limp.');
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

  // keep servo 1's boxes on the right
  boxes[2].x = width - 420;
  boxes[3].x = width - 250;
}
