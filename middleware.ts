import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Fonction pour vérifier si l'utilisateur est authentifié côté client
export function middleware(request: NextRequest) {
  // Vérifier si l'URL commence par /admin (sauf /admin/login)
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
  const isLoginPage = request.nextUrl.pathname === "/admin/login"

  // Pour les routes admin (sauf login), la vérification se fera côté client
  // via le contexte d'authentification
  if (isAdminRoute && !isLoginPage) {
    // Ne rien faire ici, la vérification se fera côté client
    return NextResponse.next()
  }

  // Si c'est la page de login, laisser passer
  if (isLoginPage) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Configuration du middleware pour s'exécuter uniquement sur les routes spécifiées
export const config = {
  matcher: ["/admin/:path*"],
}
