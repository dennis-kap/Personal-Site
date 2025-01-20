function getSizes(proportions, size) {
    return Array.from(proportions).map((val) => val * size)
};

function randomSign() {
  const multiplier = Math.random() > 0.5 ? 1 : -1;
  return multiplier;
};
  
export class Fish {
  constructor(color, size, velocity, [maxWidth, maxHeight]) {

      // Setting up the colors and velocity of the fish
      this.color = new Float32Array(color);
      this.eyeColor = new Float32Array([0, 0, 0, 1]);
      this.finColor = new Float32Array([color[0] - 0.2, color[1] - 0.2, color[2] - 0.2, color[3]])

      this.velocity = velocity;

      // Using the passed in size and predetermined proportions, sizes for all the fish parts are made
      this.size = size;

      this.eyeSize = 0.2 * this.size;

      const bodyProportions = [0.65, 0.9, 1.0, 1.1, 1.0, 0.9, 0.8, 0.75, 0.6, 0.4, 0.3, 0.2, 0.01];
      this.sizes = getSizes(bodyProportions, this.size);

      const bottomFinProportions = [1.7, 0.65];
      this.bottomFinSizes = getSizes(bottomFinProportions, this.size);
      this.finIndexes = [3, 8];
      this.finRotation = 20;
      
      this.dorsalFinSize = 1.2 * this.size;
      this.dorsalIndex = 6;

      const sizeLength = this.sizes.length;

      this.tailSize = 1.85 * this.size;
      this.tailIndex = sizeLength - 1;

      // An initial array of positions for the fish body parts
      this.positions = Array(sizeLength).fill(null).map(() => 
        ({x: randomSign() * (Math.random() * (maxWidth / 4)), y: randomSign() * (Math.random() * (maxHeight / 8))}));

      this.direction = Array(sizeLength).fill(Math.floor(Math.random() * 360));
      this.turnChance = {dir: Math.random > 0.5 ? "r" : "l", chance: 0};
  }

  // Function for changing the direction the head of the fish is facing
  changeDirection(amount) {
    const changedDirection = this.turnChance.dir === "r" ? 
      this.direction[0] + amount : this.direction[0] - amount;
    
    this.direction[0] = ((changedDirection + 360) % 360);
  }

  // Function that checks if the fish needs to change direction
  // This is normally random, but also is forced when near the edge of the canvas
  possiblyChangeDirection(maxW, maxH) {
    // Amount to turn when forced to turn
    const forcedTurnAmount = 2;
    const distanceFromWall = this.size * 2;

    // Current position of the front of the fish
    const curX = this.positions[0].x;
    const curY = this.positions[0].y;

    var needToTurnAround = false;

    // Helper function to check if going in the right direction while out of bounds
    const isDirCorrect = function (currentDirection, wrongDirection) {
      // Checking that the fish is going towards the correct range in direction
      const correctDirection = (wrongDirection + 180) % 360;

      const correctRange = [
        (correctDirection - 80 - (Math.random() * 10)) % 360,
        (correctDirection + 80 + (Math.random() * 10)) % 360,
      ];

      if (currentDirection < Math.min(correctRange[0], correctRange[1])
          || currentDirection > Math.max(correctRange[0], correctRange[1])) {
        needToTurnAround = true;
        console.log(correctRange);
      }
    }

    // Checking if the fish is near or already outside of canvas
    if (curX > (maxW / 2) - distanceFromWall || curX < (-maxW / 2) + distanceFromWall) {
      isDirCorrect(this.direction[0], curX > 0 ? 0 : 180);
    } else if (curY > (maxH / 2) - (distanceFromWall * 10) || curY < (-maxH / 2) + distanceFromWall) {   
      isDirCorrect(this.direction[0], curY < 0 ? 270 : 90);
    }

    // Forced change in direction due to being too close to or past an edge
    if (needToTurnAround) {
      this.changeDirection(forcedTurnAmount);
    }

    // Regular direction change
    else {
      // Randomly turn based on chance
      if (Math.random() < this.turnChance.chance) {
        this.turnChance.dir = this.turnChance.dir === "r" ? "l" : "r";
        this.turnChance.chance = 0;
      } else {
        // The chance to turn increases the longer the fish has been turning a direction
        this.turnChance.chance += Math.random() * 0.0005;
      }

      this.changeDirection(Math.random());
    }
  }

  calculateVectorAmounts(angle) {
    const angleInRadians = (angle * Math.PI) / 180;

    return [Math.cos(angleInRadians), Math.sin(angleInRadians)]
  }

  moveHead() {
    const [xVec, yVec] = this.calculateVectorAmounts(this.direction[0]);
  
    const deltaX = this.velocity * xVec;
    const deltaY = this.velocity * yVec;
  
    this.positions[0].x += deltaX;
    this.positions[0].y += deltaY;

    this.moveBody(false, 1);
  }

