function getSizes(proportions, size) {
    return Array.from(proportions).map((val) => val * size)
};

function randomSign() {
  const multiplier = Math.random() > 0.5 ? 1 : -1;
  return multiplier;
};
  
export class Fish {
  constructor(color, size, velocity, maxWidth = 0, maxHeight = 0) {

      // Setting up screen size (to keep fish size somewhat consistent on window resize)
      this.screenWidth = maxWidth;
      this.screenHeight = maxHeight;

      // Setting up the colors and velocity of the fish
      this.color = new Float32Array(color);
      this.eyeColor = new Float32Array([0, 0, 0, 1]);
      this.finColor = new Float32Array([color[0] - 0.2, color[1] - 0.2, color[2] - 0.2, color[3]])

      this.velocity = velocity;

      // Using the passed in size and predetermined proportions, sizes for all the fish parts are made
      this.initialSize = size;
      this.size = size;

      this.bodyProportions = [0.65, 0.9, 1.0, 1.1, 1.0, 0.9, 0.8, 0.75, 0.6, 0.4, 0.3, 0.2, 0.01];
      this.bodySizes = [];

      this.bottomFinProportions = [1.5, 0.65];
      this.bottomFinSizes = [];
      this.finIndexes = [3, 8];
      this.finRotation = 25;
      
      this.eyeSize = 1;

      this.dorsalFinSize = 1;
      this.dorsalIndex = 6;

      const sizeLength = this.bodyProportions.length;

      this.tailSize = 1;
      this.tailIndex = sizeLength - 1;

      // An initial array of positions for the fish body parts
      const initialXY = {x: randomSign() * (Math.random() * (maxWidth / 4)), y: (Math.random() * (maxHeight / 10))};
      this.positions = Array(sizeLength).fill(null).map(() => 
        ({...initialXY}));

      this.direction = Array(sizeLength).fill(Math.floor(Math.random() * 360));
      // this.direction = Array(sizeLength).fill(180);
      this.turnChance = {dir: Math.random > 0.5 ? "cw" : "ccw", chance: 0};
      this.forcedTurnAmount = 1.1;

      this.updateFishSize(this.screenWidth, this.screenHeight);

      // Locations of vertices
      this.bottomFinLocations = [];
      this.eyeLocations = [];
      this.bodySegmentLocations = [];
      this.bodySideLocations = [];
      this.dorsalAndTailLocations = [];
  }

  // Function for changing the direction the head of the fish is facing
  changeDirection(amount) {
    const changedDirection = this.turnChance.dir === "cw" ? 
      this.direction[0] + amount : this.direction[0] - amount;
    
    this.direction[0] = ((changedDirection + 360) % 360);
  }

  // Function that checks if the fish needs to change direction
  // This is normally random, but also is forced when near the edge of the canvas
  possiblyChangeDirection(maxW, maxH) {
    // Amount to turn when forced to turn
    const distanceFromWall = this.size * 2;

    // Current position of the front of the fish
    const curX = this.positions[0].x;
    const curY = this.positions[0].y;

    // By default it is assumed the fish it not out of cbounds
    var needToTurnAround = false;
    var outside = false;

    // Helper function to check if going in the right direction while out of bounds
    const isDirCorrect = function (currentDirection, wrongDirection) {
      // Checking that the fish is going towards the correct range in direction
      const correctDirection = (wrongDirection + 180) % 360;

      const correctRange = [
        (correctDirection - 45 + (Math.random() * 15)) % 360,
        (correctDirection + 45 - (Math.random() * 15)) % 360,
      ];

      // If not in the correct range, the fish needs to turn around
      if (currentDirection < Math.min(correctRange[0], correctRange[1])
          || currentDirection > Math.max(correctRange[0], correctRange[1])) {
        needToTurnAround = true;
      }
    };

    // Checking if the fish is near or already outside of canvas
    // The bottom has a greater distance from the wall so the fish doesn't go on to the beach
    if (curX > maxW / 2 - distanceFromWall || curX < -maxW / 2 + distanceFromWall) {
      isDirCorrect(this.direction[0], curX > 0 ? 90 : 270);
      outside = true;
    } else if (curY > maxH / 2 - distanceFromWall || curY < distanceFromWall * 5) {   
      isDirCorrect(this.direction[0], curY > distanceFromWall * 5 ? 0 : 180);
      outside = true;
    }

    // Forced change in direction due to being too close to or past an edge
    if (needToTurnAround) {
      this.changeDirection(this.forcedTurnAmount);
    }

    // Regular direction change (randomized)
    else if (!outside) {
      // Randomly turn based on chance
      if (Math.random() < this.turnChance.chance) {
        this.turnChance.dir = this.turnChance.dir === "cw" ? "ccw" : "cw";
        this.turnChance.chance = 0;
      } else {
        // The chance to turn increases the longer the fish has been turning a direction
        this.turnChance.chance += Math.random() * 0.0005;
      }

      this.changeDirection(Math.random());
    }
  }

