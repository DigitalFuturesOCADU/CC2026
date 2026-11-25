/*
Servo Example 3: Timing and Motion
Click to give both servos a new target: the mouse's X position sets servo 0's target,
its Y position sets servo 1's. Each servo then moves smoothly to its target in the time
set by servo0MoveTime / servo1MoveTime (in milliseconds), however far it has to go.

A Servo class keeps track of each servo's current angle, its target and its timing.
The ring shows the target, the pointer where the servo is now.

The servos plug into headers 0 and 1 of the Servo FeatherWing.
Works with the servoWingTest Arduino sketch (on Canvas). Use Chrome or Edge.
The message to the Feather is the two angles, then a newline: "90,45\n"

The bar along the top shows whether the Feather is connected, the last line sent to
it, and the last message it sent back.

How the movement works:
- every movement takes exactly moveTime milliseconds
- a new target can be set while a servo is still moving
- lerp() works out the angle between the start and the target
*/

let port;                // the serial connection to the Feather
let connectButton;
let lastLine = '';       // the last line sent to the Feather
let featherSays = '';    // the last message the Feather sent back
let lastSend = 0;        // when we last sent, in milliseconds
let sendEvery = 30;      // send at most every 30 ms (the Feather needs about 15 ms)
let servo0;              // the servo on header 0
// how long each move takes, in milliseconds: bigger numbers move slower
// (1000 = 1 second, whether the servo turns 10 degrees or 180)
let servo0MoveTime = 1000;
let servo1;              // the servo on header 1
let servo1MoveTime = 1000;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textFont('sans-serif');

  // both servos start at 90
  servo0 = new Servo(90, servo0MoveTime);
  servo1 = new Servo(90, servo1MoveTime);

  connectButton = createButton('Connect');
  connectButton.position(20, 20);
  connectButton.mousePressed(connectOrDisconnect);

  // Web Serial only exists in Chrome and Edge
  if ('serial' in navigator) {
    port = createSerial();
  }
}

function draw() {
  background(245);

  servo0.moveTime = servo0MoveTime;
  servo1.moveTime = servo1MoveTime;
  servo0.update();
  servo1.update();

  // crosshairs that follow the mouse
  stroke(210);
  strokeWeight(1);
  line(mouseX, 0, mouseX, height);
  line(0, mouseY, width, mouseY);

  let y = height / 2 + 80;
  drawTarget(width / 2 - 170, y, 110, servo0);
  drawServo(width / 2 - 170, y, 110, 'Servo 0', servo0.getCurrentAngle(), true);
  drawTarget(width / 2 + 170, y, 110, servo1);
  drawServo(width / 2 + 170, y, 110, 'Servo 1', servo1.getCurrentAngle(), true);

  if (port) {
    readFromFeather();
    sendAngles();
  }

  drawStatusBar('Click to set new targets: the mouse X for servo 0, the mouse Y for servo 1.');
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

// a click sets new targets (not on the status bar at the top)
function mousePressed() {
  if (mouseY < 90) {
    return;
  }
  let targetX = map(mouseX, 0, width, 0, 180);
  let targetY = map(mouseY, 0, height, 0, 180);
  servo0.setTarget(round(targetX));
  servo1.setTarget(round(targetY));
}

// the two current angles with a comma between them, for example "90,45"
function makeLine() {
  return servo0.getCurrentAngle() + ',' + servo1.getCurrentAngle();
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

// one servo as a half circle: 0° on the left, 90° at the top, 180° on the right.
// Attached: a blue pointer and its angle. Detached: a grey pointer and FREE
function drawServo(x, y, r, label, angle, attached) {
  // the track
  noFill();
  stroke(225);
  strokeWeight(12);
  arc(x, y, r * 2, r * 2, 180, 360);

  // blue when attached, grey when free
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

  // the name above, the angle (or FREE) below
  textAlign(CENTER, CENTER);
  fill(40);
  textSize(16);
  text(label, x, y - r - 40);
  textSize(28);
  if (attached) {
    text(angle + '°', x, y + 30);
  } else {
    fill(150);
    text('FREE', x, y + 30);
  }
}
// a ring where the servo is heading, and its target and move time under it
function drawTarget(x, y, r, servo) {
  let target = servo.getTargetAngle();
  noFill();
  stroke(30, 120, 220, 110);
  strokeWeight(3);
  circle(x + cos(180 + target) * r, y + sin(180 + target) * r, 36);

  noStroke();
  fill(110);
  textSize(14);
  textAlign(CENTER, CENTER);
  text('target ' + target + '°, moves in ' + servo.moveTime + ' ms', x, y + 64);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
