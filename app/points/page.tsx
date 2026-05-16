"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

type HistoryItem = {
  id: string;
  home_score: number;
  away_score: number;
  points: number | null;
  matches: {
    id: number;
    home_team: string;
    away_team: string;
    home_code: string;
    away_code: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
  };
};

type ProfileStats = {
  points: number;
  perfect_tips: number;
  streak: number;
};

// --- ANIMATED COUNTING EFFECT ---
function Counter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return animation.stop;
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
}

export default function MyPointsPage() {
  const [stats, setStats] = useState<ProfileStats>({
    points: 0,
    perfect_tips: 0,
    streak: 0,
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMyPoints = async () => {
      try {
        const res = await fetch("/api/my-points");
        const result = await res.json();

        if (res.ok && isMounted) {
          setStats(result.profile);
          setHistory(result.predictions);
        }
      } catch (err) {
        console.error("Error while loading:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMyPoints();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-bold tracking-widest uppercase text-sm animate-pulse">
          Loading your data...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12 overflow-hidden">
      {}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs mb-8 group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            ←
          </span>{" "}
          Return to Dashboard
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-12"
      >
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
          My Points
        </h1>
        <p className="text-slate-400 font-medium">
          Keep track of your past performance and tips.
        </p>
      </motion.div>

      {/* --- ANIMATED STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl"
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            All Points
          </p>
          <p className="font-mono text-5xl font-black text-blue-500 mb-1">
            <Counter value={stats.points} />
          </p>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl text-left"
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Perfect Score
          </p>
          <p className="font-mono text-5xl font-black text-green-400 mb-3">
            <Counter value={stats.perfect_tips} />
          </p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((stats.perfect_tips / 10) * 100, 100)}%`,
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            ></motion.div>
          </div>
        </motion.div>

        {/* Current Series */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl"
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Current Series
          </p>
          <div className="flex items-center gap-3 mb-1">
            <span
              className={`text-3xl ${stats.streak >= 2 ? "animate-pulse grayscale-0" : "grayscale"}`}
            >
              🔥
            </span>
            <span className="font-mono text-5xl font-black text-white">
              <Counter value={stats.streak} />
            </span>
          </div>
        </motion.div>
      </div>

      {/* --- TIP HISTORY --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="text-xl font-black text-white uppercase tracking-widest border-b border-white/10 pb-4 mb-6">
          Tip history
        </h2>

        {history.length === 0 ? (
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">
              You have no submitted tips yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                key={item.id}
                className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all hover:border-white/10 hover:bg-slate-900/80"
              >
                {}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                      item.matches.status === "finished"
                        ? "bg-slate-800 text-slate-400"
                        : item.matches.status === "live"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {item.matches.status === "finished"
                      ? "Finished"
                      : item.matches.status === "live"
                        ? "Live"
                        : "Soon"}
                  </span>

                  {item.points !== null ? (
                    <div
                      className={`flex items-center gap-1 font-bold text-xs uppercase tracking-widest px-2 py-1 rounded-md ${
                        item.points === 3
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : item.points === 1
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-slate-800 text-slate-400 border border-white/5"
                      }`}
                    >
                      {item.points > 0 ? `+${item.points} Pont` : "0 Pont"}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      In Progress...
                    </span>
                  )}
                </div>

                {/* Result */}
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
                      <span className="text-slate-300">
                        {item.home_score}:{item.away_score}
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
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
