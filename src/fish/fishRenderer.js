import React, { useRef, useEffect } from 'react';
import { Fish } from './Fish.js';

const SIZE_SCALAR = 0.25;
const CANVAS_COLOR = [0.0, 0.15, 0.4, 0.6];

// The viewheight in CSS is set to 150
// To compensate, the aspect ratio needs to be modified by 1.5
const VIEW_HEIGHT_ASPECT = 1.5;

const FishCanvas = () => {
  // Setting up canvas
  const canvasRef = useRef(null);

  function setupShaders(gl) {
    // Vertex shader
    const vertexShaderSource = `
      precision mediump float;

      attribute vec2 vertexPosition;
      uniform vec2 uResolution;
      uniform float viewHeightAspect;

      uniform vec2 uTranslation;

      uniform vec2 uCenter;
      uniform float uRotation;

      void main() {
        // Translate position to origin
        vec2 translatedToOrigin = vertexPosition - uCenter;

        // Rotate around the origin
        float cosTheta = cos(uRotation);
        float sinTheta = sin(uRotation);
        vec2 rotatedAtOrigin = vec2(
            cosTheta * translatedToOrigin.x - sinTheta * translatedToOrigin.y,
            sinTheta * translatedToOrigin.x + cosTheta * translatedToOrigin.y
        );

        // Translate back to position
        vec2 translatedBack = rotatedAtOrigin + uCenter;

        // Apply translation
        vec2 finalPosition = translatedBack + uTranslation;

        // Normalize the position and maintain aspect ratio
        vec2 normalizedPosition = (finalPosition / uResolution) * 2.0 - 1.0;

        // Compensating for CSS viewheight
        vec2 aspectCorrectedPosition = vec2(normalizedPosition.x * viewHeightAspect, normalizedPosition.y);

        gl_Position = vec4(aspectCorrectedPosition, 0.0, 1.0);
      }
    `;
  
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
  function updateScreen(canvas, gl, fishArray) {
    const maxWidth = window.innerWidth * SIZE_SCALAR;
    const maxHeight = window.innerHeight * SIZE_SCALAR;
    
    canvas.width = maxWidth;
    canvas.height = maxHeight;

    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // Function that creates the initial ellipse vertices
  function initialEllipsePositions(positions, canvas) {
    // Get initial positions to get translation by subtracting from new positions
    const initialCirclePositions = positions.map((pos) => ({
      x: pos.x + canvas.width / 2, // X coord
      y: pos.y + canvas.height / 2 // Y coord
    }));

    // Generating the initial circles
    const circleVertices = Array.from(positions.map((pos) => {
      return makeEllipseVertices(
        pos.x + canvas.width / 2, // X coord
        pos.y + canvas.height / 2, // Y coord
        [pos.size] // Size of circle
      )
    }));

    return [initialCirclePositions, circleVertices];
  };

  // Function to get initial bottom fin  positions, direction
  function initialBottomFinData(positions, canvas) {
    const [initialBottomFinPositions, _] = initialEllipsePositions(positions, canvas);

    const initialBottomFinDirections = Array.from(positions.map((pos) => (
      pos.dir
    )));

    // Generating the initial circles
    const bottomFinVertices = Array.from(positions.map((pos) => {
      return makeEllipseVertices(
        pos.x + canvas.width / 2, // X coord
        pos.y + canvas.height / 2, // Y coord
        pos.sizes, // Size of ellipse
        false, // Not a circle
        false, // Full ellipse
        pos.dir, // Main direction
        pos.angle // phi
      )
    }));

    return [initialBottomFinPositions, initialBottomFinDirections, bottomFinVertices];
  };

  function getFishArrayData(fishArray, canvas) {
    const fishArrayData = fishArray.map(fish => {
      const [initialBottomFinPositions, initialBottomFinDirections, bottomFinVertices] = initialBottomFinData(fish.bottomFinLocations, canvas);
      const [initialEyePositions, eyeVertices] = initialEllipsePositions(fish.eyeLocations, canvas);
      const [initialSegmentPositions, bodyVertices] = initialEllipsePositions(fish.bodySegmentLocations, canvas);
  
      return {
          initialBottomFinPositions,
          initialBottomFinDirections,
          bottomFinVertices,
          initialEyePositions,
          eyeVertices,
          initialSegmentPositions,
          bodyVertices,
      };
    });

    return fishArrayData;
  }

  // Function to draw the fish
  function drawFish(gl, canvas, fishArray, fishProgram) {
    // Get attributes and uniforms
    const vertexLocation = gl.getAttribLocation(fishProgram, 'vertexPosition');
    const resolutionLocation = gl.getUniformLocation(fishProgram, 'uResolution');
    const viewHeightLocation = gl.getUniformLocation(fishProgram, 'viewHeightAspect');

    const colorLocation = gl.getUniformLocation(fishProgram, 'fColor');

    const translationLocation = gl.getUniformLocation(fishProgram, "uTranslation");

    const rotationLocation = gl.getUniformLocation(fishProgram, "uRotation");
    const centerLocation = gl.getUniformLocation(fishProgram, "uCenter");

    gl.uniform1f(viewHeightLocation, VIEW_HEIGHT_ASPECT);

    // Body movement - sets the initial fish body part locations
    fishArray.forEach((fish) => {
      fish.moveBody(true, 1); // True for initial setup
      fish.updateVertices();
    });

    // Enable the position attribute
    gl.enableVertexAttribArray(vertexLocation);
    gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

    const fishArrayData = getFishArrayData(fishArray, canvas);

    // Drawing the parts that can be transformed (translated/rotated)
    const drawPart = (vertices, curData, prevLoc, prevDir, color, centerX, centerY) => {
      vertices.forEach((position, index) => {
        // Upload vertex data
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
      
        gl.uniform4fv(colorLocation, color);
      
        // Set the translation for the current fin
        const xTranslation = curData[index].x - prevLoc[index].x + centerX;
        const yTranslation = curData[index].y - prevLoc[index].y + centerY;
        gl.uniform2f(translationLocation, xTranslation, yTranslation);

        const partCenter = [prevLoc[index].x, prevLoc[index].y];

        if (prevDir.length > 0) {
          // Set rotation angle
          const partRotation = prevDir[index] - curData[index].dir
          const rotationRadians = partRotation * (Math.PI / 180);
          gl.uniform1f(rotationLocation, rotationRadians);
          gl.uniform2fv(centerLocation, partCenter);
        }
        
        // Draw the part
        gl.drawArrays(gl.TRIANGLE_FAN, 0, position.length / 2);
      });
    }

    function render() {
      // Get center of screen
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.clearColor(...CANVAS_COLOR);

      // Set universal values used for generation

      // Enable vertex attributes
      gl.enableVertexAttribArray(vertexLocation);
      gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      // Reset translation for all drawing that does not use translation
      const resetTransformations = () => {
        gl.uniform2f(translationLocation, 0, 0);
        gl.uniform1f(rotationLocation, 0);
        gl.uniform2f(centerLocation, 0, 0);
      }

      // Apply fish movements
      fishArray.forEach((fish, index) => {
        fish.possiblyChangeDirection(canvas.width, canvas.height);
        fish.moveHead();

        fish.updateVertices();

        const bottomFinLocations = fish.bottomFinLocations;
        const eyeLocations = fish.eyeLocations;
        const bodySegmentLocations = fish.bodySegmentLocations;
        const bodySideLocations = fish.bodySideLocations;
        const dorsalAndTailLocations = fish.dorsalAndTailLocations;

        // !!!!! Rendering the body lines that make the sides of the fish
        const renderBodyLines = () => {
          // Generate lines in body
          const bodyLineVertices = [];
          // Indices used to show the order of connecting points to make a quadrilateral
          const bodyIndices = [
            0, 1, 2,
            0, 2, 3
          ];

          // Drawing the quadrilaterals
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

            // Set attributes and uniforms
            gl.enableVertexAttribArray(vertexLocation);
            gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);

            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.uniform4fv(colorLocation, fish.color);

            // Draw body lines using indices
            gl.drawElements(gl.TRIANGLES, bodyIndices.length, gl.UNSIGNED_SHORT, 0);
          });
        };

        // !!!!! Rendering dorsal fin and tail
        const renderDorsalAndTail = () => {
          // Generate dorsal fin
          const dorsalAndTailVertices = [];

          dorsalAndTailLocations.forEach((fin) => {
            dorsalAndTailVertices.push(makeEllipseVertices(
              fin.loc.x  + canvas.width / 2,
              fin.loc.y + canvas.height / 2,
              [fin.length, fin.width],
              false,
              fin.circle,
              fin.dir,
              fin.angle
            ));
          });

          dorsalAndTailVertices.forEach((position) => {
            // Update buffer data for each body part
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

            gl.uniform4fv(colorLocation, fish.finColor);

            // Draw dorsal
            gl.drawArrays(gl.TRIANGLE_FAN, 0, position.length / 2);
          });
        };

        // Rendering called in a specific order to layer certain
        // parts of the fish on top of the others

        const curFish = fishArrayData[index];

        drawPart(
          curFish.bottomFinVertices, bottomFinLocations, curFish.initialBottomFinPositions,
          curFish.initialBottomFinDirections, fish.finColor, centerX, centerY
        );
        resetTransformations();
        drawPart(
          curFish.eyeVertices, eyeLocations, curFish.initialEyePositions,
          [], fish.eyeColor, centerX, centerY
        );
        resetTransformations();
        drawPart(
          curFish.bodyVertices, bodySegmentLocations, curFish.initialSegmentPositions,
          [], fish.color, centerX, centerY
        );
        resetTransformations();
        renderBodyLines();
        renderDorsalAndTail();

      });

      requestAnimationFrame(render);
    }

    render();
  }

  // Function that makes an ellipse based on given parameters
  // Used for circles or fins in the shape of ovals
  function makeEllipseVertices(centerX, centerY, radius, circle = true, half = false, bodyAngle = 0, phi = 0) {
    if (Array.isArray(radius) && radius.length > 1 && circle) {
      console.error("Can't make a circle with different radius values");
    }
    const vertices = [centerX, centerY];

    var startTheta = 0;
    var endTheta = 2 * Math.PI;
    if (half && phi < 0) {
      endTheta -= Math.PI;
    } else if (half && phi > 0) {
      startTheta += Math.PI;
    }

    // Loop through 30 segments (number of triangles making up the circle)
    for (let i = 0; i <= 30; i++) {
        const theta = startTheta + (i / 30) * (half ? 1 : 2) * (endTheta - startTheta);

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
            x = defaultX * Math.sin(angle) + defaultY * Math.cos(angle);
            y = defaultX * Math.cos(angle) - defaultY * Math.sin(angle);
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
      const maxWidth = window.innerWidth * SIZE_SCALAR;
      const maxHeight = window.innerHeight * SIZE_SCALAR;

      canvas.width = maxWidth;
      canvas.height = maxHeight;

      const fish1 = new Fish([0.7, 0.5, 0.2, 1.0], 3, 0.6, maxWidth, maxHeight);
      const fish2 = new Fish([0.7, 0.5, 0.7, 1.0], 5, 0.5, maxWidth, maxHeight);
      const fish3 = new Fish([0.6, 0.6, 0.8, 1.0], 2.5, 0.7, maxWidth, maxHeight);
      const fishArray = [fish1, fish2, fish3];

      const fishProgram = setupProgram(gl);
      drawFish(gl, canvas, fishArray, fishProgram);

      updateScreen(canvas, gl, fishArray);

      window.addEventListener("resize", () => updateScreen(canvas, gl, fishArray));

      return () => {
        window.removeEventListener("resize", () => updateScreen(canvas, gl, fishArray));
      };
    }
    catch(e) {
      console.error(e);
    }
  }, []);


  return <canvas
    ref={canvasRef}
    className="water-canvas"
  />;
};

export default FishCanvas;
