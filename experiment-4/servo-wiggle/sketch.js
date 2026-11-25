/*
Servo Example 2: Mouse X to Servo Wiggle
The canvas is split in two. With the mouse on the left half, servo 0 wiggles back and
forth and servo 1 waits where it stopped. On the right half it's the other way round.
When a servo starts again it carries on its wiggle from where it stopped, so it never jumps.

The wiggle comes from a sine wave: sin() goes smoothly from -1 to 1 and back, so the
angle goes smoothly from the servo's min to its max and back.
Change waveSpeed0 / waveSpeed1 (milliseconds for one wiggle) and servo0Min / servo0Max /
servo1Min / servo1Max to change the speed and range of motion.

The servos plug into headers 0 and 1 of the Servo FeatherWing.
Works with the servoWingTest Arduino sketch (on Canvas). Use Chrome or Edge.
The message to the Feather is the two angles, then a newline: "90,45\n"

The bar along the top shows whether the Feather is connected, the last line sent to
it, and the last message it sent back.

To extend this example:
- Add more zones for more servos
- Try other patterns (a square wave, a sawtooth)
- Use the mouse's Y position for the speed
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
}

function draw() {
  background(245);

  // the half with the mouse in it is shaded, and its servo wiggles;
  // the other servo waits where it stopped
  noStroke();
  fill(225, 236, 250);
  if (mouseX < width / 2) {
    rect(0, 0, width / 2, height);
    // deltaTime is the milliseconds since the last frame
    wavePos0 = wavePos0 + deltaTime / waveSpeed0;
    servoAngle0 = getWaveAngle(wavePos0, servo0Min, servo0Max, servo0Center);
  } else {
    rect(width / 2, 0, width / 2, height);
    wavePos1 = wavePos1 + deltaTime / waveSpeed1;
    servoAngle1 = getWaveAngle(wavePos1, servo1Min, servo1Max, servo1Center);
  }

  // the line between the two halves
  stroke(200);
  strokeWeight(1);
  line(width / 2, 0, width / 2, height);

  let y = height / 2 + 80;
  drawRange(width / 4, y, 110, servo0Min, servo0Max);
  drawServo(width / 4, y, 110, 'Servo 0', servoAngle0, true);
  drawRange(3 * width / 4, y, 110, servo1Min, servo1Max);
  drawServo(3 * width / 4, y, 110, 'Servo 1', servoAngle1, true);

  if (port) {
    readFromFeather();
    sendAngles();
  }

  drawStatusBar('Mouse on the left: servo 0 wiggles. On the right: servo 1 wiggles.');
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
}
