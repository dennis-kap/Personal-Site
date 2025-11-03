import { Row, Col } from 'react-bootstrap';

function Experiences() {
  return (
    <div className="content-wrapper scroll-target" id="experience">
      <header className="category-header experience-header">Experience</header>
      <Row className="logos justify-content-center">
        <Col xs={12} sm={10} md={10}>
          <div className="logo">
            <div className="logo-image-label">
              <img alt='google' src={`${process.env.PUBLIC_URL}/icons/google.png`} />
              <span className="logo-label">Google</span>
            </div>
            <div className="logo-text">
              Worked as a Software Engineering Intern on the Google Cloud AI team to develop AI powered insights of bank customers
              with the use of Python, Gemini, TypeScript, and Piper for version control.
            </div>
          </div>
        </Col>

        <Col xs={12} sm={10} md={10}>
          <div className="logo">
            <div className="logo-image-label">
              <img alt='shopify' src={`${process.env.PUBLIC_URL}/icons/shopify.png`} />
              <span className="logo-label">Shopify</span>
            </div>
            <div className="logo-text">
              Contributed to the Managed Markets team as a Software Engineering Intern to build new features and improve existing
              ones on the frontend using TypeScript and GraphQL queries.
            </div>
          </div>
        </Col>

        <Col xs={12} sm={10} md={10}>
          <div className="logo">
            <div className="logo-image-label">
              <img alt='schneider' src={`${process.env.PUBLIC_URL}/icons/schneider-electric.png`} />
              <span className="logo-label">Schneider Electric</span>
            </div>
            <div className="logo-text">
              Worked as an Application Engineering Intern and helped develop a Django web application for internal use, as well as
              create a JavaScript, Google Sheets tool to automate the generation of new hire scheduling.
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Experiences;