  // Function that converts an angle to X and Y amounts (vector)
  calculateVectorAmounts(angle) {
    const angleInRadians = (angle) * (Math.PI / 180);

    // Since the calculation here results in the cartesian coordinate,
    // not regular X and Y coordinates, I am swapping sin and cos
    return [Math.sin(angleInRadians), Math.cos(angleInRadians)]
  }

  // Function to move the head (the rest of the body follows)
  moveHead() {
    const [xVec, yVec] = this.calculateVectorAmounts(this.direction[0]);
  
    const deltaX = this.velocity * xVec;
    const deltaY = this.velocity * yVec;
  
    this.positions[0].x += deltaX;
    this.positions[0].y += deltaY;

    // Move the rest of the body recursively
    this.moveBody(false, 1);
  }

  // A recursive function that moves the the body (circular segments)
  moveBody(initial, partNumber) {
    // Only runs on valid body parts
    if (partNumber < this.direction.length) {
      var [xVec, yVec] = [0, 0];

      // Need to set the body parts to an initial location when first starting
      if (initial) {
        const prevDirection = this.direction[partNumber - 1];

        const oppositeAngle = (prevDirection + 180) % 360;
        [xVec, yVec] = this.calculateVectorAmounts(oppositeAngle);
      }
      
      // When it's not the initial time setting up body, we set the directions to be towards the body part in front
      else {
        // Get locations of current body part and previous body part
        const prevPartLoc = this.positions[partNumber - 1];
        const curPartLoc = this.positions[partNumber];

        // Find the direction the current body part needs to go to (previous part's location)
        const angleToPrev = Math.atan2(prevPartLoc.x - curPartLoc.x, prevPartLoc.y - curPartLoc.y) * (180 / Math.PI);
        this.direction[partNumber] = angleToPrev;

        // Set the next location of the current body part to be the previous body part's radius
        // in the direction opposite of the current body part's direction
        const oppositeAngle = (angleToPrev + 180) % 360;
        [xVec, yVec] = this.calculateVectorAmounts(oppositeAngle);
      }

      // Set the new locations of the body segment and set the next segment's coordinates
      this.positions[partNumber].x = this.positions[partNumber - 1].x + (xVec * this.size);
      this.positions[partNumber].y = this.positions[partNumber - 1].y + (yVec * this.size);

      this.moveBody(initial, partNumber + 1);
    }
  }

  // Getting the body segments of the fish (like an outline made of circles)
  getBodySegments() {
    const segments = [];
    this.positions.forEach((position, index) => {
      segments.push({x: position.x, y: position.y, size: this.bodySizes[index]});
    });

    this.bodySegmentLocations = segments;
  }

  // Get the left and right of the circle
  // Basically rotating from the direction the circle is facing by 90 degrees CW and CCW
  getPartSides(partNumber) {
    // Getting direction, location and radius of the segment
    const dir = this.direction[partNumber];
    const loc = this.positions[partNumber];
    const size = this.bodySizes[partNumber];

    // Getting left and right directions relative to segment direction
    const lAngle = (dir - 90) % 360;
    const rAngle = (dir + 90) % 360;

    // Get locations of the left and right side
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

    this.bodySideLocations = sideLocations;
  }

