import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ThemeScript from "./theme-script";

export const metadata: Metadata = {
  title: "MarkIn. GitOut.",
  description: "Plain English editing for your marketing site. No Git required.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0d0b08",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-bg text-text font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
