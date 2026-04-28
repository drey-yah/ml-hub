"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthProvider";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signUp, user, profile, loading } = useAuth();
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

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const data = await signUp(email, password, name);
      
      // If email confirmation is required by Supabase, session might be null
      if (data?.session) {
        setSuccessMsg("Registration successful! Redirecting...");
        // UseEffect will handle redirect
      } else {
        setSuccessMsg("Registration successful! You can now log in.");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (error) {
      setErrorMsg(error.message || "Failed to register.");
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
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>Join the Community</span>
          <h2>Create an Account</h2>
          <p style={{ margin: 0 }}>Register to interact with ML articles and discussions.</p>
        </div>

        {successMsg ? (
          <div style={{ color: 'var(--success)', marginBottom: '1.5rem', textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)' }}>
            {successMsg}
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isSubmitting ? "Creating account..." : "Register"}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link href="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
            Login here
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
