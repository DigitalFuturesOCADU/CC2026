// p5-phone 01 · Start Here
// The blank phone sketch. Every phone sketch starts this way:
// lock the gestures, ask for the sensors on a tap, and read nothing until the flag says yes.

function setup()
{
  createCanvas(windowWidth, windowHeight);
  lockGestures();                  // no scrolling, zooming or pull to refresh
  angleMode(DEGREES);              // tilt in degrees. p5.js uses radians unless you say so
  enableGyroTap('Tap to start');   // a phone asks for the sensors only after a tap
}

function draw()
{
  background(20);
  fill(255);
  textSize(18);

  // Wait for motion sensors to be available
  if (window.sensorsEnabled)
  {
    //draw the X rotation of the phone as text
    text('sensors on. rotationX is ' + round(rotationX), 20, 40);
  }
}
