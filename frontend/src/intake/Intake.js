import React from "react";
import { Link } from 'raviger';
import { ListGroup } from 'react-bootstrap'
import {OwnerTable} from "./OwnerTables";

const header_style = {
  textAlign: "center",
};

const Intake = () => (
    <ListGroup className="flex-fill p-5 h-50">
        <Link href="/intake/owner/new">
            <ListGroup.Item action>FROM WALK-IN (OWNER)</ListGroup.Item>
        </Link>
        <Link href="/intake/reporter/new">
            <ListGroup.Item action>FROM WALK-IN (NON-OWNER)</ListGroup.Item>
        </Link>
        <Link href="/intake/owner/search">
            <ListGroup.Item action>OWNERS</ListGroup.Item>
        </Link>
    </ListGroup>
)

export const IntakeSummary = () => (
  <div>
    <h1 style={header_style}>Intake Summary</h1>
    <br/>
    {/* <IntakeView /> */}
  </div>
)

export const OwnerSearch = () => (
    <div>
        <h1 style={header_style}>Owner Search</h1>
        <br/>
        <OwnerTable/>
    </div>
)

export default Intake
