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

To extend this example:
- Add more boxes for more servos
- Give each box its own wave speed (see Example 5b, Collision Array)
*/

let port;                // the serial connection to the Feather
let connectButton;
let status = 'Not connected';

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

  // the boxes, in different sizes
  box0X = 100;
  box0Y = 150;
  box0W = 200;
  box0H = 150;

  box1X = width - 350;
  box1Y = 200;
  box1W = 250;
  box1H = 120;
}

function draw() {
  background(220);

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

  drawBoxes(box0Active, box1Active);
  displayText();
  drawServoVisualizations();

  if (port) {
    readFromFeather();
    sendAngles();
  }
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

function drawBoxes(box0Active, box1Active) {
  // box 0 (servo 0)
  if (box0Active) {
    fill(255, 200, 200);
    strokeWeight(4);
    stroke(255, 0, 0);
  } else {
    fill(255, 200, 200, 100);
    strokeWeight(2);
    stroke(200);
  }
  rect(box0X, box0Y, box0W, box0H, 10);

  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  text('Servo 0 Zone', box0X + box0W / 2, box0Y + box0H / 2);

  // box 1 (servo 1)
  if (box1Active) {
    fill(200, 200, 255);
    strokeWeight(4);
    stroke(0, 0, 255);
  } else {
    fill(200, 200, 255, 100);
    strokeWeight(2);
    stroke(200);
  }
  rect(box1X, box1Y, box1W, box1H, 10);

  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  text('Servo 1 Zone', box1X + box1W / 2, box1Y + box1H / 2);
}

function drawServoVisualizations() {
  let centerY = height - 120;
  drawServo(width / 4, centerY, servoAngle0, servoAttach0, servo0Min, servo0Max,
            color(255, 0, 0), color(255, 200, 200));
  drawServo(3 * width / 4, centerY, servoAngle1, servoAttach1, servo1Min, servo1Max,
            color(0, 0, 255), color(200, 200, 255));
}

// the full half circle, the servo's range, its min and max, and the current angle:
// coloured when attached, grey when detached
function drawServo(x, y, angle, attached, minAngle, maxAngle, c, pale) {
  stroke(200);
  strokeWeight(1);
  fill(255);
  arc(x, y, 80, 80, 0, 180);

  noFill();
  stroke(pale);
  arc(x, y, 90, 90, minAngle, maxAngle);

  stroke(red(c), green(c), blue(c), 100);
  line(x, y, x + cos(minAngle - 90) * 45, y - sin(minAngle - 90) * 45);
  line(x, y, x + cos(maxAngle - 90) * 45, y - sin(maxAngle - 90) * 45);

  if (attached) {
    stroke(c);
    strokeWeight(3);
  } else {
    stroke(150);
    strokeWeight(2);
  }
  line(x, y, x + cos(angle - 90) * 40, y - sin(angle - 90) * 40);

  noStroke();
  fill(c);
  textSize(12);
  textAlign(CENTER);
  text(minAngle + '°', x + cos(minAngle - 90) * 55, y - sin(minAngle - 90) * 55);
  text(maxAngle + '°', x + cos(maxAngle - 90) * 55, y - sin(maxAngle - 90) * 55);
}

function displayText() {
  fill(0);
  noStroke();
  textAlign(LEFT);
  textSize(16);
  text(status, 120, 37);

  let status0 = ' [DETACHED - IDLE]';
  if (servoAttach0) {
    status0 = ' [ATTACHED - MOVING]';
  }
  let status1 = ' [DETACHED - IDLE]';
  if (servoAttach1) {
    status1 = ' [ATTACHED - MOVING]';
  }
  text('Servo 0 angle: ' + servoAngle0 + '° (range: ' + servo0Min + '° - ' + servo0Max + '°)' + status0, 20, height - 60);
  text('Servo 1 angle: ' + servoAngle1 + '° (range: ' + servo1Min + '° - ' + servo1Max + '°)' + status1, 20, height - 40);

  fill(100);
  textSize(14);
  text('Hold the mouse over a box to move that servo. Idle servos are detached.', 20, height - 15);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  box1X = width - 350;  // keep box 1 on the right
}
