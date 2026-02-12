//Class for Particle Effects
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.moveX = random(-10, 10);
    this.moveY = random(-10, 10);
    this.a = 100; // Transparency
    this.changeAlpha = random(5, 10); // How fast it fades
  }

  display() {
    fill(255, this.a);
    circle(this.x, this.y, this.w);
  }

  move() {
    this.a -= this.changeAlpha; // Fade out
    this.x += this.moveX;
    this.y += this.moveY;
    this.w--; // Shrink
  }
}
