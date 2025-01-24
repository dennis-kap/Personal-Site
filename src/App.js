import React from 'react';
import { Row, Col } from 'react-bootstrap';

import './App.css';
import FishCanvas from './fish/fishRenderer';
import ScrollIcons from './scrollIcons.js'

function App() {
  return (
    <div className="App">
      {/* <img src={process.env.PUBLIC_URL + '/profile_image.png'} alt="profile" /> */}
      <div className="header-wrapper">
        <div class="title-wrapper">
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

      <div class="content-wrapper">
        <header class="category-header experience-header">MY EXPERIENCE</header>
        <Row className = "logos">
          <Col xs={6} sm={6} md={4}>
            <img class="logo" alt='shopify' src={`${process.env.PUBLIC_URL}/icons/shopify.png`} />
          </Col>
          <Col xs={6} sm={6} md={4}>
            <img class="logo" alt='schneider electric' src={`${process.env.PUBLIC_URL}/icons/schneider-electric.png`} />
          </Col>
        </Row>
        <div>
          <ScrollIcons />
        </div>
      </div>
      
      <div class="beach-wrapper">
        <img class="beach-image beach1" alt='beach' src={`${process.env.PUBLIC_URL}/scenery/beach1.png`} />
        <img class="beach-image beach2" alt='beach' src={`${process.env.PUBLIC_URL}/scenery/beach2.png`} />
      </div>

      <div class="content-wrapper">
        <header class="category-header redirects-header">PROJECTS AND SOCIALS</header>
        <div>
          <ScrollIcons />
        </div>
      </div>

      <div class="forest-wrapper">
        <img class="forest-image" alt='forest' src={`${process.env.PUBLIC_URL}/scenery/forest.png`} />
        
      </div>
    </div>
  );
}

export default App;
