// Images 03 · Shake for the Next
// Four pictures wait in a list. Each shake shows the next one,
// and after the last comes the first again. Shake the phone once, firmly.

// change these
let threshold = 30; // how hard a shake has to be. lower is easier
let gap = 500;      // milliseconds before the next shake can count

let pictures = []; // the list of pictures
let shakes = 0;    // how many shakes so far
let lastShake = 0; // when the last shake counted, in milliseconds

async function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  enableSensorTap('Tap to start');
  setShakeThreshold(threshold);
  imageMode(CENTER);

  // the files are named still-1.jpg to still-4.jpg, so a loop can build each address
  for (let i = 1; i <= 4; i++) {
    let address = 'https://digitalfuturesocadu.github.io/CC2026/media/images/still-' + i + '.jpg';
    pictures.push(await loadImage(address)); // push() adds it to the end of the list
  }
}

function draw() {
  background(20);
  if (!window.sensorsEnabled) return;

  // % wraps the count around the list: 0, 1, 2, 3, then 0 again
  let current = shakes % pictures.length;
  let picture = pictures[current];
  let fit = min(width / picture.width, height / picture.height); // as in Images 01
  image(picture, width / 2, height / 2, picture.width * fit, picture.height * fit);

  fill(255);
  textSize(18);
  text('shakes ' + shakes + '   picture ' + (current + 1) + ' of ' + pictures.length, 20, 40);
}

// p5.js calls this when the phone is shaken
function deviceShaken() {
  // one shake calls this several times in a row, so count it only once
  if (millis() - lastShake < gap) return;
  lastShake = millis();
  shakes = shakes + 1;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
