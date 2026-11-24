/*
Servo Example 4: Wiggle with Attach / Detach
Like Example 2: with the mouse on the left half, servo 0 wiggles; on the right half,
servo 1 wiggles. The servo that isn't moving is detached: it gets no signal, so it goes
limp. That saves power and stops it buzzing while it waits.

Detaching: send -1 in place of that servo's angle. "-1,90\n" makes servo 0 limp and
moves servo 1 to 90. Sending an angle again attaches it, and it jumps to that angle.

Change waveSpeed0 / waveSpeed1 (milliseconds for one wiggle) and the min / max values
to change the speed and range of motion.

The servos plug into headers 0 and 1 of the Servo FeatherWing.
Works with the servoWingTest Arduino sketch (on Canvas). Use Chrome or Edge.
*/

let port;                // the serial connection to the Feather
let connectButton;
let status = 'Not connected';

let servoAngle0 = 90;    // the angle for the servo on header 0
let servoAngle1 = 90;    // the angle for the servo on header 1
let waveSpeed0 = 2000;   // one wiggle of servo 0, in milliseconds
let waveSpeed1 = 2000;   // one wiggle of servo 1, in milliseconds

// servo 0's range
let servo0Min = 45;
let servo0Max = 135;
let servo0Center;        // worked out in setup(): the middle of min and max

// servo 1's range
let servo1Min = 30;
let servo1Max = 150;
let servo1Center;

// attached (true) or detached (false)
let servoAttach0 = true;
let servoAttach1 = true;

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
}

function draw() {
  background(220);

  // the line between the two zones
  stroke(0);
  strokeWeight(1);
  line(width / 2, 0, width / 2, height);

  if (mouseX < width / 2) {
    // left side: servo 0 wiggles, servo 1 is detached
    servoAngle0 = getWaveAngle(waveSpeed0, servo0Min, servo0Max, servo0Center);
    servoAngle1 = servo1Center;
    servoAttach0 = true;
    servoAttach1 = false;
    drawActiveZone(true);
  } else {
    // right side: servo 1 wiggles, servo 0 is detached
    servoAngle0 = servo0Center;
    servoAngle1 = getWaveAngle(waveSpeed1, servo1Min, servo1Max, servo1Center);
    servoAttach0 = false;
    servoAttach1 = true;
    drawActiveZone(false);
  }

  displayText();
  drawServoVisualizations();

  if (port) {
    readFromFeather();
    sendAngles();
  }
}

function getWaveAngle(speedMS, minAngle, maxAngle, centerAngle) {
  // how far the wave swings either side of the centre
  let amplitude = (maxAngle - minAngle) / 2;

  // a sine wave that goes from minAngle to maxAngle and back once every speedMS
  let value = sin(360 * (millis() / speedMS)) * amplitude + centerAngle;

  // keep it inside the limits
  return round(constrain(value, minAngle, maxAngle));
}

// one number per servo: its angle when attached, -1 when detached
function makeLine() {
  let value0 = servoAttach0 ? servoAngle0 : -1;
  let value1 = servoAttach1 ? servoAngle1 : -1;
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

function drawActiveZone(isLeft) {
  noFill();
  stroke(255, 0, 0);
  strokeWeight(3);
  if (isLeft) {
    rect(0, 0, width / 2, height);
  } else {
    rect(width / 2, 0, width / 2, height);
  }
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

  let status0 = servoAttach0 ? ' [ATTACHED - MOVING]' : ' [DETACHED - IDLE]';
  let status1 = servoAttach1 ? ' [ATTACHED - MOVING]' : ' [DETACHED - IDLE]';
  text('Servo 0 angle: ' + servoAngle0 + '° (range: ' + servo0Min + '° - ' + servo0Max + '°)' + status0, 20, height - 60);
  text('Servo 1 angle: ' + servoAngle1 + '° (range: ' + servo1Min + '° - ' + servo1Max + '°)' + status1, 20, height - 40);

  fill(100);
  textSize(14);
  text('Move the mouse left or right to choose which servo wiggles. The idle servo is detached.', 20, height - 15);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
