import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSC Calculation Trainer",
  description: "Mental calculation practice for tables, squares, cubes, addition, subtraction and chaining.",
  applicationName: "SSC Mathify",
  appleWebApp: {
    capable: true,
    title: "SSC Mathify",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#315fe8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="light"><body>{children}</body></html>;
}
