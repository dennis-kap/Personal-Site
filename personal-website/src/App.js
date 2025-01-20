import React, { useRef, useEffect } from 'react';

import './App.css';
import FishCanvas from './fish';

function App() {
  return (
    <div className="App">
      {/* <img src={process.env.PUBLIC_URL + '/profile_image.png'} alt="profile" /> */}
      <div className="header-wrapper">
        <div class="name-wrapper">
          <FishCanvas/>
          {/* <div class="name-text">
            DENNIS
          </div> */}
        </div>
      </div>
      <p class="blah">
        blahblah
        blahblah
        blahblah
        blahblah

        blahblah
        blahblah
        blahblah

        blahblah
        blahblah
        blahblah
        blahblah

        blahblah

        blahblah
        blahblah

        blahblah
        blahblah

        blahblah
        
      </p>
    </div>
  );
}

export default App;
