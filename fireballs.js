//class for Fireballs
class Fireball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 10;
    this.speed = 6;
  }

  move() {
    this.y -= this.speed; // Move upward
  }

  display() {
    fill(255, 0, 0); // Red fireball
    ellipse(this.x, this.y, this.r * 2);
  }
}
