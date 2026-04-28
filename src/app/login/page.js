"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, user, profile, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const data = await signIn(email, password);
      // Let the useEffect handle the redirect once profile is loaded
    } catch (error) {
      setErrorMsg(error.message || "Failed to log in.");
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <main className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>Welcome Back</span>
          <h2>Login to ML Hub</h2>
          <p style={{ margin: 0 }}>Enter your credentials to access your dashboard.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <Link href="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
            Register here
          </Link>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}