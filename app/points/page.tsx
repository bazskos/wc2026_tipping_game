"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  points: number;
  perfect_tips: number;
  streak: number;
}

interface HistoryItem {
  id: string;
  user_id: string;
  home_score: number;
  away_score: number;
  points: number | null;
  matches: {
    id: string;
    home_team: string;
    away_team: string;
    home_code: string;
    away_code: string;
    kickoff_at: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
    group_name: string;
    stage: string;
  };
}

export default function MyPointsClientPage() {
  const supabase = createClient();
  const carouselRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [allPredictions, setAllPredictions] = useState<HistoryItem[]>([]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      setSelectedUserId(user.id);

      const { data: pData, error: pError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, points, perfect_tips, streak")
        .order("points", { ascending: false });

      if (!pError && pData) {
        setProfiles(pData);
      } else {
        const { data: fallbackData } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, points")
          .order("points", { ascending: false });

        if (fallbackData) {
          const safeData = fallbackData.map((p) => ({
            ...p,
            perfect_tips: 0,
            streak: 0,
          }));
          setProfiles(safeData);
        }
      }

      const { data: predData } = await supabase.from("predictions").select(`
          id, user_id, home_score, away_score, points,
          matches (id, home_team, away_team, home_code, away_code, kickoff_at, status, home_score, away_score, group_name, stage)
        `);

      if (predData) {
        const sorted = (predData as any[]).sort((a, b) => {
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

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft } = carouselRef.current;
      const scrollTo =
        direction === "left" ? scrollLeft - 200 : scrollLeft + 200;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredHistory = allPredictions.filter(
    (item) => item.user_id === selectedUserId,
  );
  const selectedProfile = profiles.find((p) => p.id === selectedUserId);

  const getPhaseName = (match: any) => {
    if (match.stage && match.stage !== "Group Stage") {
      return match.stage;
    }
    return match.group_name || "UNKNOWN";
  };

  const orderedPhases = Array.from(
    new Set(filteredHistory.map((item) => getPhaseName(item.matches))),
  );

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-28 pb-12 overflow-hidden text-left">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs mb-8 group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5"
      >
        <span className="group-hover:-translate-x-1 transition-transform">
          ←
        </span>{" "}
        Return to Dashboard
      </Link>

      {/* PLAYER SWITCHER */}
      <div className="relative flex items-center bg-slate-900/40 p-4 rounded-2xl border border-white/5 mb-10 group/carousel">
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 z-10 bg-slate-800/80 p-2 rounded-full border border-white/10 hover:bg-slate-700 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
        >
          ←
        </button>

        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto scrollbar-none snap-x scroll-smooth w-full px-8 py-1"
          style={{ scrollbarWidth: "none" }}
        >
          {profiles.map((player) => {
            const isMe = player.id === currentUserId;
            const isSelected = player.id === selectedUserId;
            return (
              <button
                key={player.id}
                onClick={() => setSelectedUserId(player.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all snap-start shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 border-blue-500 text-white font-black shadow-lg shadow-blue-600/20 scale-105"
                    : "bg-slate-900/80 border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 text-[10px] font-bold">
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
                <span className="text-xs tracking-wide uppercase whitespace-nowrap">
                  {isMe ? "My Points" : player.name.split(" ")[0]}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isSelected ? "bg-black/30 text-white" : "bg-white/5 text-slate-400"}`}
                >
                  {player.points}p
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 z-10 bg-slate-800/80 p-2 rounded-full border border-white/10 hover:bg-slate-700 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
        >
          →
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3 mb-6">
          <span className="w-2 h-6 bg-blue-500 rounded-full animate-pulse"></span>
          {selectedUserId === currentUserId
            ? "My Submitted Tips"
            : `${selectedProfile?.name.split(" ")[0]}'s Tips`}
        </h2>

        {/* STATISTIC SECTION */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]">
            <span className="text-3xl font-black text-white">
              {selectedProfile?.points || 0}
            </span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
              All points
            </span>
          </div>
          <div className="bg-green-900/10 border border-green-500/20 rounded-2xl p-4 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(34,197,94,0.05)]">
            <span className="text-3xl font-black text-green-400">
              {selectedProfile?.perfect_tips || 0}
            </span>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">
              Perfect
            </span>
          </div>
          <div className="bg-orange-900/10 border border-orange-500/20 rounded-2xl p-4 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(249,115,22,0.05)]">
            <span className="text-3xl font-black text-orange-400">
              {selectedProfile?.streak || 0}
            </span>
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">
              Streak
            </span>
          </div>
        </div>
      </div>

      {/* LISTING TIPS */}
      {filteredHistory.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 text-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">
            No tips submitted yet for this user.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {orderedPhases.map((phase) => {
            const phaseItems = filteredHistory.filter(
              (item) => getPhaseName(item.matches) === phase,
            );

            return (
              <div key={phase} className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                  {phase}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {phaseItems.map((item) => {
                    const isSecret =
                      item.user_id !== currentUserId &&
                      item.matches.status === "scheduled";

                    return (
                      <motion.div
                        initial="hidden"
                        animate="show"
                        variants={itemVariants}
                        key={item.id}
                        className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all hover:border-white/10 hover:bg-slate-900/80"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${item.matches.status === "finished" ? "bg-slate-800 text-slate-400" : item.matches.status === "live" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}
                          >
                            {item.matches.status === "finished"
                              ? "Finished"
                              : item.matches.status === "live"
                                ? "Live"
                                : "Scheduled"}
                          </span>

                          {item.points !== null ? (
                            <div
                              className={`flex items-center gap-1 font-bold text-xs uppercase tracking-widest px-2 py-1 rounded-md ${item.points === 3 ? "bg-green-500/20 text-green-400 border border-green-500/30" : item.points === 1 ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-slate-800 text-slate-400 border border-white/5"}`}
                            >
                              {item.points > 0
                                ? `+${item.points} Pont`
                                : "0 Pont"}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              In Progress
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-8 h-6 rounded overflow-hidden">
                              <Image
                                src={`https://flagcdn.com/w80/${item.matches.home_code}.png`}
                                alt={item.matches.home_team}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <span className="text-xs font-bold text-white text-center line-clamp-1">
                              {item.matches.home_team}
                            </span>
                          </div>

                          <div className="flex flex-col items-center px-4">
                            <div className="text-xl font-black text-white mb-1">
                              {item.matches.home_score !== null
                                ? `${item.matches.home_score} : ${item.matches.away_score}`
                                : "vs"}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-black/20 px-2 py-1 rounded-md border border-white/5">
                              Tipped:{" "}
                              <span className="text-blue-400 font-bold">
                                {isSecret
                                  ? "? : ?"
                                  : `${item.home_score}:${item.away_score}`}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-8 h-6 rounded overflow-hidden">
                              <Image
                                src={`https://flagcdn.com/w80/${item.matches.away_code}.png`}
                                alt={item.matches.away_team}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <span className="text-xs font-bold text-white text-center line-clamp-1">
                              {item.matches.away_team}
                            </span>
                          </div>
                        </div>
                      </motion.div>
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
