import React from "react";
import { render, waitForElementToBeRemoved } from "@testing-library/react";
import Evac from "./Evac";
import { EvacTeamMemberForm } from "./EvacForms";

describe("Render evac", () => {
  it("Render Evac", () => {
    const { getByText } = render(<Evac />);
    expect(getByText(/NEW TEAM/)).toBeTruthy();
    expect(getByText(/TEAM LIST/)).toBeTruthy();
    expect(getByText(/DEPLOY/)).toBeTruthy();
    expect(getByText(/DEBRIEF/)).toBeTruthy();
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
