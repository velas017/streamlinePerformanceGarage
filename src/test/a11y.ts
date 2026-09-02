import axe, { type AxeResults, type RuleObject } from "axe-core";
import { expect } from "vitest";

/**
 * Runs axe-core against a rendered container and fails the test on any violation.
 * jsdom has no layout engine, so rules that need computed geometry/colors are
 * disabled here; those are covered by the Chrome DevTools Lighthouse pass.
 */
const jsdomUnsupportedRules: RuleObject = {
  "color-contrast": { enabled: false },
  "target-size": { enabled: false },
};

function formatViolations(results: AxeResults): string {
  return results.violations
    .map((v) => {
      const nodes = v.nodes.map(
        (n) => `    - ${n.target.join(" ")}\n      ${n.failureSummary ?? ""}`,
      );
      return `[${v.impact ?? "n/a"}] ${v.id}: ${v.help}\n${nodes.join("\n")}`;
    })
    .join("\n\n");
}

export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container, { rules: jsdomUnsupportedRules });
  expect(results.violations, formatViolations(results)).toHaveLength(0);
}