  moveBody(initial, partNumber) {
    if (partNumber < this.direction.length) {
      var [xVec, yVec] = [0, 0];

      // Need to set the body parts to an initial location
      if (initial) {
        const prevDirection = this.direction[partNumber - 1];

        const oppositeAngle = prevDirection + 180 > 360 ? prevDirection - 180 : prevDirection + 180;
        [xVec, yVec] = this.calculateVectorAmounts(oppositeAngle);
      }
      
      // When it's not the initial time setting up body, we set the directions to be towards the body part in front
      else {
        // Get locations of current body part and previous body part
        const prevPartLoc = this.positions[partNumber - 1];
        const curPartLoc = this.positions[partNumber];

        // Find the direction the current body part needs to go to (previous part's location)
        const angleToPrev = Math.atan2(prevPartLoc.y - curPartLoc.y, prevPartLoc.x - curPartLoc.x) * (180 / Math.PI);
        this.direction[partNumber] = angleToPrev;

        // Set the next location of the current body part to be the previous body part's radius
        // in the direction opposite of the current body part's direction
        const oppositeAngle = (angleToPrev + 180) % 360;
        [xVec, yVec] = this.calculateVectorAmounts(oppositeAngle);
      }

      this.positions[partNumber].x = this.positions[partNumber - 1].x + (xVec * this.size);
      this.positions[partNumber].y = this.positions[partNumber - 1].y + (yVec * this.size);

      this.moveBody(initial, partNumber + 1);
    }
  }

  // Get the left and right of the circle
  // Basically rotating from the direction the circle is facing by 90 degrees CW and CCW
  getPartSides(partNumber) {
    const dir = this.direction[partNumber];
    const loc = this.positions[partNumber];
    const size = this.sizes[partNumber];

    const lAngle = (dir - 90) % 360;
    const rAngle = (dir + 90) % 360;

    const [lVecX, lVecY] = this.calculateVectorAmounts(lAngle);
    const [rVecX, rVecY] = this.calculateVectorAmounts(rAngle);

    return {
      l: {x: loc.x + lVecX * size, y: loc.y + lVecY * size},
      r: {x: loc.x + rVecX * size, y: loc.y + rVecY * size}
    };
  }
  
  // Getting the lines that connect the circles to each other on the edges
  // (so the fish doesn't look like a maggot)
  getBodyLines() {
    const sideLocations = [];
    this.positions.forEach((_, index) => {
      sideLocations.push(this.getPartSides(index));
    });

    return sideLocations;
  }

  // Getting the location of the eyes of the fish
  getEyes() {
    // Values from second body part (the back of the head)
    const dir = this.direction[1];
    const loc = this.positions[1];
    const eyeOffset = 0.7; 
    const forwardOffset = this.size * 0.5;
  
    // Left and right eye angles (move closer to each other)
    const lAngle = (dir - 80) % 360;
    const rAngle = (dir + 80) % 360;
  
    // Move towards direction of the head a little bit
    const [forwardX, forwardY] = this.calculateVectorAmounts(dir);
  
    // Get positions of the eyes
    const [lVecX, lVecY] = this.calculateVectorAmounts(lAngle);
    const [rVecX, rVecY] = this.calculateVectorAmounts(rAngle);
  
    return {
      l: {
        x: loc.x + forwardX * forwardOffset + lVecX * this.size * eyeOffset,
        y: loc.y + forwardY * forwardOffset + lVecY * this.size * eyeOffset,
      },
      r: {
        x: loc.x + forwardX * forwardOffset + rVecX * this.size * eyeOffset,
        y: loc.y + forwardY * forwardOffset + rVecY * this.size * eyeOffset,
      },
    };
  }

  // Getting the location of the bottom fins of the fish
  getBottomFins() {
    // Values from front fin body part 
    const fDir = this.direction[this.finIndexes[0]];
    // const fLoc = this.positions[2];

    // Values from back fin body part
    const bDir = this.direction[this.finIndexes[1]];
    // const bLoc = this.positions[4];
  
    // Left and right sides of body parts where fins will be located
    const frontSides = this.getPartSides(this.finIndexes[0]);
    const backSides = this.getPartSides(this.finIndexes[1]);

    // const lAngle = (fDir - 35) % 360;
    // const rAngle = (fDir + 35) % 360;
  
    return {
      f: {dir: fDir, locs: {...frontSides}},
      b: {dir: bDir, locs: {...backSides}},
    };
  }

  // Getting the location of the dorsal fin
  getDorsalOrTail(dorsal) {
    // Get index based on if the dorsal is needed or the tail
    const index = dorsal ? this.dorsalIndex : this.tailIndex;

    // Values from front and back dorsal body parts
    const frontLoc = this.positions[index - 1];
    const curLoc = this.positions[index];

    const newLoc = dorsal ? 
    {x: (frontLoc.x + curLoc.x) / 2, y: (frontLoc.y + curLoc.y) / 2} :
    {x: (frontLoc.x + curLoc.x) / 2, y: (frontLoc.y + curLoc.y) / 2};

    const dirToPrev = Math.atan2(frontLoc.y - curLoc.y, frontLoc.x - curLoc.x) * (180 / Math.PI);

    const frontDir = this.direction[index - 1];
    const curDir = this.direction[index];

    // Getting difference in direction angles (to bend the fin)
    var dirDiff = curDir - frontDir;
    // Normalizing the difference (to account for differences from 0 to 360)
    if (dirDiff > 180) {
      dirDiff -= 360;
    } else if (dirDiff <= -180) {
      dirDiff += 360;
    }
  
    return {
      dir: dirToPrev,
      angle: dirDiff,
      loc: {...newLoc}
    };
  }
}