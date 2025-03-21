import React from "react";
import { render, screen } from "@testing-library/react";
import Dispatch from "./Dispatch";
import DispatchTeamMemberForm from "./DispatchTeamMemberForm";
import DispatchSearch from "./DispatchSearch";
import { SystemErrorProvider } from '../components/SystemError';

describe("Render evac", () => {
  it("Render Dispatch", () => {
    const { getByText } = render(<SystemErrorProvider><Dispatch /></SystemErrorProvider>);
    expect(getByText(/DEPLOY TEAMS/)).toBeTruthy();
  });

  it("Render new dispatch team member form", async () => {
    const { getByText, findByText } = render(<SystemErrorProvider><DispatchTeamMemberForm /></SystemErrorProvider>);
    expect(getByText(/First Name*/)).toBeTruthy();
    expect(getByText(/Last Name*/)).toBeTruthy();
    expect(getByText(/Phone*/)).toBeTruthy();
    expect(getByText(/Agency ID/)).toBeTruthy();
  });
});

describe("Render DispatchAssignmentSearch", () => {
  it("Empty table loads", async () => {
    render(<SystemErrorProvider><DispatchSearch /></SystemErrorProvider>);
    expect(await screen.getByText("Fetching dispatch assignments...")).toBeTruthy();
  });
});
