/*
Servo Example 1: Mouse X Y to Servo Rotation
Two servos follow the mouse: the mouse's X position sets servo 0, its Y position sets
servo 1. Each position is mapped to an angle from 0 to 180.

The servos plug into headers 0 and 1 of the Servo FeatherWing.
Works with the servoWingTest Arduino sketch (on Canvas). Use Chrome or Edge.

The message to the Feather is the two angles, then a newline: "90,45\n"
The wing's other channels (2 to 7) stay as they are.

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

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textFont('sans-serif');

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

  // keep the mouse position inside the canvas, then map it to an angle:
  // X sets servo 0, Y sets servo 1
  let mx = constrain(mouseX, 0, width);
  let my = constrain(mouseY, 0, height);
  servoAngle0 = round(map(mx, 0, width, 0, 180));
  servoAngle1 = round(map(my, 0, height, 0, 180));

  // crosshairs that follow the mouse
  stroke(210);
  strokeWeight(1);
  line(mouseX, 0, mouseX, height);
  line(0, mouseY, width, mouseY);

  let y = height / 2 + 80;
  drawServo(width / 2 - 170, y, 110, 'Servo 0: mouse X', servoAngle0, true);
  drawServo(width / 2 + 170, y, 110, 'Servo 1: mouse Y', servoAngle1, true);

  if (port) {
    readFromFeather();
    sendAngles();
  }

  drawStatusBar('Move the mouse: left and right turns servo 0, up and down turns servo 1.');
}

// the two angles with a comma between them, for example "90,45"
function makeLine() {
  return servoAngle0 + ',' + servoAngle1;
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
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
