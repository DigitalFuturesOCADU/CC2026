// 04 · Hold to Reveal · 3 people
// Touch → screen. Side by side: the screen is split into one strip for each person.
// Hold a finger on your strip and your part of the picture fades in.
// Let go and it fades away. The whole picture needs everyone.
// The 1, 2 and 3 person versions are the same sketch. Only these two lines change:
let people = 3; // how many people share the phone: 1, 2 or 3
let howTo = 'One strip each. Hold a finger on your strip to show it.';

// The GIF is loaded by its full web address, so this sketch has no file to upload.
// To use your own, upload it to the sketch and put its file name here, like 'myGif.gif'.
let gifFile = 'https://digitalfuturesocadu.github.io/CC2026/experiment-2/media/gifScene.gif';

// the feel of the piece
let fadeSpeed = 0.08; // how quickly a strip fades in and out. 1 is at once
let colours = ['#ff8c1a', '#2ab7ff', '#ff4fa3']; // one colour for each person

let gif;
let shown = [];       // how much of each strip is showing, from 0 to 1

async function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();

  // on a laptop, show a QR code of this page so a phone can open it.
  // it only shows on a public https address, like the examples site.
  if (location.protocol === 'https:' && window.self === window.top) {
    showDesktopQr();
  }

  gif = await loadImage(gifFile);
  for (let i = 0; i < people; i++) {
    shown[i] = 0;
  }
}

function draw() {
  background(0);

  // the picture, as wide as the screen, in the middle
  let h = gif.height * width / gif.width;
  image(gif, 0, (height - h) / 2, width, h);

  let stripWidth = width / people;
  for (let i = 0; i < people; i++) {
    let left = i * stripWidth;

    // 1. is a finger on this strip?
    let touched = fingerIn(left, left + stripWidth);

    // 2. fade toward showing (1) or hidden (0)
    if (touched) {
      shown[i] = lerp(shown[i], 1, fadeSpeed);
    } else {
      shown[i] = lerp(shown[i], 0, fadeSpeed);
    }

    // 3. cover the strip in black. the more it shows, the more see-through the cover
    noStroke();
    fill(0, 255 * (1 - shown[i]));
    rect(left, 0, stripWidth, height);

    // this person's colour along the bottom of their strip
    fill(colours[i]);
    if (touched) {
      rect(left + 4, height - 20, stripWidth - 8, 20);
    } else {
      rect(left + 4, height - 8, stripWidth - 8, 8);
    }
  }

  drawHowTo();
}

// is a finger between left and right? on a laptop, the mouse counts as one finger
function fingerIn(left, right) {
  for (let i = 0; i < touches.length; i++) {
    if (touches[i].x >= left && touches[i].x < right) {
      return true;
    }
  }
  if (touches.length === 0 && mouseIsPressed && mouseX >= left && mouseX < right) {
    return true;
  }
  return false;
}

// the band across the top: what to do, and a note when there is one
function drawHowTo(note) {
  noStroke();
  fill(0, 180);
  rect(0, 0, width, 110);
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(howTo, 16, 14, width - 32);
  if (note) {
    fill(255, 200, 0);
    text(note, 16, 80, width - 32);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
