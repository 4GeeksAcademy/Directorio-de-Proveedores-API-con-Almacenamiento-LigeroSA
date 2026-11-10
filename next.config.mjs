/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: "tsconfig.next.json",
  },
  async rewrites() {
    const apiOrigin = process.env.HEALTHCORE_API_ORIGIN || "http://127.0.0.1:8765";
    return [
      { source: "/api/suppliers", destination: `${apiOrigin}/suppliers` },
      { source: "/api/suppliers/:path*", destination: `${apiOrigin}/suppliers/:path*` },
      { source: "/api/auth/login", destination: `${apiOrigin}/auth/login` },
      { source: "/api/auth/me", destination: `${apiOrigin}/auth/me` },
      { source: "/api/users", destination: `${apiOrigin}/users` },
      { source: "/api/users/:path*", destination: `${apiOrigin}/users/:path*` },
      { source: "/api/profiles/me", destination: `${apiOrigin}/profiles/me` },
    ];
  },
};

export default nextConfig;