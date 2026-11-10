import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  // Only the bold weight is used (Heading/Logo); fewer files = less critical-path preload.
  weight: ["700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  openGraph: { type: "website", siteName: siteConfig.name, locale: siteConfig.locale },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#0a0a0a",
};

/**
 * Document shell only: fonts, tokens and default metadata. The chrome comes
 * from the segment below: `(site)/layout.tsx` for the public site (SiteShell)
 * and `admin/layout.tsx` for the private admin area.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn(inter.variable, barlowCondensed.variable, "h-full")}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
