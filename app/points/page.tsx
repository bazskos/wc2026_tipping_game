"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ───────────────────────────────────────────────────────────────────

type ResultType = "perfect" | "correct" | "wrong" | "pending";

function getResultType(prediction: any): ResultType {
  const match = prediction.matches;
  if (!match || match.status !== "FT") return "pending";

  const predHome = prediction.home_score;
  const predAway = prediction.away_score;
  const realHome = match.home_score;
  const realAway = match.away_score;

  if (predHome === realHome && predAway === realAway) return "perfect";

  const predOutcome =
    predHome > predAway ? "H" : predHome < predAway ? "A" : "D";
  const realOutcome =
    realHome > realAway ? "H" : realHome < realAway ? "A" : "D";

  return predOutcome === realOutcome ? "correct" : "wrong";
}

// Groups predictions by stage, preserving insertion order
function groupByStage(predictions: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  for (const pred of predictions) {
    const stage = pred.matches?.stage ?? "Egyéb";
    if (!groups[stage]) groups[stage] = [];
    groups[stage].push(pred);
  }
  return groups;
}

function formatKickoff(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" }),
  };
}

const RANK_COLORS = ["#FACC15", "#94A3B8", "#CD7F32"];

// ─── Sub-components ─────────────────────────────────────────────────────────────

function ProfileCard({
  profile,
  rank,
  isSelected,
  onClick,
}: {
  profile: any;
  rank: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`relative flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
        isSelected
          ? "bg-blue-950/70 border-blue-500/40 shadow-[0_0_28px_rgba(59,130,246,0.18)]"
          : "bg-slate-900/40 border-white/5 hover:border-white/15 hover:bg-slate-800/40"
      }`}
    >
      {/* Rank badge */}
      <div
        className="absolute -top-2 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shadow-md"
        style={{
          background: rank <= 3 ? RANK_COLORS[rank - 1] : "#1e293b",
          color: rank <= 3 ? "#000" : "#64748b",
          border: rank > 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        {rank}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-black text-white">
            {profile.name?.charAt(0)?.toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="text-left min-w-[72px]">
        <div className="text-sm font-bold text-white leading-tight">
          {profile.name}
        </div>
        <div
          className={`text-xs font-mono font-bold mt-0.5 ${
            isSelected ? "text-blue-400" : "text-slate-500"
          }`}
        >
          {profile.points ?? 0} pt
        </div>
      </div>

      {/* Active underline */}
      {isSelected && (
        <motion.div
          layoutId="sliderUnderline"
          className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-blue-500 rounded-full"
        />
      )}
    </motion.button>
  );
}

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: string;
  value: string | number;
  label: string;
  accent?: string;
}) {
  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div
        className={`text-2xl font-black tabular-nums ${accent ?? "text-white"}`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">
        {label}
      </div>
    </div>
  );
}

