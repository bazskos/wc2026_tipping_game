"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trophy, Flame, Target, ChevronRight } from "lucide-react";

export default function MyPointsClientPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [allPredictions, setAllPredictions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          setSelectedUserId(user.id);
        }

        const { data: pData } = await supabase
          .from("profiles")
          .select("*")
          .order("points", { ascending: false });
        if (pData) setProfiles(pData);

        const { data: predData } = await supabase.from("predictions").select(`
          id, 
          user_id, 
          home_score, 
          away_score, 
          points,
          matches (
            id, 
            home_team, 
            away_team, 
            home_code, 
            away_code, 
            kickoff_at, 
            status, 
            stage, 
            home_score, 
            away_score, 
            status_short, 
            group_name
          )
        `);

        if (predData) {
          const sortedPredictions = predData.sort(
            (a: any, b: any) =>
              new Date(a.matches.kickoff_at).getTime() -
              new Date(b.matches.kickoff_at).getTime(),
          );
          setAllPredictions(sortedPredictions);
        }
      } catch (error) {
        console.error("Error while fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  const selectedProfile = profiles.find((p) => p.id === selectedUserId);

  const filteredHistory = useMemo(() => {
    return allPredictions.filter((item) => item.user_id === selectedUserId);
  }, [allPredictions, selectedUserId]);

  const userStats = useMemo(() => {
    let currentStreak = 0;
    let perfects = 0;

    const finishedPredictions = filteredHistory.filter(
      (item) => item.matches.status === "finished",
    );

    finishedPredictions.forEach((item) => {
      const pts = item.points || 0;
      if (pts === 3) perfects++;

      if (pts > 0) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }
    });

    return {
      perfects,
      streak: currentStreak,
    };
  }, [filteredHistory]);

  const groupedHistory = useMemo(() => {
    return filteredHistory.reduce((groups: any, item: any) => {
      const groupKey =
        item.matches.stage && item.matches.stage !== "Group Stage"
          ? item.matches.stage
          : item.matches.group_name || "Group Stage";

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
      return groups;
    }, {});
  }, [filteredHistory]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-24 pb-20 relative z-10 font-sans text-white">
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-bold mb-8"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Back to Dashboard
      </Link>

      <div className="mb-12">
        <h2 className="font-heading font-black text-2xl tracking-widest uppercase mb-6 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-emerald-400 rounded-full"></span>
          Ranglist
        </h2>

        <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {profiles.map((p, index) => (
            <button
              key={p.id}
              onClick={() => setSelectedUserId(p.id)}
              className={`snap-center flex-shrink-0 flex items-center gap-4 p-4 rounded-3xl border backdrop-blur-xl transition-all duration-300 min-w-[240px] ${
                selectedUserId === p.id
                  ? "bg-blue-600/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.25)] scale-105"
                  : "bg-slate-900/40 border-white/5 hover:bg-white/5 hover:border-white/10"
              }`}
            >
              <div className="font-mono text-lg font-black text-slate-500 w-6">
                {index + 1}.
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white/10 relative">
                {p.avatar_url ? (
                  <img
                    src={p.avatar_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {p.name?.substring(0, 2).toUpperCase() || "U"}
                  </span>
                )}
              </div>

              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate uppercase tracking-wider">
                  {p.name ? p.name.split(" ")[0] : "User"}{" "}
                  {p.id === currentUserId && "(Én)"}
                </div>
                <div
                  className={`text-xs font-mono font-bold ${selectedUserId === p.id ? "text-blue-400" : "text-slate-500"}`}
                >
                  {p.points || 0} PTS
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedUserId}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
              <Trophy className="w-8 h-8 text-blue-400 mb-3" />
              <span className="text-4xl font-black text-white font-mono">
                {selectedProfile?.points || 0}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                All Points
              </span>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
              <Flame
                className={`w-8 h-8 mb-3 ${userStats.streak >= 3 ? "text-orange-500 animate-pulse" : "text-slate-500"}`}
              />
              <span
                className={`text-4xl font-black font-mono ${userStats.streak >= 3 ? "text-orange-400" : "text-white"}`}
              >
                {userStats.streak}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Streak
              </span>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg relative overflow-hidden col-span-2 md:col-span-1">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
              <Target className="w-8 h-8 text-emerald-400 mb-3" />
              <span className="text-4xl font-black text-white font-mono">
                {userStats.perfects}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Perfect
              </span>
            </div>
          </div>

          <div className="space-y-12">
            {Object.keys(groupedHistory).length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 border border-white/5 rounded-3xl">
                <p className="text-slate-500 font-bold uppercase tracking-widest">
                  This user has not tipped yet.
                </p>
              </div>
            ) : (
              Object.entries(groupedHistory).map(([groupName, items]: any) => (
                <div key={groupName} className="space-y-6">
                  <h3 className="font-heading text-white font-black text-xl tracking-widest uppercase flex items-center gap-2 border-b border-white/10 pb-4">
                    <ChevronRight className="w-6 h-6 text-blue-500" />
                    {groupName}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item: any) => {
                      const match = item.matches;
                      const isFinished = match.status === "finished";
                      const pts = item.points || 0;

                      return (
                        <div
                          key={item.id}
                          className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden hover:border-white/10 transition-colors"
                        >
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-slate-500">
                              {new Date(match.kickoff_at).toLocaleDateString(
                                "hu-HU",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] ${match.status === "live" ? "bg-red-500/10 text-red-400 animate-pulse" : isFinished ? "bg-slate-800 text-slate-400" : "bg-blue-500/10 text-blue-400"}`}
                            >
                              {match.status === "live"
                                ? "LIVE"
                                : isFinished
                                  ? match.status_short || "ENDED"
                                  : "Pending"}
                            </span>
                          </div>

                          {/* Teams and result */}
                          <div className="flex justify-between items-center mt-2">
                            {/* Home team */}
                            <div className="flex flex-col items-center flex-1">
                              <div className="w-12 h-8 rounded shadow-md overflow-hidden mb-2 border border-white/10 relative">
                                {match.home_code && match.home_code !== "un" ? (
                                  <Image
                                    src={`https://flagcdn.com/w80/${match.home_code.toLowerCase()}.png`}
                                    alt={match.home_team}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[8px] text-white font-bold">
                                    FIFA
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-bold text-white text-center line-clamp-1">
                                {match.home_team}
                              </span>
                            </div>

                            {/* Real result */}
                            <div className="flex flex-col items-center px-2">
                              <div className="font-mono text-2xl font-black text-white bg-black/40 px-3 py-1 rounded-xl border border-white/5 shadow-inner">
                                {match.home_score ?? "-"}
                                <span className="text-slate-600 mx-1">:</span>
                                {match.away_score ?? "-"}
                              </div>
                            </div>

                            {/* Away team */}
                            <div className="flex flex-col items-center flex-1">
                              <div className="w-12 h-8 rounded shadow-md overflow-hidden mb-2 border border-white/10 relative">
                                {match.away_code && match.away_code !== "un" ? (
                                  <Image
                                    src={`https://flagcdn.com/w80/${match.away_code.toLowerCase()}.png`}
                                    alt={match.away_team}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[8px] text-white font-bold">
                                    FIFA
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-bold text-white text-center line-clamp-1">
                                {match.away_team}
                              </span>
                            </div>
                          </div>

                          {/* The choosen user */}
                          <div className="mt-2 pt-4 border-t border-white/5 flex justify-between items-center bg-black/20 -mx-5 -mb-5 px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Tipped:
                              </span>
                              <span className="font-mono text-sm font-black text-slate-300">
                                {item.home_score} : {item.away_score}
                              </span>
                            </div>

                            {/* Points badge */}
                            {isFinished && (
                              <div
                                className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                                  pts === 3
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                                    : pts === 1
                                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                      : "bg-slate-800 text-slate-500 border border-slate-700"
                                }`}
                              >
                                +{pts} PTS
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
