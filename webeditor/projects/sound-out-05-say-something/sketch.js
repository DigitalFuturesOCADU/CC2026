// Sound Out 05 · Say Something
// The browser has its own voice, speechSynthesis. No library, no recording.
// Each tap says the next word in the list and shows it.

// change these
let words = ['hello', 'over', 'here', 'look', 'up', 'thank you', 'goodbye'];

let next = 0;  // which word is said next
let said = ''; // the word said last

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures(); // no tap to start here: speech needs no permission and no p5.sound
}

function draw() {
  background(20);
  fill(255);
  textSize(18);
  text('tap to say the next word', 20, 40);
  textSize(48);
  text(said, 20, height / 2);
}

// on an iPhone the first word must come from a tap. a finger lifting counts as one
function mouseReleased() {
  said = words[next];
  let sentence = new SpeechSynthesisUtterance(said); // what to say. it can also set rate and pitch
  speechSynthesis.speak(sentence);
  next = (next + 1) % words.length; // after the last word, back to the first
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
