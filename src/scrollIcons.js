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

    return (
        <div>
            <Row className = "icons">
                <Col xs={6} sm={6} md={4}>
                    <div className = "icon hidden">
                        <img alt="python" src={`${process.env.PUBLIC_URL}/icons/python.png`}/>
                        Python
                    </div>
                </Col>
                <Col xs={6} sm={6} md={4}>
                    <div className = "icon hidden">
                        <img alt="javascript" src={`${process.env.PUBLIC_URL}/icons/javascript.png`}/>
                        JavaScript
                    </div>
                </Col>
                <Col xs={6} sm={6} md={4}>
                    <div className = "icon hidden">
                        <img alt="java" src={`${process.env.PUBLIC_URL}/icons/java.png`}/>
                        Java
                    </div>
                </Col>
                <Col xs={6} sm={6} md={4}>
                    <div className = "icon hidden">
                        <img alt="sql" src={`${process.env.PUBLIC_URL}/icons/sql.png`}/>
                        SQL
                    </div>
                </Col>
                <Col xs={6} sm={6} md={4}>
                    <div className = "icon hidden">
                        <img alt="html" src={`${process.env.PUBLIC_URL}/icons/html.png`}/>
                        HTML
                    </div>
                </Col>
                <Col xs={6} sm={6} md={4}>
                    <div className = "icon hidden">
                        <img alt="react" src={`${process.env.PUBLIC_URL}/icons/react.png`}/>
                        React
                    </div>
                </Col>
            </Row>
        </div>
        // <div></div>
    );
};

export default ScrollIcons;
