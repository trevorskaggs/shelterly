import React from "react";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {cleanup, fireEvent, render, getByLabelText, getByText, findByText, waitFor, waitForElementToBeRemoved} from '@testing-library/react';
import Evac from "./Evac"

import { EvacTeamForm } from "./EvacForms"
import { EvacTeamTable } from "./EvacTables"

describe("Render evac", () => {
    it("Render Evac", () => {
        const { getByText } = render(<Evac />)
        expect(getByText(/NEW TEAM/)).toBeTruthy()
        expect(getByText(/TEAM LIST/)).toBeTruthy()
        expect(getByText(/DEPLOY/)).toBeTruthy()
        expect(getByText(/DEBRIEF/)).toBeTruthy()
        expect(getByText(/BACK/)).toBeTruthy()
    });

    it("Render new team form", async () => {
        const { getByText, findByText} = render(<EvacTeamForm />)
        expect(getByText(/Evac Team Members*/)).toBeTruthy()
        expect(getByText(/Callsign*/)).toBeTruthy()
        expect(getByText(/Save/)).toBeTruthy()
        expect(getByText(/Cancel/)).toBeTruthy()

    });

    it("Render team list table", async () => {
        let mockAdapter = new MockAdapter(axios);
        mockAdapter.onGet('http://localhost:8000/evac/api/evacteam/').reply(200, {
            'evac_teams':[{'id':1, 'evac_team_member_names': ['x', 'y']}],
            isFetching:false
        })
        const { getByText, findByText} = render(<EvacTeamTable />)
        expect(getByText(/Evac Team/)).toBeTruthy()
        expect(getByText(/Team Members/)).toBeTruthy()
        await waitForElementToBeRemoved(() => getByText("Fetching teams..."));

    });
})