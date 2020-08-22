import React from "react";
import { render, waitForElementToBeRemoved } from "@testing-library/react";
import Evac from "./Evac";
import { EvacTeamForm } from "./EvacForms";
import { EvacTeamTable } from "./EvacTables";

describe("Render evac", () => {
  it("Render Evac", () => {
    const { getByText } = render(<Evac />);
    expect(getByText(/NEW TEAM/)).toBeTruthy();
    expect(getByText(/TEAM LIST/)).toBeTruthy();
    expect(getByText(/DEPLOY/)).toBeTruthy();
    expect(getByText(/DEBRIEF/)).toBeTruthy();
    expect(getByText(/BACK/)).toBeTruthy();
  });

  it("Render new team form", async () => {
    const { getByText, findByText } = render(<EvacTeamForm />);
    expect(getByText(/Evac Team Members*/)).toBeTruthy();
    expect(getByText(/Callsign*/)).toBeTruthy();
    expect(getByText(/Save/)).toBeTruthy();
    expect(getByText(/Cancel/)).toBeTruthy();
  });

  it("Render team list table", async () => {
    const { getByText, findByText } = render(<EvacTeamTable />);
    expect(getByText(/Evac Team/)).toBeTruthy();
    expect(getByText(/Team Members/)).toBeTruthy();
    await waitForElementToBeRemoved(() => getByText("Fetching teams..."));
  });
});
