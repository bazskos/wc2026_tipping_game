"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MyPointsClientPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [allPredictions, setAllPredictions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);
      setSelectedUserId(user.id);

      const { data: pData } = await supabase
        .from("profiles")
        .select("*")
        .order("points", { ascending: false });
      if (pData) setProfiles(pData);

      const { data: predData } = await supabase.from("predictions").select(`
          id, user_id, home_score, away_score, points,
          matches (id, home_team, away_team, kickoff_at, status, stage, home_score, away_score, status_short, home_score_aet, away_score_aet, home_penalty, away_penalty, group_name)
        `);

      if (predData) {
        setAllPredictions(
          predData.sort(
            (a: any, b: any) =>
              new Date(a.matches.kickoff_at).getTime() -
              new Date(b.matches.kickoff_at).getTime(),
          ),
        );
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const selectedProfile = profiles.find((p) => p.id === selectedUserId);
  const filteredHistory = allPredictions.filter(
    (item) => item.user_id === selectedUserId,
  );

  const groupedHistory = filteredHistory.reduce((groups: any, item: any) => {
    const phase =
      item.matches.stage && item.matches.stage !== "Group Stage"
        ? item.matches.stage
        : item.matches.group_name || "Egyéb";
    if (!groups[phase]) groups[phase] = [];
    groups[phase].push(item);
    return groups;
  }, {});

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-20">
      <Link
        href="/"
        className="text-slate-400 hover:text-white transition-colors text-sm font-bold mb-8 block"
      >
        ← Back to Dashboard
      </Link>

      {/* PROFILE SLIDER */}
      <div className="mb-10">
        <h2 className="text-white font-bold text-xl mb-4">Leaderboard</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedUserId(p.id)}
              className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-2xl border transition-all ${selectedUserId === p.id ? "bg-blue-600/20 border-blue-500/50" : "bg-slate-900/50 border-white/5"}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.name} />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {p.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">{p.name}</div>
                <div className="text-xs text-blue-400 font-mono">
                  {p.points}p
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* STATISTIC */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-slate-900/50 border border-blue-500/20 p-4 rounded-2xl text-center">
          <div className="text-3xl font-black text-white">
            {selectedProfile?.points || 0}
          </div>
          <div className="text-[10px] uppercase text-blue-400 font-bold">
            Pont
          </div>
        </div>
        <div className="bg-slate-900/50 border border-green-500/20 p-4 rounded-2xl text-center">
          <div className="text-3xl font-black text-green-400">
            {selectedProfile?.perfect_tips || 0}
          </div>
          <div className="text-[10px] uppercase text-green-500 font-bold">
            Perfect
          </div>
        </div>
        <div className="bg-slate-900/50 border border-orange-500/20 p-4 rounded-2xl text-center">
          <div className="text-3xl font-black text-orange-400">
            {selectedProfile?.streak || 0}
          </div>
          <div className="text-[10px] uppercase text-orange-500 font-bold">
            Streak
          </div>
        </div>
      </div>

      {/* TIPS HISTORY */}
      {Object.entries(groupedHistory).map(([phase, items]: any) => (
        <div key={phase} className="mb-8">
          <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
            {phase}
          </h3>
          <div className="space-y-3">
            {items.map((item: any) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={item.id}
                className="bg-slate-900/30 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-slate-300 font-bold">
                    {item.matches.home_team} vs {item.matches.away_team}
                  </div>
                  <div className="text-[10px] text-blue-400">
                    Tipped: {item.home_score}:{item.away_score}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {item.matches.home_score ?? "-"} :{" "}
                    {item.matches.away_score ?? "-"}
                  </div>
                  {item.matches.status_short === "AET" && (
                    <div className="text-[9px] text-blue-400">AET</div>
                  )}
                  {item.matches.status_short === "PEN" && (
                    <div className="text-[9px] text-yellow-500">PEN</div>
                  )}
                  <div className="text-xs text-green-500 font-bold">
                    +{item.points || 0}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
