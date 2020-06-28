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
  <ListGroup className="flex-fill p-5 h-50">
    <Link href="/hotline/owner/new">
    <ListGroup.Item action>OWNER CALLING</ListGroup.Item>
    </Link>
    <Link href="/hotline/reporter/new">
    <ListGroup.Item action>NON-OWNER CALLING</ListGroup.Item>
    </Link>
    <Link href="/hotline/servicerequest/list">
    <ListGroup.Item action>SEARCH SERVICE REQUEST</ListGroup.Item>
    </Link>
  </ListGroup>
)

export const NewOwner = () => (
  <div>
    <h1 style={header_style}>Owner Information</h1>
    <PersonForm />
  </div>
)

export const UpdateOwner = ({id}) => (
    <PersonForm id={id} />
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
    <ServiceRequestForm id={id} />
  </div>
)

export const ServiceRequestDetail = ({id}) => (
  <div>
    <ServiceRequestView id={id} />
  </div>
)

export default Hotline
