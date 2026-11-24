/*
Servo Example 1: Mouse X Y to Servo Rotation
Two servos follow the mouse: the mouse's X position sets servo 0, its Y position sets
servo 1. Each position is mapped to an angle from 0 to 180.

The servos plug into headers 0 and 1 of the Servo FeatherWing.
Works with the servoWingTest Arduino sketch (on Canvas). Use Chrome or Edge.

The message to the Feather is the two angles, then a newline: "90,45\n"
The wing's other channels (2 to 7) stay as they are.

Key functions:
- updateServoValues(): maps the mouse position to angles from 0 to 180
- sendAngles(): sends the angles when they change, at most every 30 ms
- drawVisualElements(): crosshairs, and an arc and a line for each servo
*/

let port;                // the serial connection to the Feather
let connectButton;
let status = 'Not connected';

let servoAngle0 = 90;    // the angle for the servo on header 0
let servoAngle1 = 90;    // the angle for the servo on header 1

let changed = true;      // true when the angles need sending
let lastSend = 0;        // when we last sent, in milliseconds
let sendEvery = 30;      // send at most every 30 ms (the Feather needs about 15 ms)

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

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

  updateServoValues();
  drawVisualElements();
  displayText();

  if (port) {
    readFromFeather();
    sendAngles();
  }
}

function updateServoValues() {
  // X position controls servo 0, Y position controls servo 1
  let newAngle0 = round(map(mouseX, 0, width, 0, 180));
  let newAngle1 = round(map(mouseY, 0, height, 0, 180));

  // keep the values inside the range a servo can turn
  newAngle0 = constrain(newAngle0, 0, 180);
  newAngle1 = constrain(newAngle1, 0, 180);

  if (newAngle0 !== servoAngle0 || newAngle1 !== servoAngle1) {
    servoAngle0 = newAngle0;
    servoAngle1 = newAngle1;
    changed = true;
  }
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

  // only send when something changed, and not more often than sendEvery
  if (changed && millis() - lastSend >= sendEvery) {
    // comma-separated angles with a newline at the end, for example "90,180\n"
    let dataString = servoAngle0 + ',' + servoAngle1;
    port.print(dataString + '\n');
    status = 'Sent: ' + dataString;
    lastSend = millis();
    changed = false;
  }
}

// show any message from the Feather, and send the angles again:
// the Feather may have just restarted and missed them
function readFromFeather() {
  let message = port.readUntil('\n');
  if (message.length > 0) {
    status = 'Feather: ' + message.trim();
    changed = true;
  }
}

// ---- Drawing ----

function drawVisualElements() {
  // crosshairs that follow the mouse
  stroke(0);
  strokeWeight(1);
  line(mouseX, 0, mouseX, height);
  line(0, mouseY, width, mouseY);

  let centerX = width / 2;
  let centerY = height / 2;

  drawServo(centerX - 100, centerY, servoAngle0, 'Servo 0', color(255, 0, 0));
  drawServo(centerX + 100, centerY, servoAngle1, 'Servo 1', color(0, 0, 255));
}

// an arc for the angle, a line pointing at it, and the angle in degrees
function drawServo(x, y, angle, label, c) {
  stroke(c);
  noFill();
  arc(x, y, 100, 100, 0, angle + 0.1);

  let endX = x + cos(angle) * 50;
  let endY = y - sin(angle) * 50;
  line(x, y, endX, endY);

  noStroke();
  fill(c);
  textSize(14);
  textAlign(CENTER);
  text(label, x - 30, y - 60);
  text(angle + '°', x + cos(angle) * 65, y - sin(angle) * 65 + 15);
}

function displayText() {
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(16);
  text(status, 120, 24);
  text('Mouse X: ' + round(mouseX) + ' px', 20, 60);
  text('Mouse Y: ' + round(mouseY) + ' px', 20, 80);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
