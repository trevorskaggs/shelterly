import React from "react";
import {
  render,
  screen,
} from "@testing-library/react";
import Animals from "./Animals";
import { AnimalForm } from "./AnimalForms";
import { AnimalSearch } from "./AnimalTables";
import { AnimalView } from "./AnimalViews";

describe("Animal tests", () => {
  it("Render AnimalForm", () => {
    render(<AnimalForm />);
    expect(screen.getByText("New Animal"));
  });
  it("Render AnimalSearch", () => {
    render(<AnimalSearch />);
    expect(screen.getByText("Search!"));
  });
  it("Render AnimalView", () => {
    render(<AnimalView id={1} />);
    expect(screen.getByText(/Animal Details/));
  });
});
