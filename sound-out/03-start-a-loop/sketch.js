// Sound Out 03 · Start a Loop
// Tone.js plays a pattern of notes on its own clock, the Transport.
// A quick tap starts or stops it. Hold a finger down and slide up and down to set the tempo.

// change these
let notes = ['C4', 'E4', 'G4', 'B4', 'C5', 'B4', 'G4', 'E4']; // the pattern, one note per step
let slowest = 60;  // beats per minute at the bottom of the screen
let fastest = 240; // beats per minute at the top

let synth;             // the instrument that plays the notes
let downTime = -10000; // when the finger went down

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures();
  synth = new Tone.Synth().toDestination();
  new Tone.Sequence(playNote, notes, '8n').start(0); // a step every '8n': two steps to a beat
  enableSoundTap('Tap to start');
}

// the Transport calls this for each step, a little early. time says exactly when to play
function playNote(time, note) {
  synth.triggerAttackRelease(note, '16n', time); // a short note, half a step long
}

function draw() {
  background(20);

  // while a finger is down, its height sets the tempo
  if (mouseIsPressed && window.soundEnabled) {
    Tone.getTransport().bpm.value = map(mouseY, height, 0, slowest, fastest, true);
  }

  fill(255);
  textSize(18);
  text(Tone.getTransport().state + '   ' + round(Tone.getTransport().bpm.value) + ' bpm', 20, 40);
}

function mousePressed() {
  // the permission tap only turns the sound on
  if (window.soundEnabled) {
    downTime = millis();
  }
}

function mouseReleased() {
  // a quick tap starts or stops the Transport. a longer hold only sets the tempo
  if (millis() - downTime > 300) return;
  Tone.getTransport().toggle();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
