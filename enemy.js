// Class for enemy objects
class Enemy {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.mx = random(-1, 1); // Sideways motion
    this.my = random(0.3, 0.8) * enemySpeed; // Falling speed
    this.r = r; //radius
    this.popped = false;
		this.gravity= 0.03; //add gravity 
  }

	
  move() {
		

		//Apply gravity (always pulls downward)
    this.my += this.gravity;

    // Move the enemy vertically and horizontally
    this.y += this.my; // Apply vertical movement
    this.x += this.mx; // Apply horizontal movement

		if (hands.length > 0) {
      for (let hand of hands) {
        // Only check left-hand line
        if (hand.handedness === "Left") {
          let leftThumb = hand.thumb_tip;
          let leftIndex = hand.index_finger_tip;
          
          // Calculate distance from enemy to line
					/*
					- (x0, y0) = enemy position (this.x, this.y)
          - (x1, y1) = thumb position (leftThumb.x, leftThumb.y)
          - (x2, y2) = index finger position (leftIndex.x, leftIndex.y)
					*/
          let lineLength = dist(leftThumb.x, leftThumb.y, leftIndex.x, leftIndex.y);
          let distance = abs((this.x - leftThumb.x) * (leftIndex.y - leftThumb.y) - 
														 (this.y - leftThumb.y) * (leftIndex.x - leftThumb.x)) / lineLength; 

          // If enemy touches the line, bounce
          if (distance < this.r && lineLength > 50) { //Only bounce if line is long enough
            this.my *= -1; // Reverse vertical direction (bounce up)
            this.y -= 5;  // Nudge upwar
          }
        }
      }
    }
    // If the enemy goes below the screen, mark it for removal
    if (this.y > height + this.r) {
      this.popped = true;
    }
  
  

}
  display() {
    if (!this.popped) {
      noStroke();
			
      fill(0, 255, 255); // Cyan color
      ellipse(this.x, this.y, this.r * 2);
    }
  }

  pop() {
    this.popped = true;
  }

  // Check if fireball hit this enemy
  isPopped(px, py) {
    let d = dist(px, py, this.x, this.y);
    return d < this.r;
  }
}

