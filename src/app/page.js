import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="card">
        <span className="small-label">Simple Machine Learning Platform</span>

        <h1>Machine Learning Hub</h1>

        <p className="description">
          Welcome to Machine Learning Hub, a simple web platform that introduces
          users to machine learning topics, tools, and resources. This project
          demonstrates how a frontend application can connect to Supabase
          Authentication and be deployed online using Vercel.
        </p>

        <div className="actions">
          <Link href="/login" className="button">
            Get Started
          </Link>

          <a
            href="https://supabase.com/docs/guides/auth"
            target="_blank"
            rel="noreferrer"
            className="button secondary"
          >
            Learn About Auth
          </a>
        </div>
      </section>
    </main>
  );
}