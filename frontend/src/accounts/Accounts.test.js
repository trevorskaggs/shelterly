import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { LoginForm } from "./AccountsForms";
import { AuthProvider } from "./AccountsReducer";

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
});
