import React from "react";
import {render, screen} from "@testing-library/react";
import PersonSearch from "./PersonSearch";

describe("Render PersonSearch", () => {
    it("Empty table loads", async () => {
        render(<PersonSearch />);
        expect(await screen.getByText("Fetching Owners...")).toBeTruthy();
    });
});
