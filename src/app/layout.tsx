import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { copy } from "@/lib/copy/ar";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: copy.appTitle,
  description: copy.signInSubtitle,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: browser extensions often inject attrs on
    // <html>/<body> (e.g. cz-shortcut-listen, crxlauncher) before hydrate.
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-slate-50 font-sans text-slate-900 antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
