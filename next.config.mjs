/** @type {import('next').NextConfig} */

export const APIServiceURL =
  process.env.API_SERVICE_URL ||
  "https://p01--memelaw-api-backend--kft2yyfyp66z.code.run";
export const UserServiceURL =
  process.env.USER_SERVICE_URL ||
  "https://test--memelaw-comment-service--kft2yyfyp66z.code.run";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "arweave.net",
      },
      {
        protocol: "https",
        hostname: "robohash.org",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${APIServiceURL}/:path*`,
      },
      {
        source: "/user/api/:path*",
        destination: `${UserServiceURL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
