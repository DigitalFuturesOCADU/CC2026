// Servo Wing Animate
// Tick a box and that servo sweeps back and forth on its own.
// The 8 servos are offset in time, so together they move as a wave.
// Untick a box and that servo stops where it is.
// Works with the same servoWingTest Arduino sketch. Use Chrome or Edge.
//
// The bar along the top shows whether the Feather is connected, the last line sent
// to it, and the last message it sent back.

let port;                // the serial connection to the Feather
let connectButton;
let lastLine = '';       // the last line sent to the Feather
let featherSays = '';    // the last message the Feather sent back
let lastSend = 0;        // when we last sent, in milliseconds
let sendEvery = 30;      // send at most every 30 ms (the Feather needs about 15 ms)
let angles = [90, 90, 90, 90, 90, 90, 90, 90]; // one angle per servo channel
let boxes = [];          // one tickbox per servo

// the movement
let speed = 90;          // degrees of the wave per second: one sweep every 4 seconds
let swing = 70;          // how far each servo moves either side of 90
let offset = 45;         // how far behind the previous servo each one runs

// the place and size of each servo's half circle, set in placeArcs()
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
  }

  // one tickbox per servo, all off to start
  for (let i = 0; i < 8; i++) {
    let box = createCheckbox(' Move', false);
    box.style('font-family', 'sans-serif');
    box.style('color', '#333');
    boxes.push(box);
  }

  placeArcs();
}

function draw() {
  background(245);

  moveServos();

  for (let i = 0; i < 8; i++) {
    let a = arcs[i];
    drawServo(a.x, a.y, a.r, 'Servo ' + i, angles[i], true);
  }

  if (port) {
    readFromFeather();
    sendAngles();
  }

  drawStatusBar('Tick Move and that servo sweeps back and forth. Untick it and it stops where it is.');
}

// ---- The movement ----

function moveServos() {
  let seconds = millis() / 1000;

  for (let i = 0; i < 8; i++) {
    if (boxes[i].checked()) {
      // sin() goes smoothly from -1 to 1 and back again,
      // so the angle goes from 90 - swing to 90 + swing and back
      let wave = sin(seconds * speed - i * offset);
      angles[i] = round(90 + wave * swing);
    }
    // not ticked: the angle stays as it is, so the servo holds still
  }
}

// all 8 angles with commas between them: [90, 45, 180] becomes "90,45,180"
function makeLine() {
  return angles.join(',');
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
// lay the 8 servos out in 2 rows of 4, sized to the window,
// with each tickbox under its servo
function placeArcs() {
  arcs = [];
  let top = 140;                     // room for the status bar
  let cellW = width / 4;
  let cellH = (height - top) / 2;
  let radius = min(cellW * 0.32, cellH * 0.3);

  for (let i = 0; i < 8; i++) {
    let column = i % 4;
    let row = floor(i / 4);
    let x = cellW * column + cellW / 2;
    let y = top + cellH * row + cellH * 0.6;
    arcs.push({ x: x, y: y, r: radius });
    boxes[i].position(x - 30, y + 55);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  placeArcs();
}
