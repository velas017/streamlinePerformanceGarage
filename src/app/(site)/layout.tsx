import { SiteShell } from "@/components/layout/SiteShell";

/** Every public page: the site header, footer and organization schema. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteShell>{children}</SiteShell>;
}
