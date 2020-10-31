import React from "react";
import { render, waitForElementToBeRemoved } from "@testing-library/react";
import Dispatch from "./Dispatch";
import { DispatchTeamMemberForm } from "./DispatchForms";

describe("Render Dispatch", () => {
  it("Render Dispatch", () => {
    const { getByText } = render(<Dispatch />);
    expect(getByText(/NEW TEAM/)).toBeTruthy();
    expect(getByText(/DEPLOY/)).toBeTruthy();
    expect(getByText(/DEBRIEF/)).toBeTruthy();
    expect(getByText(/BACK/)).toBeTruthy();
  });

  it("Render new Dispatch team member form", async () => {
    const { getByText, findByText } = render(<DispatchTeamMemberForm />);
    expect(getByText(/First Name*/)).toBeTruthy();
    expect(getByText(/Last Name*/)).toBeTruthy();
    expect(getByText(/Phone*/)).toBeTruthy();
    expect(getByText(/Agency ID/)).toBeTruthy();
  });
});
