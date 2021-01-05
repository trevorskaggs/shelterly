import React from "react";
import {render, screen} from "@testing-library/react";
import {PeopleTable} from "./PeopleTables";

describe("Render PeopleTable", () => {
    it("Empty table loads", async () => {
        render(<PeopleTable />);
        expect(await screen.getByText("Fetching Owners...")).toBeTruthy();
    });
});
