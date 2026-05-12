import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AccentRoot } from "@/components/AccentRoot";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trade Journal",
  description: "Premium local-first trading journal with calendar, analytics, and targets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AccentRoot>{children}</AccentRoot>
      </body>
    </html>
  );
}
