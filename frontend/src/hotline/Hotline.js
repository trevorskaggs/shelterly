import React from "react";
import styled from 'styled-components';

import { Link } from 'raviger';
import { Container, Tab, Tabs } from 'react-bootstrap';
import { PersonForm, ServiceRequestForm } from "./HotlineForms";
import { ServiceRequestTable } from "./HotlineTables"
import { PersonView, ServiceRequestView } from "./HotlineViews";

export const StyledHotline = styled(Container)`
transition: transform 0.3s ease-in-out;
margin: flex;
width: 50%;
padding-top: 12rem;
color: white;
a {
  color: white !important;
  background-color: #454d55 !important; 
}

`

export const UpdateOwner = ({id}) => (
  <div>
    <h1>Update Owner Information</h1>
    <PersonForm id={id} />
  </div>
)

export const NewReporter = () => (
  <div>
    <h1>Reporter Information</h1>
    <PersonForm />
  </div>
)

export const UpdateReporter = ({id}) => (
  <div>
    <h1>Reporter Information</h1>
    <PersonForm id={id} />
  </div>
)

export const OwnerDetail = ({id}) => (
  <div>
    <PersonView id={id} />
  </div>
)

export const ReporterDetail = ({id}) => (
  <div>
    <PersonView id={id} />
  </div>
)

export const ServiceRequestList = () => (
  <div>
    <h1>Service Requests</h1>
    <br/>
    <ServiceRequestTable />
  </div>
)

export const NewServiceRequest = () => (
  <div>
    <h1>Service Request Form</h1>
    <br/>
    <ServiceRequestForm />
  </div>
)

export const UpdateServiceRequest = ({id}) => (
  <div>
    <h1>Update Service Request Form</h1>
    <br/>
    <ServiceRequestForm id={id} />
  </div>
)

export const ServiceRequestDetail = ({id}) => (
  <div>
    <ServiceRequestView id={id} />
  </div>
)


const Hotline = ({open, ...props}) => (
  <StyledHotline open={open} {...props}>
    <Tabs>
      <Tab eventKey="new_owner" title="Owner Calling">
        <PersonForm />
      </Tab>
      <Tab eventKey="new_reporter" title="Non-Owner Calling">
        <PersonForm />
      </Tab>
      <Tab eventKey="service_requests" title="Search Service Requests">
        <ServiceRequestTable />
      </Tab>
    </Tabs>
    <Link className="btn btn-secondary btn-lg btn-block"  href="/">BACK</Link>
  </StyledHotline>
)


export default Hotline
