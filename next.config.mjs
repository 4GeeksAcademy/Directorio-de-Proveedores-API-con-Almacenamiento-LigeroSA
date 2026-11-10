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
    ];
  },
};

export default nextConfig;