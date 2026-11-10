import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminPage, AdminPanel } from "@/components/admin/AdminPage";
import { AdminShell } from "@/components/admin/AdminShell";
import { Notice } from "@/components/admin/Notice";
import { adminForms } from "@/content/admin";
import type { AdminFormState } from "@/lib/admin/form-state";
import { expectNoA11yViolations } from "@/test/a11y";
import { renderAccessible } from "@/test/render";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_SITE_URL: "https://shop.example", ADMIN_EMAILS: [] },
}));

// Drive the forms' state directly; the actions themselves are tested elsewhere.
const formState = vi.hoisted(() => ({ current: { status: "idle" } as AdminFormState }));
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useActionState: () => [formState.current, vi.fn(), false],
}));

const action = vi.fn(async (state: AdminFormState) => state);

describe("admin area", () => {
  it("has its own landmarks and none of the public site's navigation", async () => {
    const { container } = render(
      <AdminShell>
        <AdminPage title="Sign in" eyebrow="Staff only" lead="Lead text">
          <Notice>Your password is saved.</Notice>
        </AdminPage>
      </AdminShell>,
    );
    await expectNoA11yViolations(container);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryByRole("navigation", { name: "Primary" })).toBeNull();
    expect(screen.getByRole("link", { name: /skip to main content/i })).toHaveAttribute(
      "href",
      "#main",
    );
    // The logo goes to the admin home, never the public site.
    const links = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(links).toEqual(["#main", "/admin"]);
  });

  it("every form renders labelled, required fields with the right autocomplete", async () => {
    formState.current = { status: "idle" };
    for (const content of Object.values(adminForms)) {
      const { unmount } = await renderAccessible(
        <AdminForm action={action} content={content} />,
      );
      for (const field of content.fields) {
        const input = screen.getByLabelText(`${field.label} (required)`);
        expect(input).toBeRequired();
        expect(input).toHaveAttribute("autocomplete", field.autoComplete);
        expect(input).toHaveAttribute("type", field.type);
      }
      expect(
        screen.getByRole("button", { name: content.submitLabel }),
      ).toBeInTheDocument();
      unmount();
    }
  });

  it("links an error to its field and keeps only the non-secret value", async () => {
    formState.current = {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: { password: "Enter your password" },
      values: { email: "owner@example.com" },
    };
    await renderAccessible(<AdminForm action={action} content={adminForms.signIn} />);
    const password = screen.getByLabelText(/^Password/);
    expect(password).toHaveAttribute("aria-invalid", "true");
    expect(password).toHaveValue("");
    const describedBy = password.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy.split(" ")[0] ?? "")).toHaveTextContent(
      "Enter your password",
    );
    expect(screen.getByLabelText(/^Email/)).toHaveValue("owner@example.com");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Please fix the highlighted fields.",
    );
  });

  it("shows new backup codes as a named list", async () => {
    formState.current = {
      status: "success",
      message: "Save these codes somewhere safe.",
      codes: ["AAAAA-BBBBB", "CCCCC-DDDDD"],
    };
    await renderAccessible(
      <AdminForm action={action} content={adminForms.backupCodes} />,
    );
    const list = screen.getByRole("list", { name: /backup codes/i });
    expect(list.querySelectorAll("li")).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent("Save these codes");
  });

  it("panels are named sections under the page's h1", async () => {
    await renderAccessible(
      <AdminPage title="Your account" width="wide">
        <AdminPanel
          id="password"
          title="Change password"
          description="Other devices sign out."
        />
      </AdminPage>,
    );
    expect(screen.getByRole("region", { name: "Change password" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Change password" }),
    ).toBeInTheDocument();
  });
});
