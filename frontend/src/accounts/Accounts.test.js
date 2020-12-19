import React from "react";
import axios from "axios";
import * as raviger from "raviger";

import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { LoginForm } from "./AccountsForms";
import { AuthProvider } from "./AccountsReducer";

jest.mock('axios');
jest.mock('raviger');

describe("Login form", () => {
  it("Logging in with incorrect credentials should show feedback", async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    const username = screen.getByPlaceholderText(/Username/);
    const password = screen.getByPlaceholderText(/Password/);
    const button = screen.getByText(/Login/);
    await fireEvent.change(username, { target: { value: "test_user" } });
    await fireEvent.change(password, { target: { value: "password" } });
    await fireEvent.click(button);
    await expect(
      await screen.findByText(
        /Failed to log in with this username and password combination./
      )
    ).toBeTruthy();
  });

  it("Touching username field without filling should show feedback", async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    const username = screen.getByPlaceholderText(/Username/);
    await fireEvent.change(username, { target: { value: "test_user" } });
    await fireEvent.change(username, { target: { value: "" } });
    await expect(
      await screen.findByText(/A Username is required./)
    ).toBeTruthy();
  });

  it("Touching password field without filling should show feedback", async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    const password = screen.getByPlaceholderText(/Password/);
    await fireEvent.change(password, { target: { value: "password" } });
    await fireEvent.change(password, { target: { value: "" } });
    await expect(await screen.findByText(/No password provided./)).toBeTruthy();
  });

  it("Logging in with correct credentials redirect home", async () => {
    const loginResponse = {data:{'token': 'abcd'}}
    const loadUserResponse = {data:{}}
    // this is being called twice.. .track it down
    const axiosSpy = jest.spyOn(axios, 'post').mockResolvedValue(loginResponse)
    jest.spyOn(axios, 'get').mockResolvedValue(loadUserResponse)
    // axios.get.mockResolvedValue(loadUserResponse);
    raviger.navigate = jest.fn()
    raviger.useQueryParams = jest.fn().mockImplementation(() => [{'whatever': 'ok'}]);
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    const username = screen.getByPlaceholderText(/Username/);
    const password = screen.getByPlaceholderText(/Password/);
    const button = screen.getByText(/Login/);
    await fireEvent.change(username, { target: { value: "test_user" } });
    await fireEvent.change(password, { target: { value: "password" } });
    await fireEvent.click(button);
    await waitFor(() => 
      expect(axiosSpy).toHaveBeenCalledWith("/login/", {"password": "password", "username": "test_user"})
    )    
  });
});
