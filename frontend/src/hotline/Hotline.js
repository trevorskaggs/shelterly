import React from "react";
import { Link } from 'raviger';
import { Row, ListGroup } from 'react-bootstrap'
import { PersonForm, ServiceRequestForm } from "./HotlineForms";
import { ServiceRequestTable } from "./HotlineTables"
import { PersonView, ServiceRequestView } from "./HotlineViews";


const header_style = {
  textAlign: "center",
};


const btn_style = {
  width: "50%",
  margin: "0 auto",
};

const Hotline = () => (
  <ListGroup className="flex-fill align-self-center">
    <ListGroup.Item action>
    <Link href="/hotline/owner/new">OWNER CALLING</Link>
    </ListGroup.Item>
    <ListGroup.Item action>
    <Link href="/hotline/reporter/new">NON-OWNER CALLING</Link>
    </ListGroup.Item>
    <ListGroup.Item action>
    <Link href="/hotline/servicerequest/list">SEARCH SERVICE REQUESTS</Link>
    </ListGroup.Item>
    <ListGroup.Item action>
    <Link href="/">BACK</Link>
    </ListGroup.Item>
  </ListGroup>
)

export const NewOwner = () => (
  <div>
    <h1 style={header_style}>Owner Information</h1>
    <PersonForm />
  </div>
)

export const UpdateOwner = ({id}) => (
  <div>
    <h1 style={header_style}>Update Owner Information</h1>
    <PersonForm id={id} />
  </div>
)

export const NewReporter = () => (
  <div>
    <PersonForm />
  </div>
)

export const UpdateReporter = ({id}) => (
  <div>
    <h1 style={header_style}>Reporter Information</h1>
    <PersonForm id={id} />
  </div>
)

export const OwnerDetail = ({id}) => (
    <PersonView id={id} />
)

export const ReporterDetail = ({id}) => (
  <div>
    <PersonView id={id} />
  </div>
)

export const ServiceRequestList = () => (
  <div>
    <h1 style={header_style}>Service Requests</h1>
    <br/>
    <ServiceRequestTable />
  </div>
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
    <h1 style={header_style}>Update Service Request Form</h1>
    <br/>
    <ServiceRequestForm id={id} />
  </div>
)

export const ServiceRequestDetail = ({id}) => (
  <div>
    <ServiceRequestView id={id} />
  </div>
)

export default Hotline
