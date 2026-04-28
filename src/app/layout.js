import "./globals.css";

export const metadata = {
  title: "Machine Learning Hub",
  description: "A simple integrated web app using Next.js, Supabase, and Vercel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}