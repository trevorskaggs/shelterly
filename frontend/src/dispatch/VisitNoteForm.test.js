import React from "react";
import { act } from 'react-dom/test-utils'
import { render, screen } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import nock from "nock";
import VisitNoteForm from "./VisitNoteForm";
import { SystemErrorProvider } from "../components/SystemError";

const mockNotesData = {
  date_completed: "2023-01-01",
  notes: "test notes",
  service_request: 1,
  evac_assignment: 2,
  address: "",
  forced_entry: false,
};

// Nock API chain
nock("http://localhost")
  // GET visit note
  .get("/hotline/api/visitnote/1/")
  .once()
  .query(true)
  .reply(200, mockNotesData)
  // PATCH visit note
  .patch(
    "/hotline/api/visitnote/1/",
    (body) => body.service_request === 1 && body.evac_assignment === 2
  )
  .once()
  .reply(201, {});

describe("Visit Note Form", () => {
  it("Renders new visit note form", () => {
    const { getByText } = render(
      <SystemErrorProvider>
        <VisitNoteForm incident={1} />
      </SystemErrorProvider>
    );
    expect(getByText(/New Visit Note/)).toBeTruthy();
  });

  it("Renders update visit note form", async () => {
    const { getByText } = render(
      <SystemErrorProvider>
        <VisitNoteForm id={1} incident={1} />
      </SystemErrorProvider>
    );
    const forcedEntryCheckbox = screen.getByLabelText("Forced Entry");
    const saveButton = screen.getByTestId("save_button");

    expect(getByText(/Update Visit Note/)).toBeTruthy();
    expect(forcedEntryCheckbox.checked).toBe(mockNotesData.forced_entry);
    await act(async () => {
      userEvent.click(saveButton);
    });
  });
});
