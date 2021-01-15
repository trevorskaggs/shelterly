import React from "react";
import {
  render,
  screen,
} from "@testing-library/react";
import { AnimalForm } from "./AnimalForms";
import { AnimalSearch } from "./AnimalTables";
import { AnimalView } from "./AnimalViews";
import { initialData } from "../hotline/HotlineWorkflow"

describe("Animal tests", () => {
  it("Render AnimalForm", () => {
    render(<AnimalForm state={initialData} />);
    expect(screen.getByText("Animal Information"));
  });
  it("Render AnimalSearch", () => {
    render(<AnimalSearch />);
    expect(screen.getByText("Search"));
  });
  it("Render AnimalView", () => {
    render(<AnimalView id={1} />);
    expect(screen.getByText(/Animal Details/));
  });
});
