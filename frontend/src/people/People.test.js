import React from "react";
import {render, screen} from "@testing-library/react";
import PersonSearch from "./PersonSearch";
import { SystemErrorProvider } from '../components/SystemError';

describe("Render PersonSearch", () => {
    it("Empty table loads", async () => {
        render(<SystemErrorProvider><PersonSearch /></SystemErrorProvider>);
        expect(await screen.getByText("Fetching owners...")).toBeTruthy();
    });
});
