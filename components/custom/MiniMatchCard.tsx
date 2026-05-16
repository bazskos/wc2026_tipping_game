"use client";

import { useState, useEffect } from "react";

export function MiniMatchCard({ match }: { match: any }) {
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPrediction, setHasPrediction] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const isMatchStarted = match.status === "live" || match.status === "finished";
  const [isLockedByTime, setIsLockedByTime] = useState(false);
  const isLocked = isMatchStarted || isLockedByTime;

  useEffect(() => {
    if (!match.kickoffAt || isMatchStarted) {
      setIsLockedByTime(isMatchStarted);
      return;
    }

    const target = new Date(match.kickoffAt).getTime();
    const ONE_HOUR = 60 * 60 * 1000; // 1 óra milliszekundumban

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= ONE_HOUR) {
        setIsLockedByTime(true);
        if (diff <= 0) {
          setTimeLeft(null);
        } else {
          setTimeLeft({
            d: Math.floor(diff / (1000 * 60 * 60 * 24)),
            h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            s: Math.floor((diff % (1000 * 60)) / 1000),
          });
        }
      } else {
        setIsLockedByTime(false);
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [match.kickoffAt, isMatchStarted]);

  useEffect(() => {
    let isMounted = true;
    const fetchPrediction = async () => {
      try {
        const res = await fetch(`/api/predictions?matchId=${match.id}`);
        const result = await res.json();

        if (result.data && isMounted) {
          setHomeScore(result.data.home_score.toString());
          setAwayScore(result.data.away_score.toString());
          setHasPrediction(true);
        }
      } catch (err) {
        console.error("Error while fetching prediction:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchPrediction();
    return () => {
      isMounted = false;
    };
  }, [match.id]);

  const handleSavePrediction = async () => {
    if (homeScore === "" || awayScore === "") {
      setMessage({ type: "error", text: "Fill both scores!" });
      return;
    }
    if (isLocked) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          homeScore: parseInt(homeScore),
          awayScore: parseInt(awayScore),
        }),
      });

      if (!res.ok) {
        setMessage({ type: "error", text: "Error saving tip." });
      } else {
        setMessage({
          type: "success",
          text: isEditing ? "Tip updated! ✏️" : "Tip locked! 🔒",
        });
        setHasPrediction(true);
        setIsEditing(false);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`bg-slate-950/50 rounded-2xl p-4 border flex flex-col gap-4 relative overflow-hidden transition-all duration-300 ${
        hasPrediction && !isLocked && !isEditing
          ? "border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
          : isLocked
            ? "border-white/5 opacity-90 grayscale-[20%]"
            : "border-white/5 hover:border-white/10"
      }`}
    >
      {isLocked && !isMatchStarted && (
        <div className="absolute inset-0 z-20 backdrop-blur-[2px] bg-slate-950/40 flex flex-col items-center justify-center rounded-2xl pointer-events-none">
          <div className="bg-slate-900/90 border border-red-500/30 text-red-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Tips Locked
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 relative z-10">
        <div className="flex items-center gap-2">
          <span>
            {match.date} • {match.time}
          </span>
          {match.group && (
            <span className="bg-white/5 px-2 py-0.5 rounded-md">
              {match.group}
            </span>
          )}
        </div>

        {!isMatchStarted && timeLeft && (
          <span
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${isLocked ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-orange-400 bg-orange-500/10 border-orange-500/20"}`}
          >
            {!isLocked && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            )}
            {timeLeft.d > 0 ? `${timeLeft.d}d ` : ""}
            {String(timeLeft.h).padStart(2, "0")}:
            {String(timeLeft.m).padStart(2, "0")}:
            {String(timeLeft.s).padStart(2, "0")}
          </span>
        )}
      </div>

      <div
        className={`flex items-center justify-between gap-4 transition-opacity duration-500 relative z-10 ${isLoading ? "opacity-30" : "opacity-100"}`}
      >
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="relative w-10 h-7 rounded overflow-hidden shadow-md">
            {match.homeTeam.code !== "un" ? (
              <img
                src={`https://flagcdn.com/w80/${match.homeTeam.code}.png`}
                alt={match.homeTeam.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[8px] text-white">
                FIFA
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-white text-center line-clamp-1">
            {match.homeTeam.name}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          {isMatchStarted ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-12 flex items-center justify-center font-mono text-2xl font-black text-white">
                  {match.homeScore ?? 0}
                </div>
                <span
                  className={`font-black ${match.status === "live" ? "text-red-500 animate-pulse" : "text-slate-600"}`}
                >
                  :
                </span>
                <div className="w-10 h-12 flex items-center justify-center font-mono text-2xl font-black text-white">
                  {match.awayScore ?? 0}
                </div>
              </div>

              {(match.statusShort === "OT" || match.statusShort === "PEN") && (
                <div className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full mt-[-6px] border border-white/5 shadow-sm z-20">
                  {match.statusShort === "PEN" &&
                  match.homePenalty !== null &&
                  match.awayPenalty !== null
                    ? `${match.homePenalty} - ${match.awayPenalty} (PEN)`
                    : "(AET)"}
                </div>
              )}
            </div>
          ) : hasPrediction && !isEditing ? (
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <div className="font-mono text-2xl font-black text-slate-300">
                {homeScore}
              </div>
              <span className="text-slate-600 font-black">:</span>
              <div className="font-mono text-2xl font-black text-slate-300">
                {awayScore}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="20"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="w-10 h-12 bg-slate-900 border border-white/10 rounded-xl text-center font-mono text-xl font-black text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 disabled:opacity-50"
                placeholder="-"
                disabled={isLoading || isSubmitting || isLocked}
              />
              <span className="text-slate-600 font-black">:</span>
              <input
                type="number"
                min="0"
                max="20"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="w-10 h-12 bg-slate-900 border border-white/10 rounded-xl text-center font-mono text-xl font-black text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 disabled:opacity-50"
                placeholder="-"
                disabled={isLoading || isSubmitting || isLocked}
              />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="relative w-10 h-7 rounded overflow-hidden shadow-md">
            {match.awayTeam.code !== "un" ? (
              <img
                src={`https://flagcdn.com/w80/${match.awayTeam.code}.png`}
                alt={match.awayTeam.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[8px] text-white">
                FIFA
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-white text-center line-clamp-1">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      <div className="mt-2 h-9 relative z-10">
        {isLoading ? (
          <div className="h-full flex items-center justify-center rounded-xl bg-slate-900/50 border border-white/5">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          </div>
        ) : isMatchStarted ? (
          <div
            className={`h-full flex items-center justify-between px-3 rounded-xl border ${match.status === "live" ? "bg-red-500/10 border-red-500/20" : "bg-slate-900 border-white/5"}`}
          >
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${match.status === "live" ? "text-red-400 animate-pulse" : "text-slate-500"}`}
            >
              {match.status === "live" ? "LIVE" : "FT"}
            </span>
            {hasPrediction ? (
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-white/5">
                Tipped:{" "}
                <span className="font-black text-white ml-1">
                  {homeScore}:{awayScore}
                </span>
              </span>
            ) : (
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                No Tip
              </span>
            )}
          </div>
        ) : message ? (
          <div
            className={`h-full flex items-center justify-center rounded-xl text-[10px] font-black tracking-widest uppercase ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
          >
            {message.text}
          </div>
        ) : hasPrediction && !isEditing ? (
          <div className="h-full flex items-center justify-between gap-2">
            <div
              className={`flex-1 h-full flex items-center justify-center rounded-xl border text-[10px] font-black uppercase tracking-widest ${isLocked ? "bg-slate-800/50 border-slate-700 text-slate-500" : "bg-green-500/10 border-green-500/20 text-green-400"}`}
            >
              {isLocked ? "Locked 🔒" : "Tip Saved ✅"}
            </div>
            {!isLocked && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 h-full rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  ></path>
                </svg>
                Edit
              </button>
            )}
          </div>
        ) : (
          <div className="h-full flex gap-2">
            <button
              onClick={handleSavePrediction}
              disabled={isSubmitting || isLocked}
              className="flex-1 h-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : isEditing ? (
                "Update Tip"
              ) : (
                "Save Prediction"
              )}
            </button>
            {isEditing && !isLocked && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 h-full rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
