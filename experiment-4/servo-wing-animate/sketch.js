// Servo Wing Animate
// Tick a box and that servo sweeps back and forth on its own.
// The 8 servos are offset in time, so together they move as a wave.
// Untick a box and that servo stops where it is.
// Works with the same servoWingTest Arduino sketch. Use Chrome or Edge.

let port;                // the serial connection to the Feather
let connectButton;
let status = 'Not connected';

let angles = [90, 90, 90, 90, 90, 90, 90, 90]; // one angle per servo channel
let boxes = [];          // one tickbox per servo

// the movement
let speed = 90;          // degrees of the wave per second: one sweep every 4 seconds
let swing = 70;          // how far each servo moves either side of 90
let offset = 45;         // how far behind the previous servo each one runs

let changed = true;      // true when the angles need sending
let lastSend = 0;        // when we last sent, in milliseconds
let sendEvery = 30;      // send at most every 30 ms (the Feather needs ~15 ms)

// the size and place of each arc, set in placeArcs()
let arcs = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textFont('sans-serif');

  connectButton = createButton('Connect');
  connectButton.position(20, 20);
  connectButton.mousePressed(connectOrDisconnect);

  // one tickbox per servo, all off to start
  for (let i = 0; i < 8; i++) {
    let box = createCheckbox(' Move servo ' + i, false);
    box.style('color', '#ccc');
    box.style('font-family', 'sans-serif');
    boxes.push(box);
  }

  // Web Serial only exists in Chrome and Edge
  if ('serial' in navigator) {
    port = createSerial();
  } else {
    status = 'This browser has no Web Serial: open the page in Chrome or Edge';
  }

  placeArcs();
}

function draw() {
  background(20);

  moveServos();

  for (let i = 0; i < arcs.length; i++) {
    drawServo(i);
  }

  // the status line
  noStroke();
  fill(200);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(status, 120, 33);

  if (port) {
    readFromFeather();
    sendAngles();
  }
}

// ---- The movement ----

function moveServos() {
  let seconds = millis() / 1000;

  for (let i = 0; i < 8; i++) {
    if (boxes[i].checked()) {
      // sin() goes smoothly from -1 to 1 and back again,
      // so the angle goes from 90 - swing to 90 + swing and back
      let wave = sin(seconds * speed - i * offset);
      let newAngle = round(90 + wave * swing);

      if (newAngle !== angles[i]) {
        angles[i] = newAngle;
        changed = true;
      }
    }
    // not ticked: the angle stays as it is, so the servo holds still
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
    let line = angles.join(',');  // [90, 45, 180] becomes "90,45,180"
    port.print(line + '\n');
    status = 'Sent: ' + line;
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

// ---- The arcs ----

// lay the 8 arcs out in 2 rows of 4, sized to the window,
// with each tickbox under its arc
function placeArcs() {
  arcs = [];
  let top = 70;                      // room for the button and status line
  let cellW = width / 4;
  let cellH = (height - top) / 2;
  let radius = min(cellW * 0.4, cellH * 0.5);

  for (let i = 0; i < 8; i++) {
    let column = i % 4;
    let row = floor(i / 4);
    let x = cellW * column + cellW / 2;
    let y = top + cellH * row + cellH * 0.5 + radius * 0.3;
    arcs.push({ x: x, y: y, r: radius });
    boxes[i].position(x - 55, y + 16);
  }
}

function drawServo(i) {
  let a = arcs[i];

  // the track: half a circle, 0 on the left, 90 at the top, 180 on the right
  noFill();
  stroke(70);
  strokeWeight(10);
  arc(a.x, a.y, a.r * 2, a.r * 2, 180, 360);

  // the part of the track up to the current angle
  if (boxes[i].checked()) {
    stroke(80, 170, 255);
  } else {
    stroke(110);
  }
  arc(a.x, a.y, a.r * 2, a.r * 2, 180, 180 + angles[i] + 0.1);

  // the pointer
  let hx = a.x + cos(180 + angles[i]) * a.r;
  let hy = a.y + sin(180 + angles[i]) * a.r;
  strokeWeight(3);
  stroke(255);
  line(a.x, a.y, hx, hy);
  noStroke();
  fill(255);
  circle(hx, hy, 20);

  // the angle
  fill(230);
  textAlign(CENTER, CENTER);
  textSize(28);
  text(angles[i] + '°', a.x, a.y - a.r * 0.4);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  placeArcs();
}
