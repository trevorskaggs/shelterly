import React from "react";
import { Link } from 'raviger';
import { ListGroup } from 'react-bootstrap'
import { ServiceRequestForm } from "./HotlineForms";
import { ServiceRequestView } from "./HotlineViews";

const header_style = {
  textAlign: "center",
};

const Hotline = () => (
  <ListGroup className="flex-fill p-5 h-50">
    <Link href="/hotline/owner/new">
    <ListGroup.Item action>OWNER CALLING</ListGroup.Item>
    </Link>
    <Link href="/hotline/reporter/new">
    <ListGroup.Item action>NON-OWNER CALLING</ListGroup.Item>
    </Link>
    <Link href="/hotline/first_responder/new">
    <ListGroup.Item action>FIRST RESPONDER CALLING</ListGroup.Item>
    </Link>
    <Link href="/hotline/servicerequest/search">
    <ListGroup.Item action>SEARCH SERVICE REQUESTS</ListGroup.Item>
    </Link>
  </ListGroup>
)

export const NewServiceRequest = () => (
  <div>
    <h1 style={header_style}>Service Request Form</h1>
    <br/>
    <ServiceRequestForm />
  </div>
)

export const UpdateServiceRequest = ({id}) => (
  <div>
    <ServiceRequestForm id={id} />
  </div>
)

export const ServiceRequestDetail = ({id}) => (
  <div>
    <ServiceRequestView id={id} />
  </div>
)

export default Hotline
