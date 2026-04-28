import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-container">
      <div className="main-content flex flex-col items-center justify-center" style={{ minHeight: '80vh', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>Machine Learning Platform</span>
          
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
            Discover and Share <br />
            <span className="text-gradient">ML Research</span>
          </h1>
          
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', color: 'var(--text-secondary)' }}>
            Welcome to ML Hub, a curated platform for discovering, discussing, and sharing 
            the latest machine learning articles, papers, and resources. Join our community of researchers and practitioners.
          </p>
          
          <div className="flex justify-center gap-4" style={{ marginBottom: '4rem' }}>
            <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.875rem 2rem' }}>
              Join ML Hub
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '0.875rem 2rem' }}>
              Login
            </Link>
          </div>

          <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left', background: 'var(--bg-secondary)' }}>
            <div>
              <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>📚 Curated Content</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>Access top-tier ML papers and articles from Nature, arXiv, and MIT News.</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>💬 Discuss</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>Engage with the community through threaded comments and replies.</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>🎯 Personalized</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>Get recommendations based on your favorite ML categories and topics.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}