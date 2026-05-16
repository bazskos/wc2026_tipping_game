"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();
  const [userPoints, setUserPoints] = useState(0);
  const [wantsReminders, setWantsReminders] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("points, wants_reminders") // Kiegészítve: kéri a wants_reminders-t is!
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUserPoints(profile.points || 0);
          setWantsReminders(profile.wants_reminders !== false);
        }
      }
    };

    getUser(); // <-- Ezt is beletettük, hogy rögtön lefusson

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // JAVÍTÁS: A toggleReminders most már KÜLÖN függvény, a handleLogout alatt!
  const toggleReminders = async () => {
    if (!user) return;
    const newValue = !wantsReminders;
    setWantsReminders(newValue);

    await supabase
      .from("profiles")
      .update({ wants_reminders: newValue })
      .eq("id", user.id);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/5 shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <img src="/logo.png" alt="WC2026 Logo" className="h-8 w-auto" />
          <span className="font-heading font-black text-xl tracking-widest text-white">
            WC2026
          </span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              Dashboard
            </Link>
            <Link
              href="/points"
              className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              My Points
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <Link
                href="/points"
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-white/5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs border border-white/10 overflow-hidden group-hover:scale-110 transition-transform">
                  {user.user_metadata?.avatar_url ||
                  user.user_metadata?.picture ? (
                    <img
                      src={
                        user.user_metadata.avatar_url ||
                        user.user_metadata.picture
                      }
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.user_metadata?.full_name
                      ?.substring(0, 2)
                      .toUpperCase() || "US"
                  )}
                </div>
                <div className="hidden sm:block text-right pr-1">
                  <p className="text-xs font-bold text-white leading-none truncate max-w-[100px]">
                    {user.user_metadata?.full_name?.split(" ")[0] || "Player"}
                  </p>
                  <p className="text-[10px] font-black text-yellow-500 mt-0.5 tracking-wider">
                    {userPoints} PTS
                  </p>
                </div>
              </Link>

              <button
                onClick={toggleReminders}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  wantsReminders
                    ? "text-yellow-400 hover:bg-yellow-400/10"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
                title={wantsReminders ? "Reminders: ON" : "Reminders: OFF"}
              >
                {wantsReminders ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9m-3.5-3.5l11-11"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
                title="Logout"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 ml-1 text-slate-400 hover:text-white bg-white/5 rounded-lg transition-colors cursor-pointer border border-white/10"
              >
                {isMobileMenuOpen ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google Login
            </button>
          )}
        </div>
      </div>

      {isMobileMenuOpen && user && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-slate-900/95 backdrop-blur-2xl border-b border-white/10 flex flex-col py-6 px-4 gap-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-center py-4 bg-white/5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-widest border border-white/5 active:scale-95"
          >
            Dashboard
          </Link>
          <Link
            href="/points"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-center py-4 bg-white/5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-widest border border-white/5 active:scale-95"
          >
            My Points
          </Link>
        </div>
      )}
    </nav>
  );
}
