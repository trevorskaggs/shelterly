import React from 'react';
import { Col, Row } from 'react-bootstrap';

function Header({...props}) {

  return (
    <Row className="mt-2" style={{marginBottom:"-15px"}}>
      <Col xs={12} className="d-flex">
        <h1 className="w-100">{props.children}</h1>
      </Col>
    </Row>
  )
}

export default Header;
