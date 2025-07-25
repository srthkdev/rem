import type { Metadata, Viewport } from "next";
import { Work_Sans, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { NekoGlobal } from "@/components/ui/neko-global";
import { AudioPlayer } from "@/components/ui/audio-player";

import "@/styles/globals.css";
import "@/styles/layout.css";

import type { ReactNode } from "react";
import { Providers } from "@/components/providers";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "REM",
  description: "REM - Research made accessible",
};

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF9F6" },
    { media: "(prefers-color-scheme: dark)", color: "#262625" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${workSans.variable} ${instrumentSerif.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Providers>{children}</Providers>
          <AudioPlayer background />
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
