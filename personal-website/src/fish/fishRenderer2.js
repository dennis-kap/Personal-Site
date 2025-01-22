import React, { useRef, useEffect } from 'react';
import { Fish } from './Fish.js';

const FishCanvas = () => {
  // Setting up canvas
  const canvasRef = useRef(null);

  function setupShaders(gl) {
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

    return [vertexShader, fragmentShader];
  }

  // Function that creates the program and links shaders
  function setupProgram(gl) {
    const [vertexShader, fragmentShader] = setupShaders(gl);

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

    // Body buffer setup
    const bodyBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bodyBuffer);

    return fishProgram;
  }

  // Updated when screen is resized
  function updateScreen(canvas, gl) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // Function to draw the fish
  function drawFish(gl, canvas, fish, fishProgram) {
    // Get attributes and uniforms
    const vertexLocation = gl.getAttribLocation(fishProgram, 'vertexPosition');
    const resolutionLocation = gl.getUniformLocation(fishProgram, 'uResolution');
    const colorLocation = gl.getUniformLocation(fishProgram, 'fColor');

    // Set screen size
    updateScreen(canvas, gl);

    // Body movement - sets the initial fish body part locations
    fish.moveBody(true, 1);

    // Enable the position attribute
    gl.enableVertexAttribArray(vertexLocation);
    gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

    // Initial load (can translate)
    // body circles and bottom fins

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
        [fish.bottomFinSizes[0], fish.bottomFinSizes[0] / 3], // Fin radiuses (making oval)
        false, // False for circle (making oval)
        false, // False for half (making whole ellipse)
        bottomFinLocations.f.dir, // Direction that front bottom fins face
        fish.finRotation // Inward rotation of front left bottom fin
      ));
      bottomFinVertices.push(makeEllipseVertices(
        bottomFinLocations.f.locs.r.x + canvas.width / 2, // Front right bottom fin X coord
        bottomFinLocations.f.locs.r.y + canvas.height / 2,
        [fish.bottomFinSizes[0], fish.bottomFinSizes[0] / 3],
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

  function makeEllipseVertices(centerX, centerY, radius, circle = true, half = false, bodyAngle = 0, phi = 0) {
    const vertices = [centerX, centerY];

    var startTheta = 0;
    var endTheta = 2 * Math.PI;
    if (half && phi < 0) {
      endTheta -= Math.PI;
    } else if (half && phi > 0) {
      startTheta += Math.PI;
    }

    // Loop through 45 segments (number of triangles making up the circle)
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
            y = defaultX * Math.cos(angle) - defaultY * Math.sin(angle);
            x = defaultX * Math.sin(angle) + defaultY * Math.cos(angle);
        }

        // Translate the rotated point to the center
        vertices.push(centerX + x, centerY + y);
    }

    return new Float32Array(vertices);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    try {
      // const fish = new Fish([0.3, 0.7, 1.0, 1.0], 20, 1);
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerWidth;

      const fish = new Fish([0.7, 0.5, 0.2, 1.0], 15, 2, maxWidth, maxHeight);

      const fishProgram = setupProgram(gl);
      drawFish(gl, canvas, fish, fishProgram);
    }
    catch(e) {
      console.error(e);
    }
  }, []);

  return <canvas ref={canvasRef} className="water-canvas"></canvas>;
};

export default FishCanvas;
