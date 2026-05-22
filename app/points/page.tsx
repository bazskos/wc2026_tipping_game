"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, Flame, ChevronLeft, ChevronRight } from "lucide-react";

type Prediction = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  predictedHome: number;
  predictedAway: number;
  points: number;
  stage?: string;
  group?: string;
  finished?: boolean;
};

type UserData = {
  id: string;
  username: string;
  avatar?: string;
  points: number;
  streak: number;
  perfect: number;
  predictions: Prediction[];
};

export default function PointsPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/my-points");
        const data = await res.json();

        const usersData = data.users || [];

        const enriched = usersData.map((u: UserData) => ({
          ...u,
          perfect: u.predictions?.filter((p) => p.points === 3).length || 0,
        }));

        setUsers(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedUser = users[selectedIndex];

  const groupedMatches = useMemo(() => {
    if (!selectedUser?.predictions) return {};

    return selectedUser.predictions.reduce(
      (acc: Record<string, Prediction[]>, match) => {
        const key =
          match.stage === "GROUP"
            ? `Group ${match.group || "?"}`
            : match.stage || "Other";

        if (!acc[key]) acc[key] = [];
        acc[key].push(match);

        return acc;
      },
      {},
    );
  }, [selectedUser]);

  const nextProfile = () => {
    setSelectedIndex((prev) => (prev === users.length - 1 ? 0 : prev + 1));
  };

  const prevProfile = () => {
    setSelectedIndex((prev) => (prev === 0 ? users.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="animate-pulse text-xl font-bold">Loading points...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight">MY POINTS</h1>

          <p className="text-white/50 mt-2">World Cup 2026 Prediction Center</p>
        </div>

        {/* PROFILE SLIDER */}
        <div className="relative mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Players</h2>

            <div className="flex gap-2">
              <button
                onClick={prevProfile}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={nextProfile}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {users.map((user, index) => {
              const active = index === selectedIndex;

              return (
                <motion.button
                  key={user.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedIndex(index)}
                  className={`
                    min-w-[260px]
                    rounded-3xl
                    border
                    p-5
                    text-left
                    transition-all
                    snap-center
                    backdrop-blur-xl
                    ${
                      active
                        ? "border-blue-500 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.25)]"
                        : "border-white/10 bg-white/[0.03]"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.username}
                      className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                    />

                    <div>
                      <h3 className="font-bold text-lg">{user.username}</h3>

                      <p className="text-white/50 text-sm">
                        {user.points} total points
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-between text-sm">
                    <div>
                      <p className="text-white/40">Perfect</p>
                      <p className="font-bold">{user.perfect}</p>
                    </div>

                    <div>
                      <p className="text-white/40">Streak</p>
                      <p className="font-bold">{user.streak}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* STATS */}
        <AnimatePresence mode="wait">
          {selectedUser && (
            <motion.div
              key={selectedUser.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                <StatCard
                  icon={<Trophy size={24} />}
                  label="Total Points"
                  value={selectedUser.points}
                />

                <StatCard
                  icon={<Target size={24} />}
                  label="Perfect Tips"
                  value={selectedUser.perfect}
                />

                <StatCard
                  icon={<Flame size={24} />}
                  label="Current Streak"
                  value={selectedUser.streak}
                />
              </div>

              {/* MATCH HISTORY */}
              <div>
                <h2 className="text-2xl font-black mb-6">Match History</h2>

                <div className="space-y-10">
                  {Object.entries(groupedMatches).map(
                    ([groupName, matches]) => (
                      <div key={groupName}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />

                          <h3 className="text-lg font-bold text-white/80">
                            {groupName}
                          </h3>
                        </div>

                        <div className="grid gap-4">
                          {matches.map((match) => {
                            const perfect = match.points === 3;
                            const success = match.points > 0 && !perfect;

                            return (
                              <motion.div
                                key={match.id}
                                whileHover={{ y: -2 }}
                                className={`
                                  rounded-3xl
                                  border
                                  p-5
                                  backdrop-blur-xl
                                  transition-all
                                  ${
                                    perfect
                                      ? "border-green-500/40 bg-green-500/10 shadow-[0_0_25px_rgba(34,197,94,0.15)]"
                                      : success
                                        ? "border-blue-500/40 bg-blue-500/10 shadow-[0_0_25px_rgba(59,130,246,0.15)]"
                                        : "border-red-500/20 bg-red-500/[0.05]"
                                  }
                                `}
                              >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                  <div>
                                    <h4 className="font-bold text-lg">
                                      {match.homeTeam} vs {match.awayTeam}
                                    </h4>

                                    <p className="text-white/50 text-sm mt-1">
                                      Tipped: {match.predictedHome}:
                                      {match.predictedAway}
                                    </p>

                                    {match.finished && (
                                      <p className="text-white/50 text-sm">
                                        Final: {match.homeScore}:
                                        {match.awayScore}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`
                                        px-4 py-2 rounded-2xl font-bold
                                        ${
                                          perfect
                                            ? "bg-green-500/20 text-green-300"
                                            : success
                                              ? "bg-blue-500/20 text-blue-300"
                                              : "bg-red-500/20 text-red-300"
                                        }
                                      `}
                                    >
                                      +{match.points}
                                    </div>

                                    {perfect && (
                                      <div className="text-green-400 text-sm font-semibold">
                                        PERFECT
                                      </div>
                                    )}

                                    {success && (
                                      <div className="text-blue-400 text-sm font-semibold">
                                        CORRECT
                                      </div>
                                    )}

                                    {match.points === 0 && (
                                      <div className="text-red-400 text-sm font-semibold">
                                        MISS
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/[0.03]
        p-6
        backdrop-blur-xl
        shadow-[0_0_30px_rgba(255,255,255,0.03)]
      "
    >
      <div className="flex items-center justify-between">
        <div className="text-blue-400">{icon}</div>

        <div className="text-right">
          <p className="text-white/40 text-sm">{label}</p>

          <h3 className="text-4xl font-black mt-1">{value}</h3>
        </div>
      </div>
    </motion.div>
  );
}
