import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InputField } from "./InputField";

describe("InputField", () => {
  it("renders correctly without error", () => {
    render(<InputField label="Email Address" />);
    const inputElement = screen.getByLabelText("Email Address");

    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute("id", "email-address");
    expect(inputElement).toHaveAttribute("aria-invalid", "false");
    expect(inputElement).not.toHaveAttribute("aria-describedby");
  });

  it("renders correctly with error and associates error message", () => {
    render(<InputField label="Password" error="Password is required" />);
    const inputElement = screen.getByLabelText("Password");
    const errorElement = screen.getByText("Password is required");

    expect(inputElement).toBeInTheDocument();
    expect(errorElement).toBeInTheDocument();

    expect(inputElement).toHaveAttribute("aria-invalid", "true");
    expect(inputElement).toHaveAttribute("aria-describedby", "password-error");
    expect(errorElement).toHaveAttribute("id", "password-error");
  });

  it("uses provided custom id if given", () => {
    render(
      <InputField label="Custom Label" id="custom-id" error="Error msg" />,
    );
    const inputElement = screen.getByLabelText("Custom Label");
    const errorElement = screen.getByText("Error msg");

    expect(inputElement).toHaveAttribute("id", "custom-id");
    expect(inputElement).toHaveAttribute("aria-describedby", "custom-id-error");
    expect(errorElement).toHaveAttribute("id", "custom-id-error");
  });
});
