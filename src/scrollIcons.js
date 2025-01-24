import React, { useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';

const ScrollIcons = () => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        });

        const hiddenElements = document.querySelectorAll('.hidden');
        hiddenElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    const iconData = [
        { alt: 'python', src: '/icons/python.png', label: 'Python' },
        { alt: 'javascript', src: '/icons/javascript.png', label: 'JavaScript' },
        { alt: 'java', src: '/icons/java.png', label: 'Java' },
        { alt: 'sql', src: '/icons/sql.png', label: 'SQL' },
        { alt: 'html', src: '/icons/html.png', label: 'HTML' },
        { alt: 'react', src: '/icons/react.png', label: 'React' },
    ];

    return (
        <div>
            <Row className = "icons">
                {iconData.map((icon, index) => (
                    <Col key={index} xs={6} sm={4} md={3}>
                        <div className="icon hidden">
                            <img alt={icon.alt} src={`${process.env.PUBLIC_URL}${icon.src}`} />
                            {icon.label}
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
        // <div></div>
    );
};

export default ScrollIcons;
