"use client";

import { useState } from "react";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [log, setLog] = useState<string>("Waiting for command...");
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  // Safe fetch for Cron jobs
  const triggerCron = async (endpoint: string) => {
    if (!secret) {
      setLog("❌ ERROR! Type in the secret admin password (CRON_SECRET)!");
      return;
    }
    setIsLoading(true);
    setLog(`⏳ ${endpoint} running...`);

    try {
      const response = await fetch(`/api/cron/${endpoint}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${secret}` },
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        setLog(
          response.ok
            ? `✅ SUCCESS:\n${JSON.stringify(data, null, 2)}`
            : `❌ ERROR:\n${JSON.stringify(data, null, 2)}`,
        );
      } catch (parseError) {
        setLog(
          `❌ SERVER ERROR (HTML returned instead of JSON):\n${text.substring(0, 300)}...`,
        );
      }
    } catch (error: any) {
      setLog(`❌ CRITICAL ERROR:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe fetch for God Mode Data
  const fetchGodModeData = async () => {
    if (!secret) {
      setLog("❌ ERROR! Type in the secret admin password (CRON_SECRET)!");
      return;
    }
    setIsLoading(true);
    setLog("⏳ Secret datas are being loaded...");

    try {
      const response = await fetch("/api/admin/data", {
        method: "GET",
        headers: { Authorization: `Bearer ${secret}` },
      });

      const text = await response.text();
      try {
        const result = JSON.parse(text);
        if (response.ok) {
          setAdminData(result.data);
          setLog("✅ Datas loaded successfully!");
        } else {
          setLog(`❌ ERROR:\n${JSON.stringify(result, null, 2)}`);
        }
      } catch (parseError) {
        setLog(
          `❌ SERVER ERROR (Possible 404 or 500 HTML page):\n${text.substring(0, 300)}...`,
        );
      }
    } catch (error: any) {
      setLog(`❌ CRITICAL ERROR:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-5xl mx-auto font-sans text-left">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-2xl">
            👁️
          </div>
          <div>
            <h1 className="font-heading text-3xl font-black text-white uppercase tracking-widest">
              God Mode Dashboard
            </h1>
            <p className="text-slate-400 text-sm">Only for admins!</p>
          </div>
        </div>

        <div className="mb-8 flex gap-4">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Secret Admin Password (CRON_SECRET)..."
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors font-mono"
          />
          <button
            onClick={fetchGodModeData}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            <span>Let's see everything!</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => triggerCron("sync-matches")}
            disabled={isLoading}
            className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">🔄</span>
            <span>1. Sync Matches</span>
          </button>
          <button
            onClick={() => triggerCron("calculate-points")}
            disabled={isLoading}
            className="bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-400 font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">📊</span>
            <span>2. Calc Points</span>
          </button>
          <button
            onClick={() => triggerCron("send-reminders")}
            disabled={isLoading}
            className="bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-400 font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">📧</span>
            <span>3. Send Reminders</span>
          </button>
        </div>

        {adminData && (
          <div className="mb-8 space-y-6 text-left">
            <h2 className="font-heading text-xl text-white uppercase tracking-widest border-b border-white/10 pb-2">
              Upcoming matches & Predictions
            </h2>
            {adminData.matches.length === 0 ? (
              <p className="text-slate-500 italic">No upcoming matches.</p>
            ) : (
              adminData.matches.map((match: any) => {
                const matchPredictions = adminData.predictions.filter(
                  (p: any) => p.match_id === match.id,
                );
                const tippedUserIds = matchPredictions.map(
                  (p: any) => p.user_id,
                );
                const missingUsers = adminData.profiles.filter(
                  (user: any) => !tippedUserIds.includes(user.id),
                );

                return (
                  <div
                    key={match.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <p className="font-bold text-lg text-white">
                        {match.home_team}{" "}
                        <span className="text-slate-500 mx-2">vs</span>{" "}
                        {match.away_team}
                      </p>
                      <span className="text-xs font-mono text-slate-400 bg-black/50 px-2 py-1 rounded">
                        {new Date(match.kickoff_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/10">
                        <p className="text-xs text-green-400 font-bold uppercase mb-2">
                          Predictions ({matchPredictions.length})
                        </p>
                        <div className="space-y-1">
                          {matchPredictions.length > 0 ? (
                            matchPredictions.map((pred: any) => {
                              const user = adminData.profiles.find(
                                (p: any) => p.id === pred.user_id,
                              );
                              return (
                                <div
                                  key={pred.id}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-slate-300">
                                    {user?.name || "Unknown"}
                                  </span>
                                  <span className="font-mono text-white bg-black/30 px-2 rounded">
                                    {pred.home_score} - {pred.away_score}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-slate-600 text-xs italic">
                              No predictions yet.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                        <p className="text-xs text-red-400 font-bold uppercase mb-2">
                          NOT TIPPED YET ({missingUsers.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {missingUsers.map((user: any) => (
                            <span
                              key={user.id}
                              className="text-xs bg-red-500/10 text-red-300 px-2 py-1 rounded-md"
                            >
                              {user.name?.split(" ")[0] || "User"}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* LOG CONSOLE */}
        <div className="bg-black/60 rounded-xl p-4 border border-white/5 relative text-left">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-500/50 to-transparent"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Server Response (Console)
          </p>
          <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap break-words min-h-[100px]">
            {log}
          </pre>
        </div>
      </div>
    </div>
  );
}
