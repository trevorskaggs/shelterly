import React from "react";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {cleanup, fireEvent, render, getByLabelText, getByText, findByText, waitFor} from '@testing-library/react';
import Hotline from "./Hotline";
import { PersonView, ServiceRequestView } from "./HotlineViews";
import { ServiceRequestTable } from "./HotlineTables";

describe("Render hotline", () => {
    it("Render hotline", () => {
        const { getAllByText, getByText } = render(<Hotline />)
        expect(getAllByText(/OWNER CALLING/)).toBeTruthy()
        expect(getByText(/NON-OWNER CALLING/)).toBeTruthy()
        expect(getByText(/SEARCH SERVICE REQUEST/)).toBeTruthy()
    });
})
describe("Render PersonView", () => {
    // it("Create Reporter", () => {
    //     delete global.window.location;
    //     global.window = Object.create(window);
    //     Object.defineProperty(window, "location", {
    //         value: {
    //            pathname: '/hotline/reporter/new'
    //         },
    //         writable: true
    //     });
    //     const { getAllByText, getByText } = render(<PersonView />)
    //     expect(getByText(/Reporter Details/)).toBeTruthy()
    // });

    // it("Create Owner", () => {
    //     delete global.window.location;
    //     global.window = Object.create(window);
    //     Object.defineProperty(window, "location", {
    //         value: {
    //            pathname: '/hotline/owner/new'
    //         },
    //         writable: true
    //     });
    //     const { getAllByText, getByText } = render(<PersonView />)
    //     expect(getByText(/Owner Details/)).toBeTruthy()
    // });

    it("Existing owner fields populated", async () => {
        let mockAdapter = new MockAdapter(axios);
        mockAdapter.onGet('http://localhost:3000/people/api/person/1/').reply(200, {
            first_name:'Leroy',
            last_name: 'Jenkins',
            phone: '123456789',
            email: 'test@test.com',
            address: '123 Main St.'

        })
        const { getAllByText, findByText } = render(<PersonView id={1} />)
        expect(findByText(/Leroy Jenkins/)).toBeTruthy()
        expect(findByText(/123456789/)).toBeTruthy()
        expect(findByText(/123456789/)).toBeTruthy()
        expect(findByText(/123 Main St./)).toBeTruthy()
    });
})

describe("Render ServiceRequestView", () => {
    it("Existing service request fields populated", () => {
        let mockAdapter = new MockAdapter(axios);
        mockAdapter.onGet('http://localhost:3000/hotline/api/servicerequests/1/').reply(200, {
            directions:'123 Main St.'
        })
        const {getByText } = render(<ServiceRequestView id={1} />)
        expect(getByText(/Address/)).toBeTruthy()
    });
})

describe("Render ServiceRequestTable", () => {
    it("Empty table loads", () => {
        let mockAdapter = new MockAdapter(axios);
        mockAdapter.onGet('http://localhost:8000/hotline/api/servicerequests/').reply(200, {
            service_requests: []
        })
        const {getByText } = render(<ServiceRequestTable />)
        expect(getByText(/No Service Requests found./)).toBeTruthy()
    });
    it(" Table with 1 SR loads", () => {
        let mockAdapter = new MockAdapter(axios);
        mockAdapter.onGet('http://localhost:8000/hotline/api/servicerequests/').reply(200, {
            service_requests:[{'id': 3}]
        })
        const {getByText } = render(<ServiceRequestTable />)
        expect(getByText(/No Service Requests found./)).toBeTruthy()
    });
})