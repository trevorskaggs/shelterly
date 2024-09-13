import React from "react";
import {
  render,
  screen,
} from "@testing-library/react";
import nock from "nock";
import Hotline from "./Hotline";
import ServiceRequestDetails from "./ServiceRequestDetails";
import ServiceRequestSearch from "./ServiceRequestSearch";
import { SystemErrorProvider } from '../components/SystemError';
import { initialState } from "../accounts/AccountsReducer"

const MOCK_INCIDENT_ID = 1;

// Nock API chain
nock('http://localhost')
  // GET service requests
  .get('/hotline/api/servicerequests/')
  .times(2)
  .query(true)
  .reply(200, {})
  // GET service request by id
  .get('/hotline/api/servicerequests/1/')
  .times(1)
  .reply(200, {})
;

describe("Render hotline", () => {
  it("Render hotline", () => {
    render(<SystemErrorProvider><Hotline incident={MOCK_INCIDENT_ID} /></SystemErrorProvider>);
    expect(screen.getAllByText(/OWNER CALLING/)).toBeTruthy();
    expect(screen.getByText(/NON-OWNER CALLING/)).toBeTruthy();
    expect(screen.getByText(/FIRST RESPONDER CALLING/)).toBeTruthy();
  });
});

describe("Render ServiceRequestDetails", () => {
  it("Service request details loads", async () => {
    render(<SystemErrorProvider><ServiceRequestDetails id={1} incident={MOCK_INCIDENT_ID} state={initialState} /></SystemErrorProvider>);
    expect(screen.getAllByText(/Service Request/)).toBeTruthy();
  });
});

describe("Render ServiceRequestSearch", () => {
  it("Empty table loads", async () => {
    render(<SystemErrorProvider><ServiceRequestSearch incident={MOCK_INCIDENT_ID} state={initialState} /></SystemErrorProvider>);
    expect(await screen.getByText("Fetching service requests...")).toBeTruthy();
  });
});
