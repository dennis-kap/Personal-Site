import React, { useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';

const ScrollIcons = () => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                } else {
                    entry.target.classList.remove('show');
                }
            });
        });

        const hiddenElements = document.querySelectorAll('.hidden');
        hiddenElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    const languages = [
        { alt: 'python', src: '/icons/python.png', label: 'Python' },
        { alt: 'javascript', src: '/icons/javascript.png', label: 'JavaScript' },
        { alt: 'typescript', src: '/icons/typescript.png', label: 'TypeScript' },
        { alt: 'java', src: '/icons/java.png', label: 'Java' },
        { alt: 'sql', src: '/icons/sql.png', label: 'SQL' },
        { alt: 'html', src: '/icons/html.png', label: 'HTML' },
        { alt: 'css', src: '/icons/css.png', label: 'CSS' },
    ];

    const frameworks = [
        { alt: 'react', src: '/icons/react.png', label: 'React' },
        { alt: 'docker', src: '/icons/docker.png', label: 'Docker' },
        { alt: 'graphql', src: '/icons/graphql.png', label: 'GraphQL' },
    ];

    return (
        <div>
            <header>Languages</header>
            <Row className = "icons">
                {languages.map((icon, index) => (
                    <Col className="icon-wrapper" key={index} xs={6} sm={4} md={2}>
                        <div className="icon hidden">
                            <img alt={icon.alt} src={`${process.env.PUBLIC_URL}${icon.src}`} />
                            <p>{icon.label}</p>
                        </div>
                    </Col>
                ))}
            </Row>
            <header>Frameworks and Technologies</header>
            <Row className = "icons g-0">
                {frameworks.map((icon, index) => (
                    <Col className="icon-wrapper" key={index} xs={6} sm={4} md={2}>
                        <div className="icon hidden">
                            <img alt={icon.alt} src={`${process.env.PUBLIC_URL}${icon.src}`} />
                            <p>{icon.label}</p>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
        // <div></div>
    );
};

export default ScrollIcons;
