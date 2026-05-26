"use client";

import { useState, useEffect, useMemo } from "react";
import { GroupBoard } from "@/components/custom/GroupBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MiniMatchCard } from "@/components/custom/MiniMatchCard";
import { Leaderboard } from "@/components/custom/Leaderboard";
import { motion } from "framer-motion";
import Link from "next/link";
import { KnockoutBracket } from "@/components/custom/KnockoutBracket";
import { createClient } from "@/lib/supabase/client";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const tabLabels: Record<string, string> = {
  groups: "Groups",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter Finals",
  sf: "Semi Finals",
  final: "⚽ Final",
};

export function DashboardClient() {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const target = new Date("2026-06-11T19:00:00Z").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("/api/matches");
        const result = await res.json();

        if (result.data) {
          const formattedMatches = result.data.map((m: any) => {
            const dateObj = new Date(m.kickoff_at);

            const realGroup = m.group_name;

            return {
              id: m.id,
              homeTeam: { name: m.home_team, code: m.home_code },
              awayTeam: { name: m.away_team, code: m.away_code },
              date: dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              time: dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              group: realGroup,
              stage: m.stage,
              status: m.status,
              statusShort: m.status_short,
              homeScore: m.home_score,
              awayScore: m.away_score,
              homeScoreAet: m.home_score_aet,
              awayScoreAet: m.away_score_aet,
              kickoffAt: m.kickoff_at,
              homePenalty: m.home_penalty,
              awayPenalty: m.away_penalty,
            };
          });
          setMatches(formattedMatches);

          const activityRes = await fetch("/api/activity");
          const activityResult = await activityRes.json();
          if (activityResult.data) {
            setActivities(activityResult.data);
          }
        }
      } catch (err) {
        console.error("Error while loading matches:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatches();

    const supabase = createClient();
    const channel = supabase
      .channel("matches-live-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches" },
        (payload) => {
          console.log(
            "A match has been updated in the background! Reloading...",
            payload,
          );
          fetchMatches();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const calculatedGroups = useMemo(() => {
    const groupsObj: Record<string, any> = {};

    matches.forEach((m) => {
      if (
        !m.group ||
        !m.group.toLowerCase().includes("group") ||
        m.stage !== "Group Stage"
      )
        return;

      if (!groupsObj[m.group]) {
        groupsObj[m.group] = { name: m.group, teams: {} };
      }

      const groupTeams = groupsObj[m.group].teams;

      if (!groupTeams[m.homeTeam.name]) {
        groupTeams[m.homeTeam.name] = {
          name: m.homeTeam.name,
          code: m.homeTeam.code,
          points: 0,
          gd: 0,
          gf: 0,
        };
      }
      if (!groupTeams[m.awayTeam.name]) {
        groupTeams[m.awayTeam.name] = {
          name: m.awayTeam.name,
          code: m.awayTeam.code,
          points: 0,
          gd: 0,
          gf: 0,
        };
      }

      if (
        m.status === "finished" &&
        m.homeScore !== null &&
        m.awayScore !== null
      ) {
        const ht = groupTeams[m.homeTeam.name];
        const at = groupTeams[m.awayTeam.name];

        ht.gf += m.homeScore;
        ht.gd += m.homeScore - m.awayScore;
        at.gf += m.awayScore;
        at.gd += m.awayScore - m.homeScore;

        if (m.homeScore > m.awayScore) ht.points += 3;
        else if (m.homeScore < m.awayScore) at.points += 3;
        else {
          ht.points += 1;
          at.points += 1;
        }
      }
    });

    return Object.values(groupsObj)
      .map((g: any) => ({
        name: g.name,
        teams: Object.values(g.teams).sort((a: any, b: any) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.gf - a.gf;
        }),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [matches]);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const tomorrowStr = tomorrow.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const todayMatches = matches.filter((m) => m.date === todayStr);
  const tomorrowMatches = matches.filter((m) => m.date === tomorrowStr);

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto relative z-10 p-4 md:p-8">
        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh] py-12 mb-12">
          <div className="flex flex-col items-start gap-6 animate-pulse w-full">
            <div className="w-64 h-8 bg-blue-500/10 border border-blue-500/20 rounded-full"></div>
            <div className="w-full max-w-xl h-28 bg-white/5 rounded-2xl"></div>
            <div className="w-3/4 max-w-lg h-12 bg-white/5 rounded-xl"></div>
            <div className="flex gap-4 mt-4">
              <div className="w-40 h-14 bg-white/5 rounded-full"></div>
              <div className="w-32 h-14 bg-white/5 rounded-full"></div>
            </div>
          </div>
          <div className="w-full max-w-md ml-auto h-[400px] bg-slate-900/60 border border-white/5 rounded-3xl animate-pulse"></div>
        </div>

        {}
        <div className="flex justify-center mb-16 animate-pulse">
          <div className="w-[90%] max-w-3xl h-14 bg-slate-900/60 rounded-full border border-white/5"></div>
        </div>

        {/* Match Center */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-16 animate-pulse">
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[380px] bg-slate-900/40 border border-white/5 rounded-3xl"></div>
            <div className="h-[380px] bg-slate-900/40 border border-white/5 rounded-3xl"></div>
          </div>
          <div className="xl:col-span-1 h-[380px] bg-slate-900/40 border border-white/5 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto relative z-10 p-4 md:p-8">
      <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh] py-12 mb-12 relative">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="flex flex-col items-start text-left"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Tournament Starts In
            </div>
            <div className="flex gap-2 text-sm font-mono font-bold text-slate-300">
              <div className="bg-white/5 px-2 py-1 rounded">{timeLeft.d}d</div>
              <div className="bg-white/5 px-2 py-1 rounded">
                {String(timeLeft.h).padStart(2, "0")}h
              </div>
              <div className="bg-white/5 px-2 py-1 rounded">
                {String(timeLeft.m).padStart(2, "0")}m
              </div>
              <div className="bg-white/5 px-2 py-1 rounded text-blue-400">
                {String(timeLeft.s).padStart(2, "0")}s
              </div>
            </div>
          </div>

          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1]">
            Predict{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Every Match.
            </span>
            <br />
            Compete With Friends.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-medium max-w-xl mb-10 leading-relaxed">
            Lock in your predictions, climb the real-time leaderboard, and prove
            your football knowledge in the most exclusive World Cup 2026 private
            league.
          </p>

          <div className="flex flex-wrap gap-6 items-center">
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="relative group overflow-hidden rounded-full p-[2px] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full animate-[spin_3s_linear_infinite] opacity-70 blur-[2px]"></span>
              <div className="relative bg-slate-950/80 backdrop-blur-sm px-8 py-4 rounded-full font-heading font-black text-lg uppercase tracking-widest text-white transition-all group-hover:bg-transparent">
                View Rules
              </div>
            </button>
            <Link
              href="/print"
              target="_blank"
              className="px-6 py-4 rounded-full font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors hover:bg-white/5 flex items-center gap-2 border border-transparent hover:border-white/10 cursor-pointer"
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                ></path>
              </svg>
              PDF Sip
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
          className="relative lg:ml-auto w-full max-w-md"
        >
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-heading text-white font-black text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>{" "}
              Live Predictions
            </h3>
            <div className="flex flex-col gap-4 text-left">
              {activities.length > 0 ? (
                activities.map((act, index) => {
                  const isFirst = index === 0;
                  const isSecond = index === 1;
                  return (
                    <div
                      key={act.id}
                      className={`flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 transition-all ${!isFirst && !isSecond ? "opacity-50" : isSecond ? "opacity-80" : ""}`}
                    >
                      {act.avatarUrl ? (
                        <img
                          src={act.avatarUrl}
                          alt={act.userName}
                          referrerPolicy="no-referrer"
                          className={`w-10 h-10 rounded-full object-cover border-2 shadow-sm ${isFirst ? "border-blue-500/50" : isSecond ? "border-orange-500/50" : "border-slate-500/30"}`}
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${isFirst ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : isSecond ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}
                        >
                          {act.initial}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">
                          {act.userName}{" "}
                          {act.isSecret ? "locked a tip" : "predicted"}{" "}
                          <span
                            className={`font-bold ${act.isSecret ? "text-slate-500" : "text-white"}`}
                          >
                            {act.homeScore} - {act.awayScore}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 font-bold uppercase">
                          {act.homeTeam} vs {act.awayTeam}
                        </p>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {act.timeAgo}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-6 text-sm text-slate-500 italic border border-dashed border-white/10 rounded-xl">
                  No predictions yet. Be the first one!
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </header>

      <Tabs defaultValue="groups" className="w-full flex flex-col items-center">
        {}
        <TabsList className="!h-auto grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap justify-center items-center gap-2 md:gap-3 bg-transparent md:bg-slate-900/60 md:backdrop-blur-xl md:border md:border-white/10 p-0 md:p-3 rounded-none md:rounded-full mb-12 md:mb-16 mx-auto w-full md:w-auto shadow-none md:shadow-2xl">
          {["groups", "r32", "r16", "qf", "sf", "final"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="w-full md:w-auto !h-auto rounded-xl md:rounded-full px-2 py-3 md:px-6 md:py-2.5 bg-slate-900/80 md:bg-transparent border border-white/10 md:border-transparent text-slate-400 font-bold text-[10px] sm:text-xs md:text-sm tracking-widest uppercase transition-all hover:bg-white/5 hover:text-slate-200 data-[state=active]:bg-blue-600/20 data-[state=active]:border-blue-500/50 data-[state=active]:text-white shadow-lg md:shadow-none cursor-pointer whitespace-nowrap"
            >
              {tabLabels[tab]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="groups" className="w-full mt-12 md:mt-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {}
            <div
              id="match-center"
              className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-16 text-left pt-4 md:pt-24 md:-mt-24"
            >
              <motion.div
                variants={itemVariants}
                className="xl:col-span-2 flex flex-col"
              >
                <h2 className="font-heading text-3xl font-black text-white uppercase tracking-wider mb-6">
                  Match Center
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  <div className="bg-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col h-full group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]"></div>
                    <h3 className="text-blue-400 font-black mb-6 uppercase text-sm tracking-widest flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>{" "}
                      Today's Matches
                    </h3>
                    <div className="flex-1 flex flex-col justify-center gap-2">
                      {todayMatches.length > 0 ? (
                        todayMatches.map((match) => (
                          <MiniMatchCard key={match.id} match={match} />
                        ))
                      ) : (
                        <div className="flex-1 flex items-center justify-center min-h-[120px] bg-white/5 border border-white/5 rounded-2xl">
                          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">
                            Today there are no matches
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-600"></div>
                    <h3 className="text-slate-400 font-black mb-6 uppercase text-sm tracking-widest">
                      Tomorrow
                    </h3>
                    <div className="flex-1 flex flex-col justify-center gap-2">
                      {tomorrowMatches.length > 0 ? (
                        tomorrowMatches.map((match) => (
                          <MiniMatchCard key={match.id} match={match} />
                        ))
                      ) : (
                        <div className="flex-1 flex items-center justify-center min-h-[120px] bg-white/5 border border-white/5 rounded-2xl">
                          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">
                            Tomorrow there are no matches
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="xl:col-span-1 flex flex-col mt-12 xl:mt-0"
              >
                <Leaderboard />
              </motion.div>
            </div>

            <motion.h2
              variants={itemVariants}
              className="font-heading text-3xl font-black text-white uppercase tracking-wider mb-6 text-left"
            >
              Group Standings
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
              {calculatedGroups.map((group, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <GroupBoard group={group as any} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="r32" className="w-full mt-8 md:mt-0">
          <KnockoutBracket
            matches={matches}
            stageNames={["Round of 32"]}
            title="Round of 32"
          />
        </TabsContent>
        <TabsContent value="r16" className="w-full mt-8 md:mt-0">
          <KnockoutBracket
            matches={matches}
            stageNames={["Round of 16"]}
            title="Round of 16"
          />
        </TabsContent>
        <TabsContent value="qf" className="w-full mt-8 md:mt-0">
          <KnockoutBracket
            matches={matches}
            stageNames={["Quarter-finals"]}
            title="Quarter Finals"
          />
        </TabsContent>
        <TabsContent value="sf" className="w-full mt-8 md:mt-0">
          <KnockoutBracket
            matches={matches}
            stageNames={["Semi-finals"]}
            title="Semi Finals"
          />
        </TabsContent>
        <TabsContent value="final" className="w-full mt-8 md:mt-0">
          <KnockoutBracket
            matches={matches}
            stageNames={["Final", "3rd Place Final"]}
            title="Final & 3rd Place"
          />
        </TabsContent>
      </Tabs>

      {isRulesModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setIsRulesModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-3xl w-full text-left shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsRulesModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg
                className="w-6 h-6"
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
            </button>
            <h2 className="font-heading text-2xl font-black text-white uppercase tracking-widest mb-6">
              Scoring Rules
            </h2>
            <p className="text-slate-400 font-medium mb-8 text-sm">
              You can place your bet on every completed match before the match.
              Points will be automatically credited after the result.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex gap-4">
                <span className="font-mono text-3xl font-black text-green-500">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-xs">
                    Perfect tip
                  </h4>
                  <p className="text-xs text-slate-500">
                    You guess the final result exactly (e.g. 2–1)
                  </p>
                </div>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex gap-4">
                <span className="font-mono text-3xl font-black text-blue-500">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-xs">
                    Right winner
                  </h4>
                  <p className="text-xs text-slate-500">
                    You guess who will win (or tie), but not the exact number
                  </p>
                </div>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex gap-4">
                <span className="font-mono text-3xl font-black text-slate-600">
                  0
                </span>
                <div>
                  <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-xs">
                    Bad guess
                  </h4>
                  <p className="text-xs text-slate-500">
                    Couldn't find the winner either
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
