"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function MyPointsClientPage() {
  const supabase = createClient();
  const carouselRef = useRef<HTMLDivElement>(null);
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
          matches (id, home_team, away_team, home_code, away_code, kickoff_at, status, home_score, away_score, stage, home_score_aet, away_score_aet, home_penalty, away_penalty, status_short)
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

  // Szakaszok szerinti csoportosítás
  const groupedHistory = filteredHistory.reduce((groups: any, item: any) => {
    const phase = item.matches.stage || "Group Stage";
    if (!groups[phase]) groups[phase] = [];
    groups[phase].push(item);
    return groups;
  }, {});

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Betöltés...
      </div>
    );

  return (
    <div className="max-w-[1000px] mx-auto px-4 pt-28 pb-12">
      <Link href="/" className="text-blue-400 font-bold mb-8 block">
        ← Vissza a Dashboardra
      </Link>

      {/* PROFIL CAROUSEL */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedUserId(p.id)}
            className={`px-6 py-2 rounded-full border ${selectedUserId === p.id ? "bg-blue-600 border-blue-500" : "bg-slate-900 border-white/10"}`}
          >
            {p.name.split(" ")[0]} ({p.points}p)
          </button>
        ))}
      </div>

      {/* STATISZTIKA KÁRTYÁK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-blue-500/20 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-3xl font-black text-white">
            {selectedProfile?.points || 0}
          </div>
          <div className="text-xs uppercase text-blue-400 font-bold">
            Összpontszám
          </div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-green-500/20 text-center">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-3xl font-black text-white">
            {selectedProfile?.perfect_tips || 0}
          </div>
          <div className="text-xs uppercase text-green-500 font-bold">
            Telitalálat
          </div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-orange-500/20 text-center">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-3xl font-black text-white">
            {selectedProfile?.streak || 0}
          </div>
          <div className="text-xs uppercase text-orange-500 font-bold">
            Jelenlegi Streak
          </div>
        </div>
      </div>

      {/* TIPPEK LISTÁJA */}
      {Object.entries(groupedHistory).map(([phase, items]: any) => (
        <div key={phase} className="mb-10">
          <h3 className="text-white font-black uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
            {phase}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="bg-slate-900/40 p-4 rounded-xl border border-white/5"
              >
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>
                    {item.matches.home_team} - {item.matches.away_team}
                  </span>
                  <span
                    className={
                      item.points === 3 ? "text-green-500" : "text-slate-500"
                    }
                  >
                    +{item.points || 0}
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {item.matches.home_score ?? "-"} :{" "}
                  {item.matches.away_score ?? "-"}
                </div>
                {/* HOSSZABBÍTÁS ÉS BÜNTETŐK KIÍRÁSA */}
                {item.matches.status_short === "AET" && (
                  <div className="text-[10px] text-blue-400">
                    AET: {item.matches.home_score_aet}-
                    {item.matches.away_score_aet}
                  </div>
                )}
                {item.matches.status_short === "PEN" && (
                  <div className="text-[10px] text-yellow-500">
                    PEN: {item.matches.home_penalty}-{item.matches.away_penalty}
                  </div>
                )}
                <div className="text-xs text-blue-400 mt-2">
                  Tipped: {item.home_score}:{item.away_score}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
