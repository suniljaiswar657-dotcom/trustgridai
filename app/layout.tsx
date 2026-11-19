import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRUSTGRID — Trust infrastructure for the AI internet",
  description: "Discover, evaluate and connect with digital services through transparent trust signals.",
  metadataBase: new URL("https://trustgridai.vercel.app"),
  openGraph: {
    title: "TRUSTGRID",
    description: "The trust layer for the AI internet.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
