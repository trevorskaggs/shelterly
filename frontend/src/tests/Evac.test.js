import React from "react";
import { unmountComponentAtNode } from "react-dom";
import mockAxios from 'jest-mock-axios';
import Evac from "../evac/Evac"
import { EvacTeamTable } from "../evac/EvacTables"
import { EvacTeamForm } from "../evac/EvacForms"
import {cleanup, fireEvent, render, getByLabelText, getByText, findByText} from '@testing-library/react';
jest.mock('axios')

afterEach(() => {
  // cleaning up the mess left behind the previous test
  mockAxios.reset();
});

it("Render evac home", () => {
  const { container, getByText, getByLabelText, findByLabelText } = render(<Evac />)
  expect(getByText(/CREATE NEW EVAC TEAM/)).toBeTruthy()
  expect(getByText(/EVAC TEAM LIST/)).toBeTruthy()
  expect(getByText(/DEPLOY EVAC TEAM/)).toBeTruthy()
  expect(getByText(/EVAC TEAM DEBRIEF/)).toBeTruthy()
  expect(getByText(/BACK/)).toBeTruthy()
});

it("Render evac team list", async () => {
  const CancelToken = mockAxios.CancelToken;
  const source = CancelToken.source();
  const { container, getByText, getByLabelText, findByLabelText } = render(<EvacTeamTable />)
  // expect(mockAxios.get).toHaveBeenCalledWith("http://localhost:8000/evac/api/evacteam/", {"cancelToken": source.token })
  expect(findByText(/Evac Team/)).toBeTruthy()
  expect(findByText(/Team Members/)).toBeTruthy()
});
