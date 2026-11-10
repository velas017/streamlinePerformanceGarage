import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { siteConfig } from "@/lib/site-config";

/**
 * The private admin area, reached only at the admin hostname (src/proxy.ts).
 * The layout is chrome only: every page and action checks access itself.
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: `%s | ${siteConfig.name} admin` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
