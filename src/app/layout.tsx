import type { Metadata } from "next";
import { Cinzel, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const headingFont = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Campaign Keep",
    template: "%s | Campaign Keep",
  },
  description:
    "A D&D-first campaign platform that brings lore, session prep, character sheets, handouts, and player notes into one cohesive experience.",
  applicationName: "Campaign Keep",
  keywords: [
    "Next.js",
    "Prisma",
    "PostgreSQL",
    "D&D",
    "tabletop RPG",
    "campaign manager",
    "portfolio project",
  ],
  openGraph: {
    title: "Campaign Keep",
    description:
      "A D&D-first campaign platform that brings lore, session prep, character sheets, handouts, and player notes into one cohesive experience.",
    siteName: "Campaign Keep",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campaign Keep",
    description:
      "A D&D-first campaign platform that brings lore, session prep, character sheets, handouts, and player notes into one cohesive experience.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
