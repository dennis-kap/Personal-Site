import React, { useRef, useEffect } from 'react';

class Fish {
    constructor(color, size, velocity) {
        this.color = color;
        this.size = size;
        this.velocity = velocity;

        const proportions = [1.0, 1.2, 1.0, 0.9, 0.8, 0.6, 0.4, 0.3];
        this.sizes = Array.from(proportions).map((val) => val * this.size);

        this.positions = Array(8).fill(null).map(() => ({x: 0, y: 0}));

        this.direction = Array(8).fill(Math.floor(Math.random() * 360));
        this.turnChance = {dir: Math.random > 0.5 ? "r" : "l", chance: 0};
    }

    bodyFollow() {

    }

    changeDirection(amount) {
      const newDirection = this.turnChance.dir === "r" ? 
        this.direction[0] + amount : this.direction[0] - amount;

      if (newDirection > 360) {
        this.direction[0] = newDirection - 360;
      } else if (newDirection < 0) {
        this.direction[0] = newDirection + 360;
      } else {
        this.direction[0] = newDirection;
      }
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
          const angleToPrev = Math.atan2(prevPartLoc.x - curPartLoc.x, prevPartLoc.y - curPartLoc.y) * (180 / Math.PI);
          this.direction[partNumber] = angleToPrev;

          // Set the next location of the current body part to be the previous body part's radius
          // in the direction opposite of the current body part's direction
          const oppositeAngle = angleToPrev + 180 > 360 ? angleToPrev - 180 : angleToPrev + 180;
          [xVec, yVec] = this.calculateVectorAmounts(oppositeAngle);
        }


        this.positions[partNumber].x = this.positions[partNumber - 1].x + (xVec * this.sizes[partNumber - 1]);
        this.positions[partNumber].y = this.positions[partNumber - 1].y + (yVec * this.sizes[partNumber - 1]);

        this.moveBody(initial, partNumber + 1);
      }
    }
    
    getEyes() {

    }

    getFins() {

    }
}

const FishCanvas = () => {
  const canvasRef = useRef(null);

  function createTranslationMatrix(tx, ty) {
    return [
      1, 0, tx,
      0, 1, ty
    ];
  }
  
  function createRotationMatrix(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
      cos, -sin, 0,
      sin, cos, 0
    ];
  }

  function multiplyMatrices(a, b) {
    const result = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        result[row * 3 + col] =
          a[row * 3 + 0] * b[0 * 3 + col] +
          a[row * 3 + 1] * b[1 * 3 + col] +
          a[row * 3 + 2] * b[2 * 3 + col];
      }
    }
    return result;
  }

  function makeCircleVertices(centerX, centerY, radius) {
    const vertices = [centerX, centerY];

    for (var i=0; i<=360; i++) {
      const angle = (i / 360) * 2 * Math.PI;
      vertices.push(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );
    }

    return new Float32Array(vertices);
  }

  function drawFish(fish) {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
  
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
  
    // Create circle vertices
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const headVertices = makeCircleVertices(fish.positions[0].x + centerX, fish.positions[0].y + centerY, fish.size);

    fish.moveBody(true, 1);
  
    // Buffer setup
    const headVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, headVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, headVertices, gl.STATIC_DRAW);
  
    // Vertex shader
    const vertexShaderSource = `
      precision mediump float;

      attribute vec2 vertexPosition;
      uniform vec2 uResolution;
      uniform mat2x3 uTransformMatrix;

      void main() {
        vec2 transformedPosition = (uTransformMatrix * vec3(vertexPosition, 1.0)).xy;
        vec2 normalizedPosition = transformedPosition / uResolution * 2.0 - 1.0;

        normalizedPosition.y = -normalizedPosition.y;

        gl_Position = vec4(normalizedPosition, 0.0, 1.0);
      }`;
  
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
  
    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;
  
      void main() {
        gl_FragColor = vec4(0.3, 0.7, 1.0, 1.0);
      }`;
  
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
  
    // Shader program
    const fishHeadShaderProgram = gl.createProgram();
    gl.attachShader(fishHeadShaderProgram, vertexShader);
    gl.attachShader(fishHeadShaderProgram, fragmentShader);
    gl.linkProgram(fishHeadShaderProgram);
  
    const vertexPositionAttributeLocation = gl.getAttribLocation(fishHeadShaderProgram, 'vertexPosition');
    if (vertexPositionAttributeLocation < 0) {
      console.error("Error - failed to get attrib location");
      return;
    }
  
    // Resize canvas and viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  
    // Clear canvas
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Use shader program
    gl.useProgram(fishHeadShaderProgram);

    // Uniform resolution
    const resolutionUniformLocation = gl.getUniformLocation(fishHeadShaderProgram, 'uResolution');
    const transformMatrixUniformLocation = gl.getUniformLocation(fishHeadShaderProgram, 'uTransformMatrix');
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

    gl.enableVertexAttribArray(vertexPositionAttributeLocation);
  
    // Input assembler
    gl.bindBuffer(gl.ARRAY_BUFFER, headVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    function render() {
      fish.possiblyChangeDirection(window.innerWidth, window.innerHeight);
      fish.moveHead();
      const angle = fish.direction[0];
    
      // Regenerate headVertices based on the new position
      const headVertices = makeCircleVertices(
        fish.positions[0].x + canvas.width / 2,
        fish.positions[0].y + canvas.height / 2,
        fish.size
      );
    
      // Update the vertex buffer with the new vertices
      gl.bindBuffer(gl.ARRAY_BUFFER, headVerticesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, headVertices, gl.STATIC_DRAW);
    
      // Create transformation matrices
      const translationMatrix = createTranslationMatrix(fish.positions[0].x, fish.positions[0].y);
      const rotationMatrix = createRotationMatrix(angle);
    
      // Combine translation and rotation
      const transformMatrix = multiplyMatrices(translationMatrix, rotationMatrix);
      gl.uniformMatrix3fv(transformMatrixUniformLocation, false, new Float32Array(transformMatrix));
    
      // Clear canvas and draw the fish
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, headVertices.length / 2);
    
      requestAnimationFrame(render);
    }    

    render();
  }

  useEffect(() => {
    try {
      const fish = new Fish('blue', 20, 1);
      drawFish(fish);
    }
    catch(e) {
      console.error(e);
    }
  }, []);

  return <canvas ref={canvasRef} className="water-canvas"></canvas>;
};

export default FishCanvas;
