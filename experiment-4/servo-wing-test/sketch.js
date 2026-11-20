// Servo Wing Test
// Drag the handle on each arc to set that servo's angle, from 0 to 180.
// Every angle goes to the Feather as one line: 90,90,45,180,0,90,90,90
// Works with the servoWingTest Arduino sketch. Use Chrome or Edge.

let port;                // the serial connection to the Feather
let connectButton;
let status = 'Not connected';

let angles = [90, 90, 90, 90, 90, 90, 90, 90]; // one angle per servo channel
let dragging = -1;       // which arc is being dragged (-1 = none)

let changed = true;      // true when the angles need sending
let lastSend = 0;        // when we last sent, in milliseconds
let sendEvery = 50;      // send at most every 50 ms (the Feather needs ~15 ms)

// the size and place of each arc, set in placeArcs()
let arcs = [];

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
  } else {
    status = 'This browser has no Web Serial: open the page in Chrome or Edge';
  }

  placeArcs();
}

function draw() {
  background(20);

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

// lay the 8 arcs out in 2 rows of 4, sized to the window
function placeArcs() {
  arcs = [];
  let top = 70;                      // room for the button and status line
  let cellW = width / 4;
  let cellH = (height - top) / 2;
  let radius = min(cellW * 0.4, cellH * 0.55);

  for (let i = 0; i < 8; i++) {
    let column = i % 4;
    let row = floor(i / 4);
    let x = cellW * column + cellW / 2;
    let y = top + cellH * row + cellH * 0.5 + radius * 0.4;
    arcs.push({ x: x, y: y, r: radius });
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
  stroke(80, 170, 255);
  arc(a.x, a.y, a.r * 2, a.r * 2, 180, 180 + angles[i] + 0.1);

  // the handle
  let hx = a.x + cos(180 + angles[i]) * a.r;
  let hy = a.y + sin(180 + angles[i]) * a.r;
  strokeWeight(3);
  stroke(255);
  line(a.x, a.y, hx, hy);
  noStroke();
  if (dragging === i) {
    fill(255, 220, 80);
  } else {
    fill(255);
  }
  circle(hx, hy, 28);

  // the labels
  fill(230);
  textAlign(CENTER, CENTER);
  textSize(28);
  text(angles[i] + '°', a.x, a.y - a.r * 0.4);
  fill(140);
  textSize(14);
  text('Servo ' + i, a.x, a.y + 24);
}

// ---- Dragging ----

function mousePressed() {
  // pick the arc under the mouse, if there is one
  for (let i = 0; i < arcs.length; i++) {
    let a = arcs[i];
    if (dist(mouseX, mouseY, a.x, a.y) < a.r + 25 && mouseY < a.y + 30) {
      dragging = i;
      setAngleFromMouse(i);
    }
  }
}

function mouseDragged() {
  if (dragging >= 0) {
    setAngleFromMouse(dragging);
  }
}

function mouseReleased() {
  dragging = -1;
}

// turn the mouse position into an angle from 0 to 180 on arc i
function setAngleFromMouse(i) {
  let a = arcs[i];
  // the direction from the arc's centre to the mouse:
  // -180 on the left, -90 straight up, 0 on the right
  let direction = atan2(mouseY - a.y, mouseX - a.x);

  // below the arc: stick to whichever end is nearer
  if (direction > 0) {
    if (mouseX < a.x) {
      direction = -180;
    } else {
      direction = 0;
    }
  }

  let newAngle = round(direction + 180);
  newAngle = constrain(newAngle, 0, 180);

  if (newAngle !== angles[i]) {
    angles[i] = newAngle;
    changed = true;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  placeArcs();
}
