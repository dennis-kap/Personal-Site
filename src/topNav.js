import React, { useState, useEffect } from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons'

export default function TopNav() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

  return (
    <Container>
      <Navbar 
        expand="lg"
        className={`px-4 navbar ${visible ? "navVisible" : ""}`}
        fixed="top"
        data-bs-theme="dark"
      >
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#experience">Experience</Nav.Link>
              <Nav.Link href="#projects">Projects</Nav.Link>
            </Nav>
            <hr/>
            <Nav>
              <NavDropdown.Divider />
              <Nav.Link href="https://www.linkedin.com/in/dennis-kapitantchouk/">
                <FontAwesomeIcon icon={faLinkedin} />
                LinkedIn
              </Nav.Link>
              <Nav.Link href="https://github.com/dennis-kap">
                <FontAwesomeIcon icon={faGithub} />
                GitHub
              </Nav.Link>
            </Nav>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
}
