/*
Servo Example 5b: Collision Array
Four boxes, kept in an array: two for each servo, one slow and one fast. Hold the mouse
over a box and that servo wiggles at that box's speed. A servo with no box under the
mouse is detached (limp).

Each box is an object: {x, y, w, h, servo, speed, label, color}. To add a box, push
another one onto the array in setup().

collidePointRect() comes from the p5.collide2D library (loaded in index.html):
it is true when a point (the mouse) is inside a rectangle (a box).
https://github.com/bmoren/p5.collide2D

Detaching: send -1 in place of that servo's angle. "-1,90\n" makes servo 0 limp and
moves servo 1 to 90.

The servos plug into headers 0 and 1 of the Servo FeatherWing.
Works with the servoWingTest Arduino sketch (on Canvas). Use Chrome or Edge.
*/

let port;                // the serial connection to the Feather
let connectButton;
let status = 'Not connected';

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

let lastLine = '';       // the last line sent, so we only send changes
let lastSend = 0;        // when we last sent, in milliseconds
let sendEvery = 30;      // send at most every 30 ms (the Feather needs about 15 ms)

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  servo0Center = (servo0Min + servo0Max) / 2;
  servo1Center = (servo1Min + servo1Max) / 2;

  connectButton = createButton('Connect');
  connectButton.position(20, 20);
  connectButton.mousePressed(connectOrDisconnect);

  // Web Serial only exists in Chrome and Edge
  if ('serial' in navigator) {
    port = createSerial();
  } else {
    status = 'This browser has no Web Serial: open the page in Chrome or Edge';
  }

  // 4 boxes: 2 for servo 0, 2 for servo 1
  // box format: {x, y, w, h, servo, speed, label, color}
  boxes.push({
    x: 100, y: 150, w: 150, h: 120,
    servo: 0, speed: 3000, label: 'Servo 0\nSLOW',
    color: [255, 200, 200]
  });

  boxes.push({
    x: 300, y: 150, w: 120, h: 150,
    servo: 0, speed: 1000, label: 'Servo 0\nFAST',
    color: [255, 150, 150]
  });

  boxes.push({
    x: width - 420, y: 150, w: 120, h: 150,
    servo: 1, speed: 2500, label: 'Servo 1\nSLOW',
    color: [200, 200, 255]
  });

  boxes.push({
    x: width - 250, y: 150, w: 150, h: 120,
    servo: 1, speed: 800, label: 'Servo 1\nFAST',
    color: [150, 150, 255]
  });
}

function draw() {
  background(220);

  // which boxes is the mouse over? (boxes can overlap, so there can be more than one)
  let activeBoxes = [];
  for (let box of boxes) {
    if (collidePointRect(mouseX, mouseY, box.x, box.y, box.w, box.h)) {
      activeBoxes.push(box);
    }
  }

  // the active box for each servo (the last one, if there are several)
  let activeBox0 = null;
  let activeBox1 = null;
  for (let box of activeBoxes) {
    if (box.servo === 0) {
      activeBox0 = box;
    } else if (box.servo === 1) {
      activeBox1 = box;
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

  drawBoxes(activeBoxes);
  drawServoVisualizations();
  displayStatus();

  if (port) {
    readFromFeather();
    sendAngles();
  }
}

function getWaveAngle(wavePos, minAngle, maxAngle, centerAngle) {
  let amplitude = (maxAngle - minAngle) / 2;
  let value = sin(360 * wavePos) * amplitude + centerAngle;
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
    status = 'Not connected';
    connectButton.html('Connect');
    return;
  }
  connectButton.html('Disconnect');

  // only send when the line changed, and not more often than sendEvery
  let dataString = makeLine();
  if (dataString !== lastLine && millis() - lastSend >= sendEvery) {
    port.print(dataString + '\n');
    status = 'Sent: ' + dataString;
    lastLine = dataString;
    lastSend = millis();
  }
}

// show any message from the Feather, and send the angles again:
// the Feather may have just restarted and missed them
function readFromFeather() {
  let message = port.readUntil('\n');
  if (message.length > 0) {
    status = 'Feather: ' + message.trim();
    lastLine = '';
  }
}

// ---- Drawing ----

function drawBoxes(activeBoxes) {
  for (let box of boxes) {
    let isActive = activeBoxes.includes(box);

    if (isActive) {
      fill(box.color[0], box.color[1], box.color[2]);
      strokeWeight(4);
      stroke(0);
    } else {
      fill(box.color[0], box.color[1], box.color[2], 100);
      strokeWeight(1);
      stroke(150);
    }
    rect(box.x, box.y, box.w, box.h, 10);

    // the label
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text(box.label, box.x + box.w / 2, box.y + box.h / 2);

    // the speed
    textSize(12);
    fill(100);
    text(box.speed + 'ms', box.x + box.w / 2, box.y + box.h - 20);
  }
}

function drawServoVisualizations() {
  let centerY = height - 100;
  drawServo(width / 4, centerY, servoAngle0, servoAttach0, servo0Min, servo0Max,
            color(255, 0, 0), color(255, 200, 200));
  drawServo(3 * width / 4, centerY, servoAngle1, servoAttach1, servo1Min, servo1Max,
            color(0, 0, 255), color(200, 200, 255));
}

// the full half circle, the servo's range and the current angle:
// coloured when attached, grey when detached
function drawServo(x, y, angle, attached, minAngle, maxAngle, c, pale) {
  push();
  translate(x, y);

  stroke(200);
  strokeWeight(1);
  fill(255);
  arc(0, 0, 80, 80, 0, 180);

  noFill();
  stroke(pale);
  arc(0, 0, 90, 90, minAngle, maxAngle);

  if (attached) {
    stroke(c);
    strokeWeight(3);
  } else {
    stroke(150);
    strokeWeight(2);
  }
  line(0, 0, cos(angle - 90) * 40, -sin(angle - 90) * 40);

  noStroke();
  if (attached) {
    fill(c);
  } else {
    fill(150);
  }
  textAlign(CENTER);
  textSize(14);
  text(angle + '°', 0, 50);
  textSize(12);
  if (attached) {
    text('ATTACHED', 0, 65);
  } else {
    text('DETACHED', 0, 65);
  }

  pop();
}

function displayStatus() {
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(16);
  text(status, 120, 24);
  textSize(14);
  text('Hold the mouse over a box to move that servo at that speed', 20, 60);
  text('Servos with no box under the mouse are detached.', 20, 80);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // keep servo 1's boxes on the right
  boxes[2].x = width - 420;
  boxes[3].x = width - 250;
}
