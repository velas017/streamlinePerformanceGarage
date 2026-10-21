import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";
import { mainNavigation } from "@/content/navigation";
import { visibility } from "@/content/visibility";

/** Each switch in content/visibility.ts must hide or restore its part everywhere. */
describe("visibility switches", () => {
  it("next.config redirects the service pages exactly while they are hidden", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const hiddenPages = redirects.find(
      (redirect) => redirect.source === "/services/:slug",
    );
    if (visibility.servicePages) {
      expect(hiddenPages).toBeUndefined();
    } else {
      expect(hiddenPages).toMatchObject({ destination: "/services", permanent: false });
    }
  });

  it("the Services menu lists individual services only while their pages are published", () => {
    const servicesItem = mainNavigation.find((item) => item.href === "/services");
    expect(Boolean(servicesItem?.children?.length)).toBe(visibility.servicePages);
  });
});
