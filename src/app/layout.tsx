import type { Metadata } from "next"
import { Anton, Bebas_Neue, Share_Tech, Share_Tech_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { CookieConsent } from "@/components/privacy/cookie-consent"

// GHXSTSHIP Typography System
const anton = Anton({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-anton',
  display: 'swap',
})

const bebas = Bebas_Neue({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-bebas',
  display: 'swap',
})

const shareTech = Share_Tech({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-share',
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-share-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "GVTEWAY - Experience Live",
  description: "World-class festivals, concerts, and events. All in one place.",
  keywords: ["festivals", "concerts", "events", "live music", "entertainment", "tickets"],
  authors: [{ name: "GVTEWAY" }],
  openGraph: {
    title: "GVTEWAY - Experience Live",
    description: "World-class festivals, concerts, and events. All in one place.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${anton.variable} ${bebas.variable} ${shareTech.variable} ${shareTechMono.variable} font-share antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  )
}
