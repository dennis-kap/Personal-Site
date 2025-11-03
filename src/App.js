import {useRef} from 'react';

import './App.css';
import FishCanvas from './fish/fishRenderer';
import TopNav from './topNav.js';
import Experiences from './experiences.js'

function App() {
  const experienceRef = useRef(null);
  const scrollToExperiences = () => {
    if (experienceRef.current) {
      experienceRef.current.scrollIntoView({behavior: 'smooth'});
    }
  };

  return (
    <div className="App">
      <TopNav/>
      <div className="header-wrapper" id="home">
        <div className="title-wrapper">
          <FishCanvas/>
          <div className="name-wrapper">
            <div className="name-contents">
              <div className="name-title">
                DENNIS
              </div>
              <div className="name-body">
                SOFTWARE DEVELOPER
              </div>
              <button onClick={scrollToExperiences}>
                VIEW MY WORK ↓
              </button>
            </div>
          </div>
        </div>
      </div>

      <Experiences/>

      <div className="beach-wrapper">
        <img className="beach-image beach1" alt='beach' src={`${process.env.PUBLIC_URL}/scenery/beach1.png`} />
        <img className="beach-image beach2" alt='beach' src={`${process.env.PUBLIC_URL}/scenery/beach2.png`} />
      </div>

      <div className="content-wrapper">
        <header className="category-header redirects-header">Projects</header>
      </div>

      <div className="forest-wrapper">
        <img className="forest-image" alt='forest' src={`${process.env.PUBLIC_URL}/scenery/forest.png`} />
      </div>
    </div>
  );
}

export default App;
