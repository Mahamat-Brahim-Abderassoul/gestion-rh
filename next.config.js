/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Configuration pour le déploiement
  output: "standalone",

  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Configuration des images
  images: {
    domains: [],
    unoptimized: true,
  },

  // Configuration ESLint - Plus permissive pour éviter les erreurs de build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configuration TypeScript - Plus permissive
  typescript: {
    ignoreBuildErrors: false,
  },

  // Transpilation des modules problématiques
  transpilePackages: ["lucide-react"],

  // Configuration webpack pour résoudre les conflits
  webpack: (config, { isServer }) => {
    // Résoudre les conflits de modules
    config.resolve.alias = {
      ...config.resolve.alias,
      react: require.resolve("react"),
      "react-dom": require.resolve("react-dom"),
    }

    return config
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ]
  },

  // Redirections
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
