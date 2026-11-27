import type { NextConfig } from "next";

/**
 * Everything lives under /o-games, so schuster.me can pass /o-games/* to this
 * project and visitors keep seeing schuster.me/o-games (and the games keep
 * their saves, which browsers store per site).
 */
const nextConfig: NextConfig = {
  basePath: "/o-games",
  poweredByHeader: false,
  async rewrites() {
    // Each game is a folder of static files: /o-games/monster-packs serves its index.html.
    return [{ source: "/:slug((?!api$|create$)[a-z0-9-]+)", destination: "/:slug/index.html" }];
  },
  async headers() {
    // Keep everything off search engines.
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] }];
  },
};

export default nextConfig;
