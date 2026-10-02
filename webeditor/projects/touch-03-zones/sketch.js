// Touch 03 · Zones
// The screen in three zones, side by side. A zone lights while any finger is in it.
// Hold one zone, then all three. Or give each person a zone.
// The mouse is not in touches, so try this one on a phone.

// change these
let zones = 3; // how many zones across the screen

function setup() {
  createCanvas(windowWidth, windowHeight);
  lockGestures(); // no scrolling, zooming or pull to refresh. touch needs no permission
}

function draw() {
  background(20);
  let zoneWidth = width / zones;

  for (let z = 0; z < zones; z++) {
    let left = z * zoneWidth;

    // is any finger in this zone? loop over touches and check each one's x
    let held = false;
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].x >= left && touches[i].x < left + zoneWidth) {
        held = true;
      }
    }

    // lit while held
    if (held) {
      fill(255, 140, 0);
    } else {
      fill(40);
    }
    rect(left, 0, zoneWidth, height);

    // the zone's number. the loop counts from 0
    fill(255);
    textSize(18);
    text('zone ' + z, left + 15, 40);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
