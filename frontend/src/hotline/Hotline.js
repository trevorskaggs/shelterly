import React from "react";
import styled from 'styled-components';

import { Link } from 'raviger';
import { PersonForm, ServiceRequestForm } from "./HotlineForms";
import { ServiceRequestTable } from "./HotlineTables"
import { PersonView, ServiceRequestView } from "./HotlineViews";

export const StyledHotline = styled.div`
  transform: ${({ open }) => open ? 'translateX(10%)' : 'translateX(0)'};
  transition: transform 0.3s ease-in-out;
`

const header_style = {
  textAlign: "center",
};

const link_style = {
  textDecoration: "none",
};

const btn_style = {
  width: "50%",
  margin: "0 auto",
};

const Hotline = ({open, ...props}) => (
  <StyledHotline open={open} {...props}>
  <div style={btn_style}>
    <Link href="/hotline/owner/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">OWNER CALLING</Link>
    <Link href="/hotline/reporter/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">NON-OWNER CALLING</Link>
    <Link href="/hotline/servicerequest/list" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">SEARCH SERVICE REQUESTS</Link>
    <br/>
    <br/>
    <Link className="btn btn-secondary btn-lg btn-block"  href="/">BACK</Link>
  </div>
  </StyledHotline>
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
    <h1 style={header_style}>Reporter Information</h1>
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
