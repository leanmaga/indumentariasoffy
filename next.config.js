/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com", // Añadir dominio de Google
    ],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Añadir patrón para Google
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  // Añadir configuración de redirecciones
  async redirects() {
    return [
      {
        source: "/auth/signin",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
