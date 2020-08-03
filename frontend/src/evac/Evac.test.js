import React from "react";
import axios from 'axios';
import {rest} from 'msw'
import {setupServer} from 'msw/node'
import {cleanup, fireEvent, render, getByLabelText, getByText, findByText, waitFor} from '@testing-library/react';
import Evac from "./Evac"

import { EvacTeamForm } from "./EvacForms"
import { EvacTeamTable } from "./EvacTables"

// const server = setupServer(
//     rest.post('/login/', (req, res, ctx) => {
//       return res(ctx.json({token: 'fake_user_token'}))
//     }),
//   )

// beforeAll(() => server.listen())
// afterEach(() => {
//   server.resetHandlers()
//   window.localStorage.removeItem('token')
// })
// afterAll(() => server.close())
jest.mock('axios');

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
        axios.get.mockResolvedValue(true)
        expect(getByText(/Evac Team Members*/)).toBeTruthy()
        expect(getByText(/Callsign*/)).toBeTruthy()
        expect(getByText(/Save/)).toBeTruthy()
        expect(getByText(/Cancel/)).toBeTruthy()

    });

    it("Render team list table", async () => {
        const { getByText, findByText} = render(<EvacTeamTable />)
        expect(getByText(/Evac Team/)).toBeTruthy()
        expect(getByText(/Team Members/)).toBeTruthy()
        expect(getByText(/Fetching teams.../)).toBeTruthy()

    });
})