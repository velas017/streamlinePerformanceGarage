import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * Renders inside a <main> landmark so axe's "region" rule evaluates the component
 * the way it appears on a real page, then asserts zero violations.
 */
export async function renderAccessible(ui: ReactElement): Promise<RenderResult> {
  const result = render(<main>{ui}</main>);
  await expectNoA11yViolations(result.container);
  return result;
}
