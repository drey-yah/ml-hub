"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function showMessage(text, type) {
    setMessage(text);
    setMessageType(type);
  }

  function validateForm() {
    if (!email || !password) {
      showMessage("Please enter both email and password.", "error");
      return false;
    }

    if (!email.includes("@")) {
      showMessage("Please enter a valid email address.", "error");
      return false;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters.", "error");
      return false;
    }

    return true;
  }

  async function handleSignUp() {
    if (!validateForm()) return;

    setLoading(true);
    showMessage("", "");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      showMessage(error.message, "error");
      return;
    }

    if (data.session) {
      showMessage("Sign up successful. You are now logged in.", "success");
    } else {
      showMessage(
        "Sign up successful. Please check your email to confirm your account before logging in.",
        "success"
      );
    }
  }

  async function handleLogin() {
    if (!validateForm()) return;

    setLoading(true);
    showMessage("", "");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      showMessage(error.message, "error");
      return;
    }

    showMessage("Login successful.", "success");
  }

  async function handleLogout() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) {
      showMessage(error.message, "error");
      return;
    }

    setEmail("");
    setPassword("");
    showMessage("You have logged out successfully.", "success");
  }

  return (
    <main className="page-shell">
      <section className="card">
        <span className="small-label">Supabase Authentication</span>

        <h2>Login / Sign Up</h2>

        <p>
          Use your email and password to create an account or log in to Machine
          Learning Hub.
        </p>

        {user ? (
          <div className="user-box">
            <h2>Welcome!</h2>
            <p>You are currently logged in as:</p>
            <p className="email">{user.email}</p>

            <button
              className="button secondary"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? "Processing..." : "Logout"}
            </button>
          </div>
        ) : (
          <div className="form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter at least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="actions">
              <button
                className="button"
                onClick={handleSignUp}
                disabled={loading}
              >
                {loading ? "Processing..." : "Sign Up"}
              </button>

              <button
                className="button secondary"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Processing..." : "Login"}
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <Link href="/" className="nav-link">
          Back to Landing Page
        </Link>
      </section>
    </main>
  );
}