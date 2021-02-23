import React from "react";
import { Link } from 'raviger';
import { Col, ListGroup, Row } from 'react-bootstrap';
import Header from "../components/Header";

const Intake = () => (
  <>
  <Header>Intake</Header>
  <hr/>
  <Row className="mr-0">
    <Col xs={4}>
      <ListGroup className="flex-fill">
        <Link href="/intake/workflow/owner">
          <ListGroup.Item className="rounded" action>FROM WALK-IN (OWNER)</ListGroup.Item>
        </Link>
        <Link href="/intake/workflow/reporter">
          <ListGroup.Item className="rounded" action>FROM WALK-IN (NON-OWNER)</ListGroup.Item>
        </Link>
        <Link href="/intake/owner/search">
          <ListGroup.Item className="rounded" action>SEARCH OWNERS</ListGroup.Item>
        </Link>
      </ListGroup>
    </Col>
  </Row>
  </>
)

export default Intake
