/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "firebase-admin",
    "firebase",
    "@firebase/app",
    "@firebase/auth",
    "@firebase/firestore",
    "@firebase/storage",
    "@firebase/database",
    "@firebase/database-compat",
    "google-auth-library",
  ],
};

export default nextConfig;
