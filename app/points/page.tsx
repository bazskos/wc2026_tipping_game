"use client";

import { useEffect, useState, useRef } from "react";
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
          matches (id, home_team, away_team, kickoff_at, status, stage, home_score, away_score, status_short, home_score_aet, away_score_aet, home_penalty, away_penalty)
        `);

      if (predData) {
        setAllPredictions(
          predData.sort(
            (a: any, b: any) =>
              new Date(b.matches.kickoff_at).getTime() -
              new Date(a.matches.kickoff_at).getTime(),
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
        <h2 className="text-white font-bold text-xl mb-4">Ranglista</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedUserId(p.id)}
              className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-2xl border transition-all ${selectedUserId === p.id ? "bg-white/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]" : "bg-slate-900/50 border-white/5 hover:border-white/20"}`}
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
                  {p.points} pont
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-center">
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-xl font-black text-white">
            {selectedProfile?.points || 0}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">
            All Points
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-center">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-xl font-black text-white">
            {selectedProfile?.perfect_tips || 0}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">
            Perfect
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-center">
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-xl font-black text-white">
            {selectedProfile?.streak || 0}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">
            Streak
          </div>
        </div>
      </div>

      <h2 className="text-white font-bold text-xl mb-6">Tip history</h2>
      <div className="space-y-3">
        {filteredHistory.map((item) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={item.id}
            className="bg-slate-900/30 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex flex-col gap-1">
              <div className="text-xs text-slate-400 font-bold">
                {item.matches.home_team} vs {item.matches.away_team}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-blue-400 font-mono">
                  Tipped: {item.home_score}:{item.away_score}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-white font-mono">
                  Ended: {item.matches.home_score}:{item.matches.away_score}
                </span>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-lg text-xs font-black ${item.points >= 3 ? "bg-green-500/20 text-green-400" : item.points > 0 ? "bg-blue-500/20 text-blue-400" : "bg-red-500/10 text-red-500"}`}
            >
              +{item.points || 0}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