function MatchHistoryCard({ item, index }: { item: any; index: number }) {
  const result = getResultType(item);
  const match = item.matches;
  const { date, time } = formatKickoff(match.kickoff_at);

  const accentColors: Record<ResultType, string> = {
    perfect: "bg-emerald-500",
    correct: "bg-blue-500",
    wrong: "bg-red-500/60",
    pending: "bg-slate-700",
  };

  const badgeStyles: Record<ResultType, string> = {
    perfect: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    correct: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    wrong: "bg-red-500/10 text-red-400 border border-red-500/20",
    pending: "bg-slate-800 text-slate-500 border border-white/5",
  };

  const resultLabel: Record<ResultType, string> = {
    perfect: "🎯",
    correct: "✓",
    wrong: "✗",
    pending: "–",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.25 }}
      className="group relative overflow-hidden bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-800/40 rounded-xl transition-all duration-200"
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${accentColors[result]}`}
      />

      <div className="pl-5 pr-4 py-3.5 flex items-center gap-4">
        {/* Date + Teams */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-slate-500 font-mono mb-1">
            {date} · {time}
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-white truncate">
              {match.home_team}
            </span>
            <span className="text-slate-600 text-xs">vs</span>
            <span className="text-sm font-bold text-white truncate">
              {match.away_team}
            </span>
          </div>
        </div>

        {/* Score comparison */}
        <div className="flex flex-col items-end gap-1 text-xs flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Tip:</span>
            <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
              {item.home_score}:{item.away_score}
            </span>
          </div>
          {match.home_score != null ? (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Finished:</span>
              <span className="font-mono font-bold text-white">
                {match.home_score}:{match.away_score}
              </span>
            </div>
          ) : (
            <span className="text-slate-600 text-[10px] italic">Pending</span>
          )}
        </div>

        {/* Points + result badge */}
        <div
          className={`flex-shrink-0 w-12 h-11 flex flex-col items-center justify-center rounded-xl text-xs font-black ${badgeStyles[result]}`}
        >
          <span className="text-base leading-none">
            {result !== "pending"
              ? `+${item.points ?? 0}`
              : resultLabel[result]}
          </span>
          {result !== "pending" && (
            <span className="text-[9px] opacity-60 mt-0.5 font-normal">
              {resultLabel[result]}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function MyPointsClientPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [allPredictions, setAllPredictions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setSelectedUserId(user.id);

      const { data: pData } = await supabase
        .from("profiles")
        .select("*")
        .order("points", { ascending: false });
      if (pData) setProfiles(pData);

      const { data: predData } = await supabase.from("predictions").select(`
          id, user_id, home_score, away_score, points,
          matches (
            id, home_team, away_team, kickoff_at,
            status, stage,
            home_score, away_score,
            status_short,
            home_score_aet, away_score_aet,
            home_penalty, away_penalty
          )
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

  // Accuracy stat
  const completed = filteredHistory.filter((p) => p.matches?.status === "FT");
  const nonWrong = completed.filter((p) => getResultType(p) !== "wrong");
  const accuracy =
    completed.length > 0
      ? Math.round((nonWrong.length / completed.length) * 100)
      : 0;

  const groupedHistory = groupByStage(filteredHistory);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm font-mono">Loading...</span>
        </div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-bold mb-8"
      >
        ← Back to Dashboard
      </Link>

      {/* ── PROFILE SLIDER ─────────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-xl">Ranglista</h2>
          <span className="text-slate-600 text-xs font-mono">
            {profiles.length} player
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
          {profiles.map((p, idx) => (
            <ProfileCard
              key={p.id}
              profile={p}
              rank={idx + 1}
              isSelected={selectedUserId === p.id}
              onClick={() => setSelectedUserId(p.id)}
            />
          ))}
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedUserId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="mb-10 space-y-3"
        >
          {/* Hero stat card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0d1b3e] via-[#0f172a] to-slate-900 border border-blue-500/20 rounded-2xl p-6 shadow-[0_0_48px_rgba(59,130,246,0.07)]">
            {/* Decorative glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/8 rounded-full -translate-y-24 translate-x-24 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-600/5 rounded-full translate-y-16 -translate-x-8 blur-2xl" />
            </div>

            <div className="relative z-10 flex items-end justify-between">
              <div>
                <div className="text-slate-500 text-[10px] uppercase tracking-[0.15em] font-bold mb-2">
                  All Points
                </div>
                <div className="text-6xl font-black text-white tabular-nums leading-none">
                  {selectedProfile?.points ?? 0}
                </div>
                <div className="text-slate-500 text-xs mt-2">
                  {selectedProfile?.name ?? ""}
                </div>
              </div>
              <div className="text-5xl opacity-80">🏆</div>
            </div>

            {/* Thin progress line (cosmetic) */}
            <div className="relative z-10 mt-5 h-px bg-white/5">
              <motion.div
                className="h-full bg-blue-500/40 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    100,
                    ((selectedProfile?.points ?? 0) /
                      Math.max(...profiles.map((p) => p.points ?? 1))) *
                      100,
                  )}%`,
                }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon="🎯"
              value={selectedProfile?.perfect_tips ?? 0}
              label="Perfect"
              accent="text-emerald-400"
            />
            <StatCard
              icon="🔥"
              value={selectedProfile?.streak ?? 0}
              label="Streak"
              accent="text-orange-400"
            />
            <StatCard
              icon="📊"
              value={`${accuracy}%`}
              label="Accuracy"
              accent="text-blue-400"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── MATCH HISTORY (grouped by stage) ───────────────────────────────── */}
      <div>
        <h2 className="text-white font-bold text-xl mb-6">Tip history</h2>

        {Object.keys(groupedHistory).length === 0 ? (
          <div className="text-center text-slate-600 py-16 text-sm">
            No tips yet
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedHistory).map(([stage, preds]) => (
              <div key={stage}>
                {/* Stage divider */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-1 bg-slate-800/70 border border-white/5 rounded-full">
                    {stage}
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="space-y-2">
                  {(preds as any[]).map((item, i) => (
                    <MatchHistoryCard key={item.id} item={item} index={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
