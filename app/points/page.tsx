"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  points: number;
  perfect_tips: number;
  streak: number;
}

interface MatchData {
  id: number;
  home_team: string;
  away_team: string;
  home_code: string;
  away_code: string;
  kickoff_at: string;
  status: string;
  stage: string;
  group_name: string;
  home_score: number | null;
  away_score: number | null;
  status_short: string;
  home_score_aet: number | null;
  away_score_aet: number | null;
  home_penalty: number | null;
  away_penalty: number | null;
}

interface PredictionData {
  id: number;
  user_id: string;
  home_score: number;
  away_score: number;
  points: number | null;
  matches: MatchData;
}

export default function MyPointsClientPage() {
  const supabase = createClient();
  const carouselRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [allPredictions, setAllPredictions] = useState<PredictionData[]>([]);

  useEffect(() => {
    async function loadData() {
      // 1. Get logged in user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      setSelectedUserId(user.id);

      // 2. Fetch all profiles for the slider and stats
      const { data: pData } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, points, perfect_tips, streak")
        .order("points", { ascending: false });

      if (pData) {
        setProfiles(pData as Profile[]);
      }

      // 3. Fetch all predictions with joined match data
      const { data: predData } = await supabase.from("predictions").select(`
          id, user_id, home_score, away_score, points,
          matches (id, home_team, away_team, home_code, away_code, kickoff_at, status, stage, group_name, home_score, away_score, status_short, home_score_aet, away_score_aet, home_penalty, away_penalty)
        `);

      if (predData) {
        // Sort chronologically (oldest to newest)
        const sorted = (predData as PredictionData[]).sort((a, b) => {
          return (
            new Date(a.matches.kickoff_at).getTime() -
            new Date(b.matches.kickoff_at).getTime()
          );
        });
        setAllPredictions(sorted);
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  // --- Handlers & Helpers ---
  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft } = carouselRef.current;
      const scrollTo =
        direction === "left" ? scrollLeft - 200 : scrollLeft + 200;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const getPhaseName = (match: MatchData) => {
    if (match.stage && match.stage !== "Group Stage") return match.stage;
    return match.group_name || "Other";
  };

  // --- Derived State ---
  const selectedProfile = profiles.find((p) => p.id === selectedUserId);
  const filteredHistory = allPredictions.filter(
    (item) => item.user_id === selectedUserId,
  );

  // Group by phase (Group A, Round of 16, etc.) preserving chronological order
  const orderedPhases = Array.from(
    new Set(filteredHistory.map((item) => getPhaseName(item.matches))),
  );

  // --- Render ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-28 pb-20 overflow-hidden text-left">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs mb-10 group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5"
      >
        <span className="group-hover:-translate-x-1 transition-transform">
          ←
        </span>{" "}
        Return to Dashboard
      </Link>

      {/* --- PROFILE SLIDER --- */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-white font-black text-xl uppercase tracking-widest">
            Players
          </h2>
        </div>
        <div className="relative flex items-center bg-slate-900/40 p-4 rounded-3xl border border-white/5 shadow-xl group/carousel">
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 z-10 bg-slate-800/90 p-3 rounded-full border border-white/10 hover:bg-slate-700 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer shadow-lg backdrop-blur-md"
          >
            ←
          </button>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scrollbar-none snap-x scroll-smooth w-full px-8 py-2"
            style={{ scrollbarWidth: "none" }}
          >
            {profiles.map((player, index) => {
              const isMe = player.id === currentUserId;
              const isSelected = player.id === selectedUserId;
              return (
                <button
                  key={player.id}
                  onClick={() => setSelectedUserId(player.id)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all snap-start shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105"
                      : "bg-slate-950/50 border-white/5 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 text-xs font-bold shrink-0">
                    {player.avatar_url ? (
                      <img
                        src={player.avatar_url}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      player.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold uppercase tracking-wider whitespace-nowrap leading-none mb-1">
                      {isMe ? "My Profile" : player.name.split(" ")[0]}
                    </span>
                    <span
                      className={`text-[10px] font-black tracking-widest uppercase ${isSelected ? "text-blue-200" : "text-slate-500"}`}
                    >
                      Rank #{index + 1}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-2 z-10 bg-slate-800/90 p-3 rounded-full border border-white/10 hover:bg-slate-700 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer shadow-lg backdrop-blur-md"
          >
            →
          </button>
        </div>
      </div>

      {/* --- STATS SECTION --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedUserId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Points Card */}
            <div className="bg-slate-900/60 border border-blue-500/20 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-lg group hover:border-blue-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
              <span className="text-4xl mb-3 relative z-10">🏆</span>
              <span className="text-5xl font-black text-white relative z-10 tabular-nums">
                {selectedProfile?.points || 0}
              </span>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-2 relative z-10">
                Total Points
              </span>
            </div>

            {/* Perfect Tips Card */}
            <div className="bg-slate-900/60 border border-green-500/20 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-lg group hover:border-green-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors"></div>
              <span className="text-4xl mb-3 relative z-10">🎯</span>
              <span className="text-5xl font-black text-green-400 relative z-10 tabular-nums">
                {selectedProfile?.perfect_tips || 0}
              </span>
              <span className="text-xs font-bold text-green-500 uppercase tracking-widest mt-2 relative z-10">
                Perfect Tips
              </span>
            </div>

            {/* Streak Card */}
            <div className="bg-slate-900/60 border border-orange-500/20 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-lg group hover:border-orange-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
              <span className="text-4xl mb-3 relative z-10">🔥</span>
              <span className="text-5xl font-black text-orange-400 relative z-10 tabular-nums">
                {selectedProfile?.streak || 0}
              </span>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-2 relative z-10">
                Hot Streak
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* --- PREDICTION HISTORY --- */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">
          {selectedUserId === currentUserId
            ? "My Predictions"
            : `${selectedProfile?.name.split(" ")[0]}'s Predictions`}
        </h2>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-16 text-center shadow-inner">
          <span className="text-4xl opacity-50 mb-4 block">👻</span>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
            No predictions submitted yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {orderedPhases.map((phase) => {
            const phaseItems = filteredHistory.filter(
              (item) => getPhaseName(item.matches) === phase,
            );

            return (
              <div key={phase as string} className="flex flex-col gap-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-4">
                  <span>{phase as string}</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {phaseItems.map((item) => {
                    const match = item.matches;
                    const isSecret =
                      item.user_id !== currentUserId &&
                      match.status === "scheduled";
                    const isFinished = match.status === "finished";
                    const isLive = match.status === "live";

                    // Calculate display score (AET/PEN takes precedence for main display if needed, but standard is 90 mins)
                    const displayHome =
                      (match.status_short === "AET" ||
                        match.status_short === "PEN") &&
                      match.home_score_aet !== null
                        ? match.home_score_aet
                        : match.home_score;
                    const displayAway =
                      (match.status_short === "AET" ||
                        match.status_short === "PEN") &&
                      match.away_score_aet !== null
                        ? match.away_score_aet
                        : match.away_score;

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-950/50 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all relative overflow-hidden group"
                      >
                        {/* Status & Points Bar */}
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isFinished ? "bg-slate-800 text-slate-400" : isLive ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-blue-500/20 text-blue-400"}`}
                          >
                            {isFinished
                              ? "FT"
                              : isLive
                                ? "LIVE"
                                : new Date(match.kickoff_at).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric" },
                                  )}
                          </span>

                          {item.points !== null ? (
                            <div
                              className={`flex items-center gap-1 font-black text-[10px] uppercase tracking-widest px-2 py-1 rounded-md ${item.points === 3 ? "bg-green-500/20 text-green-400 border border-green-500/30" : item.points === 1 ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-slate-800 text-slate-500 border border-white/5"}`}
                            >
                              {item.points > 0
                                ? `+${item.points} PTS`
                                : "0 PTS"}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                              Pending
                            </span>
                          )}
                        </div>

                        {/* Match Content */}
                        <div className="flex items-start justify-between gap-2">
                          {/* Home Team */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="relative w-12 h-8 rounded-md overflow-hidden shadow-md mb-2 border border-white/10">
                              {match.home_code !== "un" ? (
                                <img
                                  src={`https://flagcdn.com/w80/${match.home_code}.png`}
                                  alt={match.home_team}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[8px] text-white">
                                  FIFA
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-bold text-white text-center line-clamp-1">
                              {match.home_team}
                            </span>
                          </div>

                          {/* Scores */}
                          <div className="flex flex-col items-center justify-start mt-1">
                            {isFinished || isLive ? (
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-2">
                                  <div className="font-mono text-3xl font-black text-white">
                                    {displayHome ?? 0}
                                  </div>
                                  <span className="text-slate-600 font-black">
                                    :
                                  </span>
                                  <div className="font-mono text-3xl font-black text-white">
                                    {displayAway ?? 0}
                                  </div>
                                </div>

                                {/* AET / PEN Display */}
                                {match.status_short === "AET" && (
                                  <div className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 mt-1 uppercase">
                                    90': {match.home_score}-{match.away_score}{" "}
                                    (AET)
                                  </div>
                                )}
                                {match.status_short === "PEN" &&
                                  match.home_penalty !== null && (
                                    <div className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 mt-1 uppercase">
                                      PEN: {match.home_penalty}-
                                      {match.away_penalty}
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <div className="font-mono text-2xl font-black text-slate-700">
                                - : -
                              </div>
                            )}

                            {/* User's Tip */}
                            <div className="mt-3 bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 flex flex-col items-center shadow-inner">
                              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">
                                Tipped
                              </span>
                              <span
                                className={`font-mono text-sm font-black ${isSecret ? "text-slate-600" : "text-blue-400"}`}
                              >
                                {isSecret
                                  ? "? : ?"
                                  : `${item.home_score} : ${item.away_score}`}
                              </span>
                            </div>
                          </div>

                          {/* Away Team */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="relative w-12 h-8 rounded-md overflow-hidden shadow-md mb-2 border border-white/10">
                              {match.away_code !== "un" ? (
                                <img
                                  src={`https://flagcdn.com/w80/${match.away_code}.png`}
                                  alt={match.away_team}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[8px] text-white">
                                  FIFA
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-bold text-white text-center line-clamp-1">
                              {match.away_team}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
