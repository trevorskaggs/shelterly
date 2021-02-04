import React from "react";
import {
  render,
  screen,
} from "@testing-library/react";
import AnimalForm from "./AnimalForm";
import AnimalSearch from "./AnimalSearch";
import AnimalDetails from "./AnimalDetails";
import { initialWorkflowData } from "../components/StepperWorkflow";

describe("Animal tests", () => {
  it("Render AnimalForm", () => {
    render(<AnimalForm state={initialWorkflowData} />);
    expect(screen.getByText("Animal Information"));
  });
  it("Render AnimalSearch", () => {
    render(<AnimalSearch />);
    expect(screen.getByText("Search"));
  });
  it("Render AnimalView", () => {
    render(<AnimalDetails id={1} />);
    expect(screen.getByText(/Animal Details/));
  });
});
