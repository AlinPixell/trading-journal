import type { Metadata, Viewport } from "next";
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
  icons: {
    icon: [{ url: "/icon.png?v=2", type: "image/png" }],
    apple: [{ url: "/apple-icon.png?v=2", type: "image/png" }],
    shortcut: ["/icon.png?v=2"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111111",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-[100dvh]">
        <AccentRoot>{children}</AccentRoot>
      </body>
    </html>
  );
}