  // Getting the location of the bottom fins of the fish
  getBottomFins() {
    // Values from front fin body part 
    const fDir = this.direction[this.finIndexes[0]];

    // Values from back fin body part
    const bDir = this.direction[this.finIndexes[1]];
  
    // Left and right sides of body parts where fins will be located
    const frontSides = this.getPartSides(this.finIndexes[0]);
    const backSides = this.getPartSides(this.finIndexes[1]);
  
    this.bottomFinLocations = [
      {dir: fDir, ...frontSides.l, angle: this.finRotation,
        sizes: [this.bottomFinSizes[0], this.bottomFinSizes[0] / 3]},
      {dir: fDir, ...frontSides.r, angle: -this.finRotation,
        sizes: [this.bottomFinSizes[0], this.bottomFinSizes[0] / 3]},
      {dir: bDir, ...backSides.l, angle: this.finRotation,
        sizes: [this.bottomFinSizes[1], this.bottomFinSizes[1] / 2]},
      {dir: bDir, ...backSides.r, angle: -this.finRotation,
        sizes: [this.bottomFinSizes[1], this.bottomFinSizes[1] / 2]},
    ];
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
  
    this.eyeLocations = [
      {x: loc.x + forwardX * forwardOffset + lVecX * this.size * eyeOffset,
      y: loc.y + forwardY * forwardOffset + lVecY * this.size * eyeOffset,
      size: this.eyeSize},

      {x: loc.x + forwardX * forwardOffset + rVecX * this.size * eyeOffset,
      y: loc.y + forwardY * forwardOffset + rVecY * this.size * eyeOffset,
      size: this.eyeSize}]
  }

  // Getting the locations of the dorsal fin and tail
  getDorsalAndTail() {

    const getDorsalWidth = (angle) => (this.dorsalFinSize / (100/Math.abs(angle))) + this.dorsalFinSize / 10;
    const getTailWidth = (angle) => (this.tailSize / (75/Math.abs(angle))) + this.tailSize / 15;
    const finInfo = [
      {index: this.dorsalIndex, length: this.dorsalFinSize, width: getDorsalWidth},
      {index: this.tailIndex, length: this.tailSize, width: getTailWidth}
    ]

    const finData = []
    finInfo.forEach((data) => {
      // Values from front and back segments that will decide location and direction
      // of the fin/tail
      const frontLoc = this.positions[data.index - 1];
      const curLoc = this.positions[data.index];

      // The location of the dorsal/tail calculated
      const newLoc = {x: (frontLoc.x + curLoc.x) / 2, y: (frontLoc.y + curLoc.y) / 2}

      // Direction that the fin/tail should face
      const dirToPrev = Math.atan2(frontLoc.x - curLoc.x, frontLoc.y - curLoc.y) * (180 / Math.PI);

      // Getting difference in direction angles (to bend the fin)
      const frontDir = this.direction[data.index - 1];
      const curDir = this.direction[data.index];
      
      var dirDiff = curDir - frontDir;
      
      // Normalizing the difference (to account for differences from 0 to 360)
      if (dirDiff > 180) {
        dirDiff -= 360;
      } else if (dirDiff <= -180) {
        dirDiff += 360;
      }

      finData.push({
        dir: dirToPrev,
        angle: -dirDiff,
        loc: {...newLoc},
        length: data.length,
        width: data.length / 10,
        circle: false
      });
      finData.push({
        dir: dirToPrev,
        angle: -dirDiff,
        loc: {...newLoc},
        length: data.length,
        width: data.width(-dirDiff),
        circle: true
      });

    });
  
    this.dorsalAndTailLocations = finData;
  }

  // Function that updates the fish sizes based on the screen size.
  // Called every time the window size changes to not make the fish
  // out of proportion
  updateFishSize(newWidth, newHeight) {
    this.screenWidth = newWidth;
    this.screenWidth = newHeight;

    const newSize = this.initialSize * (this.screenWidth / 750) + (this.size * 0.5);
    this.size = newSize;

    this.bodySizes = getSizes(this.bodyProportions, newSize);
    this.bottomFinSizes = getSizes(this.bottomFinProportions, newSize);

    this.eyeSize = 0.2 * newSize;
    this.dorsalFinSize = 1.2 * newSize;
    this.tailSize = 1.85 * newSize;
  }

  updateVertices() {
    this.getBottomFins();
    this.getEyes();
    this.getBodySegments();
    this.getBodyLines();
    this.getDorsalAndTail();
  }
}