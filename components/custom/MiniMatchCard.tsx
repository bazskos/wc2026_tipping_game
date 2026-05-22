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

  const isMatchStarted = match.status === "live" || match.status === "finished";
  const [isLockedByTime, setIsLockedByTime] = useState(false);
  const isLocked = isMatchStarted || isLockedByTime;

  useEffect(() => {
    if (!match.kickoffAt || isMatchStarted) {
      setIsLockedByTime(isMatchStarted);
      return;
    }
    const target = new Date(match.kickoffAt).getTime();
    const updateTimer = () => {
      const diff = target - new Date().getTime();
      if (diff <= 3600000) {
        setIsLockedByTime(true);
        if (diff <= 0) setTimeLeft(null);
        else
          setTimeLeft({
            d: Math.floor(diff / 86400000),
            h: Math.floor((diff % 86400000) / 3600000),
            m: Math.floor((diff % 3600000) / 60000),
            s: Math.floor((diff % 60000) / 1000),
          });
      } else {
        setIsLockedByTime(false);
        setTimeLeft({
          d: Math.floor(diff / 86400000),
          h: Math.floor((diff % 86400000) / 3600000),
          m: Math.floor((diff % 3600000) / 60000),
          s: Math.floor((diff % 60000) / 1000),
        });
      }
    };
    updateTimer();
    const int = setInterval(updateTimer, 1000);
    return () => clearInterval(int);
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
    if (!homeScore || !awayScore || isLocked) return;
    setIsSubmitting(true);
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
      if (res.ok) {
        setMessage({ type: "success", text: "Tip locked!" });
        setHasPrediction(true);
        setIsEditing(false);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayHome =
    (match.statusShort === "AET" || match.statusShort === "PEN") &&
    match.homeScoreAet != null
      ? match.homeScoreAet
      : match.homeScore;
  const displayAway =
    (match.statusShort === "AET" || match.statusShort === "PEN") &&
    match.awayScoreAet != null
      ? match.awayScoreAet
      : match.awayScore;

  return (
    <div
      className={`bg-slate-950/50 rounded-2xl p-4 border flex flex-col gap-4 relative transition-all ${isLocked ? "border-white/5 opacity-90" : "border-white/10"}`}
    >
      <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
        <span>
          {match.date} • {match.time}
        </span>
        {match.group && (
          <span className="bg-white/5 px-2 py-0.5 rounded">{match.group}</span>
        )}
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 flex flex-col items-center">
          <img
            src={`https://flagcdn.com/w80/${match.homeTeam.code}.png`}
            className="w-10 h-7 rounded object-cover mb-2"
          />
          <span className="text-xs font-bold text-white text-center">
            {match.homeTeam.name}
          </span>
        </div>

        <div className="flex flex-col items-center">
          {isMatchStarted ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className="font-mono text-2xl font-black text-white">
                  {displayHome ?? 0}
                </div>
                <span className="text-slate-600 font-black">:</span>
                <div className="font-mono text-2xl font-black text-white">
                  {displayAway ?? 0}
                </div>
              </div>

              {/* PEN AND AET*/}
              {match.statusShort === "AET" && (
                <div className="text-[9px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full mt-1 border border-blue-500/20">
                  90': {match.homeScore}-{match.awayScore} (AET)
                </div>
              )}
              {match.statusShort === "PEN" && match.homePenalty != null && (
                <div className="text-[9px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full mt-1 border border-yellow-500/20">
                  PEN: {match.homePenalty}-{match.awayPenalty}
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="w-10 h-10 bg-slate-900 rounded text-center text-white font-bold"
                disabled={isLocked || isLoading}
              />
              <input
                type="number"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="w-10 h-10 bg-slate-900 rounded text-center text-white font-bold"
                disabled={isLocked || isLoading}
              />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center">
          <img
            src={`https://flagcdn.com/w80/${match.awayTeam.code}.png`}
            className="w-10 h-7 rounded object-cover mb-2"
          />
          <span className="text-xs font-bold text-white text-center">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      <div className="h-8">
        {!isMatchStarted && !isLoading && (
          <button
            onClick={handleSavePrediction}
            disabled={isLocked}
            className="w-full h-full bg-blue-600 text-white font-bold text-xs rounded uppercase"
          >
            {hasPrediction ? "Update Tip" : "Save Prediction"}
          </button>
        )}
      </div>
    </div>
  );
}
