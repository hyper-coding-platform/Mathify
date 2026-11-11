import type { Metadata, Viewport } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FeatureIntro } from "@/components/FeatureIntro";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSC Calculation Trainer",
  description: "Free SSC CGL mental calculation practice for multiplication tables, squares, cubes and mixed speed tests.",
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
  return <html lang="en" data-theme="light" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem("ssc-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()` }} /></head><body><ThemeToggle /><FeatureIntro />{children}</body></html>;
}
