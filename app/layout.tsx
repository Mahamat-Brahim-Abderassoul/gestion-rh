import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GestionRH - Système de Gestion des Ressources Humaines",
  description:
    "Une solution complète pour gérer les employés, leurs congés, autorisations et informations personnelles",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="light" style={{ colorScheme: "light" }}>
      <body>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
      </body>
    </html>
  )
}