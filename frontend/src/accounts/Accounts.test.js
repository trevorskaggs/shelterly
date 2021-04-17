import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import Login from "./LoginForm";
import { AuthProvider } from "./AccountsReducer";

describe("Login form", () => {
  it("Logging in with incorrect credentials should show feedback", async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    const username = screen.getByPlaceholderText(/Email/);
    const password = screen.getByPlaceholderText(/Password/);
    const button = screen.getByText(/Login/);
    await fireEvent.change(username, { target: { value: "test@test.com" } });
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
        <Login />
      </AuthProvider>
    );
    const username = screen.getByPlaceholderText(/Email/);
    await fireEvent.change(username, { target: { value: "test@test.com" } });
    await fireEvent.change(username, { target: { value: "" } });
    await expect(
      await screen.findByText(/An email address is required./)
    ).toBeTruthy();
  });

  it("Touching password field without filling should show feedback", async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    const password = screen.getByPlaceholderText(/Password/);
    await fireEvent.change(password, { target: { value: "password" } });
    await fireEvent.change(password, { target: { value: "" } });
    await expect(await screen.findByText(/No password provided./)).toBeTruthy();
  });
});
