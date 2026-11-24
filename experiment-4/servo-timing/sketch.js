/*
Servo Example 3: Timing and Motion
Click to give both servos a new target: the mouse's X position sets servo 0's target,
its Y position sets servo 1's. Each servo then moves smoothly to its target in the time
set by servo0MoveTime / servo1MoveTime (in milliseconds), however far it has to go.

A Servo class keeps track of each servo's current angle, its target and its timing.
The pale line shows the target, the solid line where the servo is now.

The servos plug into headers 0 and 1 of the Servo FeatherWing.
Works with the servoWingTest Arduino sketch (on Canvas). Use Chrome or Edge.
The message to the Feather is the two angles, then a newline: "90,45\n"

How the movement works:
- every movement takes exactly moveTime milliseconds
- a new target can be set while a servo is still moving
- lerp() works out the angle between the start and the target
*/

let port;                // the serial connection to the Feather
let connectButton;
let status = 'Not connected';

let servo0;              // the servo on header 0
// how long each move takes, in milliseconds: bigger numbers move slower
// (1000 = 1 second, whether the servo turns 10 degrees or 180)
let servo0MoveTime = 1000;
let servo1;              // the servo on header 1
let servo1MoveTime = 1000;

let lastLine = '';       // the last line sent, so we only send changes
let lastSend = 0;        // when we last sent, in milliseconds
let sendEvery = 30;      // send at most every 30 ms (the Feather needs about 15 ms)

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  // both servos start at 90
  servo0 = new Servo(90, servo0MoveTime);
  servo1 = new Servo(90, servo1MoveTime);

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

  servo0.moveTime = servo0MoveTime;
  servo1.moveTime = servo1MoveTime;
  servo0.update();
  servo1.update();

  drawVisualElements();
  displayText();

  if (port) {
    readFromFeather();
    sendAngles();
  }
}

// ---- The Servo class ----

class Servo {
  constructor(startAngle, moveTime) {
    this.currentAngle = startAngle;   // where the servo is now
    this.targetAngle = startAngle;    // where it is going
    this.moveTime = moveTime;         // milliseconds for any movement
    this.moveStartTime = 0;           // when the current movement began
    this.moveStartAngle = startAngle; // where the current movement began
    this.isMoving = false;            // whether the servo is moving
  }

  setTarget(newTarget) {
    newTarget = constrain(newTarget, 0, 180);
    if (newTarget !== this.currentAngle) {
      this.targetAngle = newTarget;
      this.moveStartAngle = this.currentAngle;
      this.moveStartTime = millis();
      this.isMoving = true;
    }
  }

  update() {
    if (this.isMoving) {
      // how long since the movement started
      let elapsed = millis() - this.moveStartTime;

      // how far through the movement we are, from 0 to 1
      // 0 = just started, 0.5 = halfway, 1 = finished
      let progress = min(elapsed / this.moveTime, 1);

      // lerp() finds the angle that far between the start and the target
      // for example, from 0 to 180 with progress 0.5: 0 + (180 - 0) * 0.5 = 90
      this.currentAngle = lerp(this.moveStartAngle, this.targetAngle, progress);

      if (progress >= 1) {
        this.isMoving = false;
        this.currentAngle = this.targetAngle;  // land exactly on the target
      }
    }
  }

  getCurrentAngle() {
    return round(this.currentAngle);
  }

  getTargetAngle() {
    return round(this.targetAngle);
  }
}

// a click sets new targets (not on the Connect button)
function mousePressed() {
  if (mouseY < 60 && mouseX < 140) {
    return;
  }
  let targetX = map(mouseX, 0, width, 0, 180);
  let targetY = map(mouseY, 0, height, 0, 180);
  servo0.setTarget(targetX);
  servo1.setTarget(targetY);
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

  // comma-separated angles with a newline at the end, for example "90,180\n"
  let dataString = servo0.getCurrentAngle() + ',' + servo1.getCurrentAngle();

  // only send when the angles changed, and not more often than sendEvery
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

function drawVisualElements() {
  // crosshairs that follow the mouse
  stroke(0, 100);
  strokeWeight(1);
  line(mouseX, 0, mouseX, height);
  line(0, mouseY, width, mouseY);

  let centerX = width / 2;
  let centerY = height / 2;
  drawServo(centerX - 100, centerY, servo0, 'Servo 0', color(255, 0, 0));
  drawServo(centerX + 100, centerY, servo1, 'Servo 1', color(0, 0, 255));
}

// the target as a pale line, the current angle as a solid one
function drawServo(x, y, servo, label, c) {
  let target = servo.getTargetAngle();
  let current = servo.getCurrentAngle();

  stroke(red(c), green(c), blue(c), 100);
  line(x, y, x + cos(target) * 50, y - sin(target) * 50);

  stroke(c);
  line(x, y, x + cos(current) * 50, y - sin(current) * 50);

  noStroke();
  fill(c);
  textSize(14);
  textAlign(CENTER);
  text(label, x - 30, y - 60);
  text('Current: ' + current + '°', x + cos(current) * 65, y - sin(current) * 65 + 15);
  fill(red(c), green(c), blue(c), 100);
  text('Target: ' + target + '°', x + cos(target) * 65, y - sin(target) * 65 + 30);
}

function displayText() {
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(16);
  text(status, 120, 24);
  text('Mouse X: ' + round(mouseX) + ' px', 20, 60);
  text('Mouse Y: ' + round(mouseY) + ' px', 20, 80);
  text('Click to set new servo positions', 20, 100);
  text('Servo 0 move time: ' + servo0.moveTime + ' ms', 20, 120);
  text('Servo 1 move time: ' + servo1.moveTime + ' ms', 20, 140);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
