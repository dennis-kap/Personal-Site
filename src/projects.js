import { Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

function Projects() {
  return (
    <div className="content-wrapper projects-wrapper">
      <header className="category-header scroll-target" id="projects">Projects</header>
      <Row className="logos justify-content-center">
        <Col xs={12} sm={10} md={10}>
          <div className="logo screenshot">
            <div className="logo-image-label screenshot-image">
              <img alt='Tetris' src={`${process.env.PUBLIC_URL}/screenshots/tetris.gif`} />
            </div>
            <div className="screenshot-body">
              <a href="https://github.com/dennis-kap/Tetris_Clone">
                <h1 className="screenshot-label" >
                <FontAwesomeIcon icon={faGithub} />
                Tetris
              </h1>
              </a>
              <div className="logo-text">
                Using Python and Pygame, created a clone of the game Tetris, where users can customize game resolution and play size.
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={10} md={10}>
          <div className="logo screenshot">
            <div className="logo-image-label screenshot-image">
              <img alt='Scenery' src={`${process.env.PUBLIC_URL}/screenshots/scenery.gif`} />
            </div>
            <div className="screenshot-body">
              <a href="https://github.com/dennis-kap/scenery-sim">
                <h1 className="screenshot-label" >
                <FontAwesomeIcon icon={faGithub} />
                Scenery Simulation
              </h1>
              </a>
              <div className="logo-text">
                Created a scenery simulation using React JS, Javascript, HTML and CSS. Weather and conditions can be adjusted with sliders and selections.
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={10} md={10}>
          <div className="logo screenshot">
            <div className="logo-image-label screenshot-image">
              <img alt='TMU-Connect' src={`${process.env.PUBLIC_URL}/screenshots/tmu_connect.png`} />
            </div>
            <div className="screenshot-body">
              <a href="https://github.com/CPS-630/tmu_connect">
                <h1 className="screenshot-label" >
                <FontAwesomeIcon icon={faGithub} />
                TMU Connect
              </h1>
              </a>
              <div className="logo-text">
                In a team of 5, collaborated on a marketplace platform with functionality to post ads, upload images, filter and communicate with others.
                The website used Node.js, React, Typescript, Docker, SQL, AWS and Auth0 (for authentication).
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Projects;