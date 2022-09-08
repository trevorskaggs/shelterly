import React from "react";
import {
  render,
  screen,
} from "@testing-library/react";
import AnimalForm from "./AnimalForm";
import AnimalSearch from "./AnimalSearch";
import AnimalDetails from "./AnimalDetails";
import { initialWorkflowData } from "../components/StepperWorkflow";
import { SystemErrorProvider } from '../components/SystemError';

describe("Animal tests", () => {
  it("Render AnimalForm", () => {
    render(<SystemErrorProvider><AnimalForm state={initialWorkflowData} /></SystemErrorProvider>);
    expect(screen.getByText("Animal Information"));
  });
  it("Render AnimalSearch", () => {
    render(<SystemErrorProvider><AnimalSearch /></SystemErrorProvider>);
    expect(screen.getByText("Search"));
  });
  it("Render AnimalView", () => {
    render(<SystemErrorProvider><AnimalDetails id={1} /></SystemErrorProvider>);
    expect(screen.getByText(/Animal Details/));
  });
});
