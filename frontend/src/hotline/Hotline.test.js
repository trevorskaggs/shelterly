import React from "react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import {
  render,
  screen,
} from "@testing-library/react";
import Hotline from "./Hotline";
import ServiceRequestDetails from "./ServiceRequestDetails";
import ServiceRequestSearch from "./ServiceRequestSearch";
import { SystemErrorProvider } from '../components/SystemError';

const server = setupServer(
  rest.get("/hotline/api/servicerequests/1/", (req, res, ctx) => {
    return res(
      ctx.json({ data: { id: 2, reporter: "Jane Doe", address: blah, latitude:0, longitude:0 } })
    );
  })
);

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done.
afterAll(() => server.close());

describe("Render hotline", () => {
  it("Render hotline", () => {
    render(<SystemErrorProvider><Hotline /></SystemErrorProvider>);
    expect(screen.getAllByText(/OWNER CALLING/)).toBeTruthy();
    expect(screen.getByText(/NON-OWNER CALLING/)).toBeTruthy();
    expect(screen.getByText(/FIRST RESPONDER CALLING/)).toBeTruthy();
  });
});

describe("Render ServiceRequestDetails", () => {
  it("Service request details loads", async () => {
    render(<SystemErrorProvider><ServiceRequestDetails id={1} /></SystemErrorProvider>);
    expect(screen.getAllByText(/Service Request/)).toBeTruthy();
  });
});

describe("Render ServiceRequestSearch", () => {
  it("Empty table loads", async () => {
    render(<SystemErrorProvider><ServiceRequestSearch /></SystemErrorProvider>);
    expect(await screen.getByText("Fetching service requests...")).toBeTruthy();
  });
});
