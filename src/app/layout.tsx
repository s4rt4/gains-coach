import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const base = process.env.BASE_PATH || "";

export const metadata: Metadata = {
  title: "Gains Coach",
  description: "AI bodybuilding coach — prototype",
  applicationName: "Gains Coach",
  appleWebApp: { capable: true, title: "Gains Coach", statusBarStyle: "black-translucent" },
  icons: { icon: `${base}/icons/icon-192.png`, apple: `${base}/icons/apple-touch-icon.png` },
  // Private prototype: keep it out of search engines
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  viewportFit: "cover", // lets the installed app draw under the notch; layouts pad with safe-area insets
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      suppressHydrationWarning
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
