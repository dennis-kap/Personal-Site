import React, { useEffect, useRef } from "react";

const FluidSimulation = () => {
    const LOSS = 0.1;
    const GRAVITY_VELOCITY = 2;

    
}

class FluidParticle {
    constructor(exists, fX, fY, vX, vY) {
        this.exists = exists;
        this.fX = fX;
        this.fY = fY;
        this.vX = vX;
        this.vY = vY;
        this.color = [0, 0, 255];
    }

    particle_collision() {
        const positions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (var p = 0; p < positions.length; p++) {
            const compare_pos = [this.fX + positions[0], this.fY + positions[1]];
            

        }
    }

    wall_collision() {

    }

    apply_gravity(grid) {
        const particle_below = grid[this.fX][this.fY - 1];
        if (!particle_below.exists) {
            this.vY -= this.GRAVITY_VELOCITY;
        }
    }

    apply_velocities() {

    }
}

function Fluid() {
    const cols = 100;
    const rows = 20;

    // var grid_indices = [];
    var grid = [];
    for (var r = 0; r < rows; r++) {
        var row = [];
        for (var c = 0; c < cols; c++) {
            const particle = new FluidParticle(!Math.round(Math.random()), c, r, 1, Math.random())
            row.push(particle);
            // grid_indices.push([r, c]);
        }
        grid.push(row);
    }

    // var shuffled_grid = grid_indices
    //     .map(value => ({ value, sort: Math.random() }))
    //     .sort((a, b) => a.sort - b.sort)
    //     .map(({ value }) => value)

    // for (var i = 0; i < shuffled_grid.length; i++) {
    //     var [box_r, box_c] = shuffled_grid[i];
    //     if (i < 200) {
    //         grid[box_r][box_c] = 1;
    //     }
    // }

    // var velocity = [0, 1]; 


    // for (var row = 0; row < grid.length; row++) {
    //     for (var col = 0; col < grid[0].length; col++) {
            
    //     }
    // }



    return (
      <div>
        <canvas id="webglCanvas" width="800" height="160"></canvas>

      </div>
    );
  }

export default Fluid;