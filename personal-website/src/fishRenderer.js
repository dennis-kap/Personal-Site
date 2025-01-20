import React, { useRef, useEffect } from 'react';

function getSizes(proportions, size) {
  return Array.from(proportions).map((val) => val * size)
};

class Fish {
    constructor(color, size, velocity) {
        this.color = new Float32Array(color);
        this.eyeColor = new Float32Array([0, 0, 0, 1]);
        this.finColor = new Float32Array([color[0] - 0.2, color[1] - 0.2, color[2] - 0.2, color[3]])
        this.size = size;
        this.velocity = velocity;

        this.eyeSize = 0.2 * this.size;

        const bodyProportions = [0.65, 0.9, 1.0, 1.1, 1.0, 0.9, 0.8, 0.75, 0.6, 0.4, 0.3, 0.2, 0.01];
        this.sizes = getSizes(bodyProportions, this.size);

        const bottomFinProportions = [1.2, 0.65];
        this.bottomFinSizes = getSizes(bottomFinProportions, this.size);
        this.finIndexes = [2, 8];
        this.finRotation = 35;
        
        this.dorsalFinSize = 1.2 * this.size;
        this.dorsalIndex = 6;

        const sizeLength = this.sizes.length;

        this.tailSize = 1.85 * this.size;
        this.tailIndex = sizeLength - 1;

        this.positions = Array(sizeLength).fill(null).map(() => ({x: 0, y: 0}));

        this.direction = Array(sizeLength).fill(Math.floor(Math.random() * 360));
        this.turnChance = {dir: Math.random > 0.5 ? "r" : "l", chance: 0};
    }

    changeDirection(amount) {
      const changedDirection = this.turnChance.dir === "r" ? 
        this.direction[0] + amount : this.direction[0] - amount;
      
      this.direction[0] = changedDirection % 360;
    }

