import type { Metadata, Viewport } from "next"
import { Work_Sans, Instrument_Serif } from "next/font/google"

import "@/styles/globals.css"

import { Header } from "@/components/header"
import type { ReactNode } from "react"
import { Providers } from "./providers"

const workSans = Work_Sans({
    variable: "--font-work-sans",
    subsets: ["latin"]
})

const instrumentSerif = Instrument_Serif({
    variable: "--font-instrument-serif",
    weight: "400",
    subsets: ["latin"]
})

export const metadata: Metadata = {
    title: "Rem: Research Made Accessible",
    description: "Democratizing research by translating complex papers into accessible formats for everyone"
}

export const viewport: Viewport = {
    initialScale: 1,
    viewportFit: "cover",
    width: "device-width",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#FAF9F6" },
        { media: "(prefers-color-scheme: dark)", color: "#262625" }
    ]
}

export default function RootLayout({
    children
}: Readonly<{
    children: ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className={`${workSans.variable} ${instrumentSerif.variable} antialiased`}>
                <Providers>
                    <div className="flex min-h-svh flex-col">
                        <Header />
                        <main className="flex-grow">
                            {children}
                        </main>
                    </div>
                </Providers>
            </body>
        </html>
    )
}
