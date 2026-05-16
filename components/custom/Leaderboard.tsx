"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import confetti from "canvas-confetti";

type RealProfile = {
  id: string;
  name: string;
  avatar_url: string;
  points: number;
  perfect_tips: number;
  streak: number;
};

export function Leaderboard() {
  const [players, setPlayers] = useState<RealProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();
  const hasTriggeredConfetti = useRef(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    };
    getSession();

    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("points", { ascending: false });

        if (error) {
          console.error("Leaderboard fetch error:", error.message);
        } else {
          setPlayers(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();

    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchLeaderboard();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    if (players.length > 0 && currentUserId && !hasTriggeredConfetti.current) {
      const me = players.find((p) => p.id === currentUserId);

      if (me) {
        const savedPerfectsStr = localStorage.getItem("my_perfect_tips");
        const savedPerfects = savedPerfectsStr
          ? parseInt(savedPerfectsStr, 10)
          : 0;

        if (me.perfect_tips > savedPerfects) {
          fireConfetti();

          localStorage.setItem("my_perfect_tips", me.perfect_tips.toString());
          hasTriggeredConfetti.current = true;
        } else if (me.perfect_tips < savedPerfects) {
          localStorage.setItem("my_perfect_tips", me.perfect_tips.toString());
        }
      }
    }
  }, [players, currentUserId]);

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col h-[400px] animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded-full mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col h-full group text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
        <h3 className="font-heading text-white font-black text-xl tracking-widest uppercase flex items-center gap-3">
          <span className="w-1.5 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.6)]"></span>
          Leaderboard
        </h3>
        <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md animate-pulse">
          Live
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {players.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-500 italic mb-2">
              No players found in database.
            </p>
            <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">
              Wait for someone to join
            </p>
          </div>
        ) : (
          players.map((player, index) => {
            const isHotStreak = player.streak >= 3;

            return (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all relative overflow-hidden ${
                  index === 0
                    ? "bg-yellow-500/10 border border-yellow-500/20 shadow-lg"
                    : "bg-white/5 border border-transparent"
                } ${player.id === currentUserId ? "ring-2 ring-blue-500/50" : ""}`}
              >
                {isHotStreak && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none"></div>
                )}

                <div
                  className={`font-mono text-lg font-black w-6 text-center z-10 ${index === 0 ? "text-yellow-500" : "text-slate-500"}`}
                >
                  {index + 1}.
                </div>

                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 z-10">
                  {player.avatar_url ? (
                    <Image
                      src={player.avatar_url}
                      alt={player.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="bg-slate-800 w-full h-full flex items-center justify-center text-[10px]">
                      {player.name?.substring(0, 2)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 z-10">
                  <p className="font-bold text-sm text-white truncate uppercase tracking-wider flex items-center gap-2">
                    {player.name?.split(" ")[0]}
                    {/* Hot Streak Icon */}
                    {isHotStreak && (
                      <span
                        className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 flex items-center gap-1 animate-pulse"
                        title={`Hot Streak: ${player.streak} correct tips in a row!`}
                      >
                        🔥 {player.streak}
                      </span>
                    )}
                  </p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    {player.perfect_tips || 0} Perfect
                  </p>
                </div>

                <div className="text-right z-10">
                  <p
                    className={`font-mono text-xl font-black ${index === 0 ? "text-yellow-500" : "text-white"}`}
                  >
                    {player.points}
                  </p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase">
                    pts
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
