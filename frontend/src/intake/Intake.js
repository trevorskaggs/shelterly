import React from "react";
import { Link } from 'raviger';
import { ListGroup } from 'react-bootstrap'
import { PeopleTable } from "../people/PeopleTables";

const Intake = () => (
    <ListGroup className="flex-fill p-5 h-50">
        <Link href="/intake/workflow/owner">
            <ListGroup.Item action>FROM WALK-IN (OWNER)</ListGroup.Item>
        </Link>
        <Link href="/intake/workflow/reporter">
            <ListGroup.Item action>FROM WALK-IN (NON-OWNER)</ListGroup.Item>
        </Link>
        <Link href="/intake/owner/search">
            <ListGroup.Item action>SEARCH OWNERS</ListGroup.Item>
        </Link>
    </ListGroup>
)

export const OwnerSearch = () => (
    <div>
        <PeopleTable/>
    </div>
)

export default Intake
