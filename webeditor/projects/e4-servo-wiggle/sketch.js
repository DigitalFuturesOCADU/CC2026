/*
Servo Example 2: Mouse X to Servo Wiggle
The canvas is split in two. With the mouse on the left half, servo 0 wiggles back and
forth and servo 1 waits in the middle of its range. On the right half it's the other way
round.

The wiggle comes from a sine wave: sin() goes smoothly from -1 to 1 and back, so the
angle goes smoothly from the servo's min to its max and back.
Change waveSpeed0 / waveSpeed1 (milliseconds for one wiggle) and servo0Min / servo0Max /
servo1Min / servo1Max to change the speed and range of motion.

The servos plug into headers 0 and 1 of the Servo FeatherWing.
Works with the servoWingTest Arduino sketch (on Canvas). Use Chrome or Edge.
The message to the Feather is the two angles, then a newline: "90,45\n"

To extend this example:
- Add more zones for more servos
- Try other patterns (a square wave, a sawtooth)
- Use the mouse's Y position for the speed
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

let changed = true;      // true when the angles need sending
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

  let newAngle0, newAngle1;
  if (mouseX < width / 2) {
    // left side: servo 0 wiggles, servo 1 waits in the middle
    newAngle0 = getWaveAngle(waveSpeed0, servo0Min, servo0Max, servo0Center);
    newAngle1 = servo1Center;
    drawActiveZone(true);
  } else {
    // right side: servo 1 wiggles, servo 0 waits in the middle
    newAngle0 = servo0Center;
    newAngle1 = getWaveAngle(waveSpeed1, servo1Min, servo1Max, servo1Center);
    drawActiveZone(false);
  }

  if (newAngle0 !== servoAngle0 || newAngle1 !== servoAngle1) {
    servoAngle0 = newAngle0;
    servoAngle1 = newAngle1;
    changed = true;
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
  let centerY = height - 100;
  drawServo(width / 4, centerY, servoAngle0, servo0Min, servo0Max, color(255, 0, 0), color(255, 200, 200));
  drawServo(3 * width / 4, centerY, servoAngle1, servo1Min, servo1Max, color(0, 0, 255), color(200, 200, 255));
}

// the full half circle, the servo's range, its min and max, and the current angle
function drawServo(x, y, angle, minAngle, maxAngle, c, pale) {
  stroke(200);
  strokeWeight(1);
  fill(255);
  arc(x, y, 80, 80, 0, 180);

  // the range the servo is allowed to move in
  noFill();
  stroke(pale);
  arc(x, y, 90, 90, minAngle, maxAngle);

  // lines at min and max
  stroke(red(c), green(c), blue(c), 100);
  line(x, y, x + cos(minAngle - 90) * 45, y - sin(minAngle - 90) * 45);
  line(x, y, x + cos(maxAngle - 90) * 45, y - sin(maxAngle - 90) * 45);

  // the current angle
  stroke(c);
  strokeWeight(2);
  line(x, y, x + cos(angle - 90) * 40, y - sin(angle - 90) * 40);

  // min and max labels
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
  text('Servo 0 angle: ' + servoAngle0 + '° (range: ' + servo0Min + '° - ' + servo0Max + '°)', 20, height - 40);
  text('Servo 1 angle: ' + servoAngle1 + '° (range: ' + servo1Min + '° - ' + servo1Max + '°)', 20, height - 20);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
