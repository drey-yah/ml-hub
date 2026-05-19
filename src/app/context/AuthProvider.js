"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from the profiles table
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error.message);
      return { id: userId, role: 'user', name: 'User' };
    }
    return data || { id: userId, role: 'user', name: 'User' };
  }, []);

  // Initialize: load session and listen for auth changes
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error.message);
        }

        if (session?.user && mounted) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          if (mounted) setProfile(profileData);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          if (mounted) setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign up with name and role
  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "user" },
      },
    });

    if (error) throw error;
    return data;
  };

  // Sign in
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch profile after sign in
    if (data.user) {
      const profileData = await fetchProfile(data.user.id);
      setProfile(profileData);
    }

    return data;
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === "admin";
  const isAuthenticated = !!user;

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
