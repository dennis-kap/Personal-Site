import React, { useRef, useEffect } from 'react';

import './App.css';
import FishCanvas from './fish/fishRenderer';

function App() {
  return (
    <div className="App">
      {/* <img src={process.env.PUBLIC_URL + '/profile_image.png'} alt="profile" /> */}
      <div className="header-wrapper">
        <div class="title-wrapper">
          {/* <div className="sand-background"/> */}
          <FishCanvas/>
          <div class="name-wrapper">
            <div class="name-contents">
              <div class="name-title">
                DENNIS
              </div>
              <div class="name-body">
                SOFTWARE DEVELOPER
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="experience-wrapper">
        <img class="beach-image" alt='beach' src='/beach.png'></img>
        <p>This is my experience</p>
        
      </div>
      <div class="redirects-wrapper">
        <img class="forest-image" alt='forest' src='/forest.png'></img>
        <p>These are my projects</p>
        
      </div>
    </div>
  );
}

export default App;
