import React from "react";
import { A } from "hookrouter";
import { PersonForm, ServiceRequestForm } from "./HotlineForms";
import { ServiceRequestView } from "./HotlineViews";


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

const Hotline = () => (
  <div style={btn_style}>
    <A href="/hotline/owner/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">OWNER CALLING</A>
    <A href="/hotline/reporter/new" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">NON-OWNER CALLING</A>
    <A href="/hotline/request/list/search" style={link_style} className="btn btn-warning btn-lg btn-block mb-2">SEARCH SERVICE REQUESTS</A>
    <br/>
    <br/>
    <A className="btn btn-secondary btn-lg btn-block"  href="/">BACK</A>
  </div>
)

export const NewOwner = () => (
  <div>
    <h1 style={header_style}>Owner Information</h1>
    <PersonForm />
  </div>
)

export const UpdateOwner = ({id}) => (
  <div>
    <h1 style={header_style}>Owner Information</h1>
    <PersonForm id={id}/>
  </div>
)

export const NewReporter = () => (
  <div>
    <h1 style={header_style}>Reporter Information</h1>
    <PersonForm />
  </div>
)

export const ServiceRequestList = () => (
  <div>
    <h1 style={header_style}>Service Requests</h1>
    <br/>
    {/* <ServiceRequestTable /> */}
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
    <h1 style={header_style}>Edit Service Request Form</h1>
    <br/>
    <ServiceRequestForm id={id}/>
  </div>
)

export const ServiceRequestDetail = ({id}) => (
  <div>
    <h1 style={header_style}>Service Request</h1>
    <br/>
    <ServiceRequestView id={id}/>
  </div>
)

export default Hotline
