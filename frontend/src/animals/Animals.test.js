import React from "react";
import {
  render,
  screen,
} from "@testing-library/react";
import nock from "nock";
import AnimalForm from "./AnimalForm";
import AnimalSearch from "./AnimalSearch";
import AnimalDetails from "./AnimalDetails";
import { initialWorkflowData } from "../components/StepperWorkflow";
import { SystemErrorProvider } from '../components/SystemError';

// Nock API chain
nock('http://localhost')
  // GET incident
  .get('/incident/api/incident/')
  .once()
  .query(true)
  .reply(200, {})
  // GET shelters
  .get('/shelter/api/shelter/')
  .twice()
  .query(true)
  .reply(200, {})
  // GET animal search
  .get('/animals/api/animal/')
  .once()
  .query(true)
  .reply(200, {})
  // GET animal detail
  .get('/animals/api/animal/1/')
  .once()
  .reply(200, {
    data: {},
  })
;

describe("Animal tests", () => {
  it("Render AnimalForm", () => {
    render(<SystemErrorProvider><AnimalForm state={initialWorkflowData} incident={'test'} organization={'changeme'} /></SystemErrorProvider>);
    expect(screen.getByText("Animal Information"));
  });
  it("Render AnimalSearch", () => {
    render(<SystemErrorProvider><AnimalSearch incident={'test'} organization={'changeme'} /></SystemErrorProvider>);
    expect(screen.getByText("Search"));
  });
  it("Render AnimalView", () => {
    render(<SystemErrorProvider><AnimalDetails id={1} incident={1} organization={'changeme'} state={{incident:{id:''}}} /></SystemErrorProvider>);
    expect(screen.getByText(/Animal/));
  });
});
