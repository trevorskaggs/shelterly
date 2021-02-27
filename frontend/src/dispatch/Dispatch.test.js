import React from "react";
import { render, screen } from "@testing-library/react";
import Dispatch from "./Dispatch";
import DispatchTeamMemberForm from "./DispatchTeamMemberForm";
import DispatchSearch from "./DispatchSearch";

describe("Render evac", () => {
  it("Render Dispatch", () => {
    const { getByText } = render(<Dispatch />);
    expect(getByText(/ADD TEAM MEMBER/)).toBeTruthy();
    expect(getByText(/DEPLOY TEAMS/)).toBeTruthy();
    expect(getByText(/DISPATCH ASSIGNMENTS/)).toBeTruthy();
  });

  it("Render new dispatch team member form", async () => {
    const { getByText, findByText } = render(<DispatchTeamMemberForm />);
    expect(getByText(/First Name*/)).toBeTruthy();
    expect(getByText(/Last Name*/)).toBeTruthy();
    expect(getByText(/Phone*/)).toBeTruthy();
    expect(getByText(/Agency ID/)).toBeTruthy();
  });
});

describe("Render DispatchAssignmentSearch", () => {
  it("Empty table loads", async () => {
    render(<DispatchSearch />);
    expect(await screen.getByText("Fetching dispatch assignments...")).toBeTruthy();
  });
});
