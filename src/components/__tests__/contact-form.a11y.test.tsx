import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ContactFormState } from "@/app/contact/actions";
import { renderAccessible } from "@/test/render";

const errorState: ContactFormState = {
  status: "error",
  message: "Please fix the highlighted fields.",
  fieldErrors: { email: "Enter a valid email address" },
  values: {
    name: "Ada",
    email: "nope",
    phone: "",
    vehicle: "",
    location: "",
    service: "",
    message: "",
  },
};

// The server action pulls in next/headers; replace it and drive state directly.
vi.mock("@/app/contact/actions", () => ({
  initialContactFormState: { status: "idle" },
  submitLead: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useActionState: () => [errorState, vi.fn(), false],
  };
});

describe("ContactForm", () => {
  it("links errors to fields with aria-describedby and aria-invalid", async () => {
    const { ContactForm } = await import("@/components/sections/ContactForm");
    await renderAccessible(<ContactForm />);

    const email = screen.getByLabelText(/email/i);
    expect(email).toHaveAttribute("aria-invalid", "true");
    const describedBy = email.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy.split(" ")[0] ?? "")).toHaveTextContent(
      "Enter a valid email address",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Please fix the highlighted fields.",
    );
    // Submitted values survive the error round-trip.
    expect(screen.getByLabelText(/name/i)).toHaveValue("Ada");
  });
});
