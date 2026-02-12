/***********************
~~~Spellbound Defense~~~
When pinching, a fireball aims up from the right hand.
The left hand creates a thick line that bounces the enimeies back up.
includes score, reset, cooldowns, increasing difficulty, and enemy splitting.
************************/

/*
Refrences:
- https://www.youtube.com/watch?v=IIrC5Qcb2G4&ab_channel=TheCodingTrain
- https://crhallberg.com/CollisionDetection/Website/circle-rect.html
- https://stackoverflow.com/questions/56334536/need-help-making-an-object-bounce-off-another-object-us-javascript-and-p5
*/

let enemies = []; //array to store falling enemy balls
let spawnInterval = 2000; //time interval between spawning enemies (milliseconds)
let spawnTimer = 0; //tracks when to spawn the next enemy

let video; //webcam video feed
let handPose; //ML5 hand pose detection model
let hands = []; //array to store current detected hand positions

let particles = []; //array to store explosion particles

let fireballs = []; //array to store launched fireballs
let lastFireballTime = 0; //time since the last fireball was launched
let fireballCooldown = 500; //delay between fireballs (milliseconds)

let score = 0; //Player score counter
let enemySpeed = 1; //Speed multiplier that increases over time
let difficultyTimer = 0; //Timer to add difficulty 

function preload() {
  handPose = ml5.handPose({ flipped: true }); 
}

function setup() {
  createCanvas(600, 400); 
  video = createCapture(VIDEO, { flipped: true }); 
  video.hide(); //Hide default video element
  handPose.detectStart(video, gotHands); 
	
  difficultyTimer = millis(); //Start tracking time for difficulty
	print("********************************")
  print("*Welcome To Spellbound Defence*");
	print("***********************************************************************************************************************")
	print("In this program, you'll have to shoot as many incoming enimies as you can with the two differrent spells you know")
	print("Spell 1: Right Hand Fire Shooting -> Pinch your two fingers to shoot fireballs at the enemy")
	print("Spell 2: Left Hand Line Bounce --> Spread your two fingers apart to form a line to bounce off any enemies approuching you")
	print("*************************************************************************************************************************")
}

//Checking if an enemy hits the finger line


function draw() {
  background(255, 0, 0); //screen to red
  image(video, 0, 0); 
  spawnEnemy(); // spawn a new enemy if enough time passed
	
  //Every 10000 milliseconds, increase enemy speed slightly by 0.2
  if (millis() - difficultyTimer > 10000) {
    enemySpeed += 0.2;
    difficultyTimer = millis();
  }


  if (hands.length > 0) {
    for (let hand of hands) {

      // Right hand --> controls fireball shooting
      if (hand.handedness === "Right") {
        let rightIndex = hand.index_finger_tip;
        let rightThumb = hand.thumb_tip;
        let d = dist(rightThumb.x, rightThumb.y, rightIndex.x, rightIndex.y);
				// how glow when hand is in firing position (even during cooldown)
      	if (d < 30) {
        	fill(255, 140, 0, 100); //Semi-transparent orange glow - RGBA format
        	noStroke();
        	circle(rightThumb.x, rightThumb.y, 50); //Larger than the firing circle
      	}
        // If fingers are pinched and the cooldown has passed, launch a fireball
        if(d < 30 && millis() - lastFireballTime > fireballCooldown) {
          noFill();
          stroke(255, 140, 0); // Dark orange circle
          circle(rightThumb.x, rightIndex.y, 30); //visual for firing
          fireballs.push(new Fireball(rightThumb.x, rightIndex.y)); // Create new fireball
          lastFireballTime = millis(); // Reset cooldown timer
        }
      }

      //Left hand creates a bounce line between thumb and index finger
      if (hand.handedness === "Left") {
        let leftThumb = hand.thumb_tip;
        let leftIndex = hand.index_finger_tip;
        let d = dist(leftThumb.x, leftThumb.y, leftIndex.x, leftIndex.y);

        if (d > 0) {
          //Store coordinates of thumb and index
          tx = leftThumb.x;
          ty = leftThumb.y;
          px = leftIndex.x;
          py = leftIndex.y;
					
				  //Show thin green line when fingers are spread (preview)
       		stroke(0, 255, 0, 150); //Semi-transparent green --> RGBA format
        	strokeWeight(10);
        	line(leftThumb.x, leftThumb.y, leftIndex.x, leftIndex.y);
					
          stroke('black');
          strokeWeight(50); //Thickness of line 
          line(tx, ty, px, py); //Draw a line between thumb and index
        }
      }
    }
  }

  // Move and draw all enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    e.move(); // Move the enemy

    e.display(); //Draw the enemy
		if (e.popped === true) {
     enemies.splice(i, 1);
	}  
	}

  // Move and draw fireballs
  for (let i = fireballs.length - 1; i >= 0; i--) {
    let f = fireballs[i];
    f.move(); // Move fireball
    f.display(); // Draw fireball

    // Check fireball collision with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (enemies[j].isPopped(f.x, f.y)) {
        loadParticles(f.x, f.y); // Explosion effect
        let r = enemies[j].r; // Enemy size

        // Split large enemies into smaller ones
        if (r > 30) {
          for (let k = 0; k < 2; k++) {
            enemies.push(new Enemy(enemies[j].x, enemies[j].y, r / 1.5));
          }
        }

        enemies.splice(j, 1); // Remove hit enemy
        fireballs.splice(i, 1); // Remove used fireball
        score++; // Add to score
        break; // Exit loop since fireball is gone
      }
    }
  }

  //Move and draw explosion particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.display();
    p.move();
		
		//for removing fadded particlse
    if(p.a <= 0) {
      particles.splice(i, 1); 
    }
  }

  fill(0);
  textSize(20);
  text("Score: " + score, 10, 30); //Displaying current score

  //\Restart game if all objects are gone and time passed
  if (enemies.length === 0 && fireballs.length === 0 && millis() - spawnTimer > 5000) {
    resetGame();
  }
}

//Try to spawn a new enemy if timer passed
function spawnEnemy() {
  if (millis() - spawnTimer > spawnInterval && enemies.length < 8) {
    enemies.push(new Enemy(random(20, width - 20), -20, random(20, 50)));
    spawnTimer = millis();
		
		
  }
}


// Creates 10 explosion particles at a location
function loadParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(x, y));
  }
}

function gotHands(results) {
  hands = results; // Store hand detection results
}

//Reset everything to initial state
function resetGame() {
  enemies = [];
  fireballs = [];
  particles = [];
  score = 0;
  enemySpeed = 1;
  spawnTimer = millis();
  difficultyTimer = millis();
}
