import "./globals.css";
import { AuthProvider } from "./context/AuthProvider";

export const metadata = {
  title: "ML Hub — Publish Articles System",
  description: "A modern platform for discovering and sharing machine learning articles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}