    possiblyChangeDirection(maxW, maxH) {
      const forcedTurnAmount = 1.2;
      const distanceFromWall = this.size * 20;

      const curX = this.positions[0].x;
      const curY = this.positions[0].y;

      // Forced change in direction due to being too close to an edge
      if ((curX + this.size + (Math.random() * distanceFromWall)) > maxW / 2 || (curX - this.size - (Math.random() * distanceFromWall)) < -maxW / 2) {
        this.changeDirection(Math.random() * forcedTurnAmount);
      } else if ((curY + this.size + (Math.random() * distanceFromWall)) > maxH / 2 || (curY - this.size - (Math.random() * distanceFromWall)) < -maxH / 2) {
        this.changeDirection(Math.random() * forcedTurnAmount);
      }

      // Regular direction change
      else {
        if (Math.random() < this.turnChance.chance) {
          this.turnChance.dir = this.turnChance.dir === "r" ? "l" : "r";
          this.turnChance.chance = 0;
        } else {
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

    getTailBottom(loc, dir) {
      const oppositeDir = (dir + 180) % 360;
      const [xVec, yVec] = this.calculateVectorAmounts(oppositeDir);

      return {x: loc.x + (xVec * this.tailSize * 0.5), y: loc.y + (yVec * this.tailSize * 0.5)};
    }
}

const FishCanvas = () => {
  const canvasRef = useRef(null);

  function makeEllipseVertices(centerX, centerY, radius, circle = true, half = false, bodyAngle = 0, phi = 0) {
    const vertices = [centerX, centerY];

    var startTheta = 0;
    var endTheta = 2 * Math.PI;
    if (half && phi < 0) {
      endTheta -= Math.PI;
    } else if (half && phi > 0) {
      startTheta += Math.PI;
    }

    // Loop through 45 segments
    for (let i = 0; i <= 45; i++) {
        const theta = startTheta + (i / 45) * (half ? 1 : 2) * (endTheta - startTheta);

        let x, y;

        if (circle) {
            // Generate a circle
            x = radius[0] * Math.cos(theta);
            y = radius[0] * Math.sin(theta);
        } else {
            // Generate an ellipse
            const defaultX = radius[0] * Math.cos(theta);
            const defaultY = radius[1] * Math.sin(theta);

            // Convert bodyAngle to radians
            const angle = ((bodyAngle + phi) % 360) * (Math.PI / 180);

            // Rotate ellipse
            x = defaultX * Math.cos(angle) - defaultY * Math.sin(angle);
            y = defaultX * Math.sin(angle) + defaultY * Math.cos(angle);
        }

        // Translate the rotated point to the center
        vertices.push(centerX + x, centerY + y);
    }

    return new Float32Array(vertices);
  }


  function drawFish(fish) {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl', { stencil: true });

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Clearing stencil - stencil allows subtracting shapes from other shapes
    gl.clearStencil(0);

    // Vertex shader
    const vertexShaderSource = `
      precision mediump float;

      attribute vec2 vertexPosition;
      uniform vec2 uResolution;

      void main() {
        vec2 normalizedPosition = vertexPosition / uResolution * 2.0 - 1.0;
        normalizedPosition.y = -normalizedPosition.y;
        gl_Position = vec4(normalizedPosition, 0.0, 1.0);
      }`;
  
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
      return;
    }

    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;

      uniform vec4 fColor;

      void main() {
        gl_FragColor = fColor;
      }`;
  
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('ERROR compiling fragment shader', gl.getShaderInfoLog(fragmentShader));
      return;
    }

    // Create shader program and link shaders
    const fishProgram = gl.createProgram();
    gl.attachShader(fishProgram, vertexShader);
    gl.attachShader(fishProgram, fragmentShader);
    gl.linkProgram(fishProgram);

    if (!gl.getProgramParameter(fishProgram, gl.LINK_STATUS)) {
      console.error('ERROR linking program', gl.getProgramInfoLog(fishProgram));
      return;
    }

    gl.useProgram(fishProgram);

    const vertexLocation = gl.getAttribLocation(fishProgram, 'vertexPosition');
    const resolutionLocation = gl.getUniformLocation(fishProgram, 'uResolution');
    const colorLocation = gl.getUniformLocation(fishProgram, 'fColor');

    // Get screen size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Body movement
    fish.moveBody(true, 1);

    // Body buffer setup
    const bodyBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bodyBuffer);

    // Enable the position attribute
    gl.enableVertexAttribArray(vertexLocation);
    gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

    function render() {
      // Get center of screen
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Apply fish movements
      fish.possiblyChangeDirection(window.innerWidth, window.innerHeight);
      fish.moveHead();

      const bottomFinLocations = fish.getBottomFins();
      const eyeLocations = fish.getEyes();
      const bodySideLocations = fish.getBodyLines();
      const dorsalFinLocation = fish.getDorsalOrTail(true);
      const tailLocation = fish.getDorsalOrTail(false);
      // const tailBottomLocation = fish.getTailBottom(tailLocation.loc, tailLocation.dir);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.clearColor(0.18, 0.18, 0.18, 1.0);

      // Regenerate headVertices based on the new position
      const bodyVertices = Array.from(fish.positions.map((pos, index) =>
        makeEllipseVertices(
          pos.x + canvas.width / 2, // X coord
          pos.y + canvas.height / 2, // Y coord
          [fish.sizes[index]] // Size of body circle
      )));

      // Generate bottom fins
      const bottomFinVertices = [];
      bottomFinVertices.push(makeEllipseVertices(
        bottomFinLocations.f.locs.l.x + canvas.width / 2, // Front left bottom fin X coord
        bottomFinLocations.f.locs.l.y + canvas.height / 2, // Front left bottom fin Y coord
        [fish.bottomFinSizes[0], fish.bottomFinSizes[0] / 2], // Fin radiuses (making oval)
        false, // False for circle (making oval)
        false, // False for half (making whole ellipse)
        bottomFinLocations.f.dir, // Direction that front bottom fins face
        fish.finRotation // Inward rotation of front left bottom fin
      ));
      bottomFinVertices.push(makeEllipseVertices(
        bottomFinLocations.f.locs.r.x + canvas.width / 2, // Front right bottom fin X coord
        bottomFinLocations.f.locs.r.y + canvas.height / 2,
        [fish.bottomFinSizes[0], fish.bottomFinSizes[0] / 2],
        false,
        false,
        bottomFinLocations.f.dir,
        -fish.finRotation
      ));
      bottomFinVertices.push(makeEllipseVertices(
        bottomFinLocations.b.locs.l.x + canvas.width / 2, // Back left bottom fin X coord
        bottomFinLocations.b.locs.l.y + canvas.height / 2,
        [fish.bottomFinSizes[1], fish.bottomFinSizes[1] / 2],
        false,
        false,
        bottomFinLocations.b.dir,
        fish.finRotation
      ));
      bottomFinVertices.push(makeEllipseVertices(
        bottomFinLocations.b.locs.r.x + canvas.width / 2, // Back right bottom fin X coord
        bottomFinLocations.b.locs.r.y + canvas.height / 2,
        [fish.bottomFinSizes[1], fish.bottomFinSizes[1] / 2],
        false,
        false,
        bottomFinLocations.b.dir,
        -fish.finRotation
      ));

      bottomFinVertices.forEach((position) => {
        // Update buffer data for each body part
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(vertexLocation);
        gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform4fv(colorLocation, fish.finColor);

        // Rotate each fin accordingly
        // const rotationMatrix = createRotationMatrix(fish.direction[index]);
        // gl.uniformMatrix3fv(resolutionLocation, false, rotationMatrix);

        // Draw bottom fins
        gl.drawArrays(gl.TRIANGLE_FAN, 0, position.length / 2);
      });

      // Generate body circles
      bodyVertices.forEach((position) => {
        // Update buffer data for each body part
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(vertexLocation);
        gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform4fv(colorLocation, fish.color);

        // Rotate each body part
        // const rotationMatrix = createRotationMatrix(fish.direction[index]);
        // gl.uniformMatrix3fv(resolutionLocation, false, rotationMatrix);

        // Draw body circles
        gl.drawArrays(gl.TRIANGLE_FAN, 0, position.length / 2);
      });

      // Generate eyes
      const eyeVertices = [];
      eyeVertices.push(makeEllipseVertices(
        eyeLocations.l.x + canvas.width / 2, // Left eye X coord
        eyeLocations.l.y + canvas.height / 2, // Left eye Y coord
        [fish.eyeSize])); // Eye size
      eyeVertices.push(makeEllipseVertices(
        eyeLocations.r.x + canvas.width / 2, // Right eye X coord
        eyeLocations.r.y + canvas.height / 2, // Right eye Y coord
        [fish.eyeSize])); // Eye size
      
      eyeVertices.forEach((position) => {
        // Update buffer data for each body part
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(vertexLocation);
        gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform4fv(colorLocation, fish.eyeColor);

        // Draw eyes
        gl.drawArrays(gl.TRIANGLE_FAN, 0, position.length / 2);
      });


      // Generate lines in body
      const bodyLineVertices = [];
      const bodyIndices = [
        0, 1, 2,
        0, 2, 3
      ];

      for (var side = 0; side < bodySideLocations.length - 1; side++) {
        const {l: l1, r: r1} = bodySideLocations[side];
        const {l: l2, r: r2} = bodySideLocations[side + 1];

        bodyLineVertices.push([
          l1.x + centerX, l1.y + centerY,
          r1.x + centerX, r1.y + centerY,
          r2.x + centerX, r2.y + centerY,
          l2.x + centerX, l2.y + centerY,
        ]);

      }

      bodyLineVertices.forEach((vertices) => {
        // Bind body line vertices
        const bodyLineBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bodyLineBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Bind body indices
        const bodyIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bodyIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bodyIndices), gl.STATIC_DRAW);

        // Enable vertex attribute array
        gl.enableVertexAttribArray(vertexLocation);
        gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

        // Set uniforms
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform4fv(colorLocation, fish.color);

        // Draw body lines using indices
        gl.drawElements(gl.TRIANGLES, bodyIndices.length, gl.UNSIGNED_SHORT, 0);
      });

      // Generate dorsal fin
      const dorsalFinVertices = [];

      // Dorsal fin portion that always remains. Consider it the base of the fin
      dorsalFinVertices.push(makeEllipseVertices(
        dorsalFinLocation.loc.x  + canvas.width / 2,
        dorsalFinLocation.loc.y + canvas.height / 2,
        [fish.dorsalFinSize, fish.dorsalFinSize / 10],
        false,
        false,
        dorsalFinLocation.dir,
        -dorsalFinLocation.angle
      ));

      // Dorsal fin portion that widens on turns. Like the top of the fin slanting a bit
      const dorsalWidth = (fish.dorsalFinSize / (100/Math.abs(dorsalFinLocation.angle))) + fish.dorsalFinSize / 10;
      dorsalFinVertices.push(makeEllipseVertices(
        dorsalFinLocation.loc.x + canvas.width / 2,
        dorsalFinLocation.loc.y + canvas.height / 2,
        [fish.dorsalFinSize, dorsalWidth],
        false,
        true,
        dorsalFinLocation.dir,
        -dorsalFinLocation.angle
      ));

      dorsalFinVertices.forEach((position) => {

        // Update buffer data for each body part
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(vertexLocation);
        gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform4fv(colorLocation, fish.finColor);

        // Draw dorsal
        gl.drawArrays(gl.TRIANGLE_FAN, 0, position.length / 2);
      });
      
      // Generate tail
      const tailVertices = [];
      tailVertices.push(makeEllipseVertices(
        tailLocation.loc.x + canvas.width / 2,
        tailLocation.loc.y + canvas.height / 2,
        [fish.tailSize, fish.tailSize / 10],
        false,
        false,
        tailLocation.dir,
        -tailLocation.angle
      ))

      const tailWidth = (fish.tailSize / (100/Math.abs(tailLocation.angle))) + fish.tailSize / 15;
      tailVertices.push(makeEllipseVertices(
        tailLocation.loc.x + canvas.width / 2,
        tailLocation.loc.y + canvas.height / 2,
        [fish.tailSize, tailWidth],
        false,
        true,
        tailLocation.dir,
        -tailLocation.angle
      ))

      tailVertices.forEach((position) => {

        // Update buffer data for each body part
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(vertexLocation);
        gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform4fv(colorLocation, fish.finColor);

        // Draw tail
        gl.drawArrays(gl.TRIANGLE_FAN, 0, position.length / 2);
      });


      requestAnimationFrame(render);
    }

    render();
  }

  useEffect(() => {
    try {
      // const fish = new Fish([0.3, 0.7, 1.0, 1.0], 20, 1);
      const fish = new Fish([0.7, 0.5, 0.2, 1.0], 20, 1);
      drawFish(fish);
    }
    catch(e) {
      console.error(e);
    }
  }, []);

  return <canvas ref={canvasRef} className="water-canvas"></canvas>;
};

export default FishCanvas;
