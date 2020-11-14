import React from "react";
import {render, screen, waitForElementToBeRemoved} from "@testing-library/react";
import Evac from "./Evac";
import { EvacTeamMemberForm } from "./EvacForms";
import {EvacuationAssignmentTable} from "./EvacTables";

describe("Render evac", () => {
  it("Render Evac", () => {
    const { getByText } = render(<Evac />);
    expect(getByText(/ADD TEAM MEMBER/)).toBeTruthy();
    expect(getByText(/DEPLOY/)).toBeTruthy();
    expect(getByText(/DEBRIEF/)).toBeTruthy();
    expect(getByText(/SEARCH EVACUATION ASSIGNMENT/)).toBeTruthy();
    expect(getByText(/BACK/)).toBeTruthy();
  });

  it("Render new evac team member form", async () => {
    const { getByText, findByText } = render(<EvacTeamMemberForm />);
    expect(getByText(/First Name*/)).toBeTruthy();
    expect(getByText(/Last Name*/)).toBeTruthy();
    expect(getByText(/Phone*/)).toBeTruthy();
    expect(getByText(/Agency ID/)).toBeTruthy();
  });
});

describe("Render EvacuationAssignmentTable", () => {
  it("Empty table loads", async () => {
    render(<EvacuationAssignmentTable />);
    expect(await screen.getByText("Fetching evacuation requests...")).toBeTruthy();
  });
});