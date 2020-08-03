import React from "react";
import axios from 'axios';
import {cleanup, fireEvent, render, getByLabelText, getByText, findByText, waitFor} from '@testing-library/react';
import Hotline from "./Hotline"
import { PersonView, ServiceRequestView } from "./HotlineViews"
jest.mock('axios');

describe("Render hotline", () => {
    it("Render hotline", () => {
        const { getAllByText, getByText } = render(<Hotline />)
        expect(getAllByText(/OWNER CALLING/)).toBeTruthy()
        expect(getByText(/NON-OWNER CALLING/)).toBeTruthy()
        expect(getByText(/SEARCH SERVICE REQUEST/)).toBeTruthy()
    });
})
describe("Render PersonView", () => {
    it("Create Reporter", () => {
        delete global.window.location;
        global.window = Object.create(window);
        Object.defineProperty(window, "location", {
            value: {
               pathname: '/hotline/reporter/new'
            },
            writable: true
        });
        const { getAllByText, getByText } = render(<PersonView />)
        expect(getByText(/Reporter Details/)).toBeTruthy()
    });

    it("Create Owner", () => {
        delete global.window.location;
        global.window = Object.create(window);
        Object.defineProperty(window, "location", {
            value: {
               pathname: '/hotline/owner/new'
            },
            writable: true
        });
        const { getAllByText, getByText } = render(<PersonView />)
        expect(getByText(/Owner Details/)).toBeTruthy()
    });

    it("Existing Owner", async () => {
        const { getAllByText, findByText } = render(<PersonView />)
        const owner = {'first_name':'Blah Blah', 'address': 'blah'}
        const response = {data: owner}
        axios.get.mockResolvedValue(response)
        const test = await findByText(/Blah Blah/)
    });
})

describe("Render ServiceRequest", () => {
    it("Render ServiceRequest", () => {
        const { getAllByText, getByText } = render(<ServiceRequestView />)
        expect(getAllByText(/Directions/)).toBeTruthy()
    });
})