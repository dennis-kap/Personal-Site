import React, { useRef, useEffect } from 'react';

class Fish {
    constructor(color, size, velocity) {
        this.color = new Float32Array(color);
        this.size = size;
        this.velocity = velocity;

        const proportions = [1.0, 1.1, 1.0, 0.9, 0.8, 0.6, 0.4, 0.3];
        this.sizes = Array.from(proportions).map((val) => val * this.size);

        this.positions = Array(8).fill(null).map(() => ({x: 0, y: 0}));

        this.direction = Array(8).fill(Math.floor(Math.random() * 360));
        this.turnChance = {dir: Math.random > 0.5 ? "r" : "l", chance: 0};
    }

    // bodyFollow() {

    // }

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
          const angleToPrev = Math.atan2(prevPartLoc.y - curPartLoc.y, prevPartLoc.x - curPartLoc.x) * (180 / Math.PI);
          this.direction[partNumber] = angleToPrev;

          // Set the next location of the current body part to be the previous body part's radius
          // in the direction opposite of the current body part's direction
          const oppositeAngle = (angleToPrev + 180) % 360;
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

  // function createTranslationMatrix(tx, ty) {
  //   return [
  //     1, 0, tx,
  //     0, 1, ty
  //   ];
  // }
  
  function createRotationMatrix(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
      cos, -sin, 0,
      sin, cos, 0,
      0, 0, 1
    ];
  }

  // function multiplyMatrices(a, b) {
  //   const result = [];
  //   for (let row = 0; row < 3; row++) {
  //     for (let col = 0; col < 3; col++) {
  //       result[row * 3 + col] =
  //         a[row * 3 + 0] * b[0 * 3 + col] +
  //         a[row * 3 + 1] * b[1 * 3 + col] +
  //         a[row * 3 + 2] * b[2 * 3 + col];
  //     }
  //   }
  //   return result;
  // }

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

    // Set canvas size once
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

    // // Uniform resolution
    // const resolutionUniformLocation = gl.getUniformLocation(fishHeadShaderProgram, 'uResolution');
    // const transformMatrixUniformLocation = gl.getUniformLocation(fishHeadShaderProgram, 'uTransformMatrix');
    // gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

    function render() {
      // Apply fish movements
      fish.possiblyChangeDirection(window.innerWidth, window.innerHeight);
      fish.moveHead();

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.clearColor(0.08, 0.08, 0.08, 1.0);

      // Regenerate headVertices based on the new position
      const bodyVertices = Array.from(fish.positions.map((pos, index) =>
        makeCircleVertices(pos.x + canvas.width / 2, pos.y + canvas.height / 2, fish.sizes[index])));

      bodyVertices.forEach((position, index) => {
        // Update buffer data for each body part
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(vertexLocation);
        gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform4fv(colorLocation, fish.color);

        // Rotate each body part
        const rotationMatrix = createRotationMatrix(fish.direction[index]);
        gl.uniformMatrix3fv(resolutionLocation, false, rotationMatrix);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, position.length / 2);
      });

      requestAnimationFrame(render);
    }

    render();
  }

  useEffect(() => {
    try {
      const fish = new Fish([0.3, 0.7, 1.0, 1.0], 20, 1);
      drawFish(fish);
    }
    catch(e) {
      console.error(e);
    }
  }, []);

  return <canvas ref={canvasRef} className="water-canvas"></canvas>;
};

export default FishCanvas;
