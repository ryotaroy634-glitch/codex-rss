import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal Stack",
  description: "A Vercel-ready RSS and newsroom aggregator for tech media and companies."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
