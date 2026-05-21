"use client";

import { useState } from "react";

const commonFlags = [
  { name: "Algéria", code: "dz" },
  { name: "Anglia", code: "gb-eng" },
  { name: "Argentína", code: "ar" },
  { name: "Ausztrália", code: "au" },
  { name: "Ausztria", code: "at" },
  { name: "Belgium", code: "be" },
  { name: "Bosznia-Hercegovina", code: "ba" },
  { name: "Brazília", code: "br" },
  { name: "Chile", code: "cl" },
  { name: "Curaçao", code: "cw" },
  { name: "Csehország", code: "cz" },
  { name: "Dánia", code: "dk" },
  { name: "Dél-Afrika", code: "za" },
  { name: "Dél-Korea", code: "kr" },
  { name: "Ecuador", code: "ec" },
  { name: "Egyiptom", code: "eg" },
  { name: "Elefántcsontpart", code: "ci" },
  { name: "Franciaország", code: "fr" },
  { name: "Ghána", code: "gh" },
  { name: "Haiti", code: "ht" },
  { name: "Hollandia", code: "nl" },
  { name: "Horvátország", code: "hr" },
  { name: "Irán", code: "ir" },
  { name: "Irak", code: "iq" },
  { name: "Jamaica", code: "jm" },
  { name: "Japán", code: "jp" },
  { name: "Kamerun", code: "cm" },
  { name: "Kanada", code: "ca" },
  { name: "Katar", code: "qa" },
  { name: "Kolumbia", code: "co" },
  { name: "Lengyelország", code: "pl" },
  { name: "Marokkó", code: "ma" },
  { name: "Mexikó", code: "mx" },
  { name: "Németország", code: "de" },
  { name: "Nigéria", code: "ng" },
  { name: "Norvégia", code: "no" },
  { name: "Olaszország", code: "it" },
  { name: "Panama", code: "pa" },
  { name: "Paraguay", code: "py" },
  { name: "Peru", code: "pe" },
  { name: "Portugália", code: "pt" },
  { name: "Skócia", code: "gb-sct" },
  { name: "Spanyolország", code: "es" },
  { name: "Svájc", code: "ch" },
  { name: "Svédország", code: "se" },
  { name: "Szaúd-Arábia", code: "sa" },
  { name: "Szenegál", code: "sn" },
  { name: "Szerbia", code: "rs" },
  { name: "Törökország", code: "tr" },
  { name: "Uruguay", code: "uy" },
  { name: "USA", code: "us" },
  { name: "Kongói DK", code: "cd" },
].sort((a, b) => a.name.localeCompare(b.name));

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [log, setLog] = useState<string>("Waiting for command...");
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  const [scores, setScores] = useState<
    Record<
      string,
      { home: string; away: string; homePenalty?: string; awayPenalty?: string }
    >
  >({});

  const [isFlagHelperOpen, setIsFlagHelperOpen] = useState(false);

  const [newMatch, setNewMatch] = useState({
    homeTeam: "",
    awayTeam: "",
    homeCode: "",
    awayCode: "",
    kickoffAt: "",
    groupName: "Group A",
    stage: "Group Stage",
  });

  const triggerCron = async (endpoint: string) => {
    if (!secret) return;
    setIsLoading(true);
    setLog(`⏳ ${endpoint} futtatása...`);

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
            ? `✅ SIKER:\n${JSON.stringify(data, null, 2)}`
            : `❌ ERROR:\n${JSON.stringify(data, null, 2)}`,
        );
      } catch (parseError) {
        setLog(`❌ SERVER ERROR:\n${text.substring(0, 300)}...`);
      }
    } catch (error: any) {
      setLog(`❌ CRITICAL ERROR:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGodModeData = async () => {
    if (!secret) {
      setLog("❌ HIBA! Írd be a jelszót!");
      return;
    }
    setIsLoading(true);
    setLog("⏳ Adatok betöltése...");

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
          setLog("✅ Dashboard sikeresen feloldva!");
        } else {
          setLog(`❌ ERROR:\n${JSON.stringify(result, null, 2)}`);
        }
      } catch (parseError) {
        setLog(`❌ SERVER ERROR:\n${text.substring(0, 300)}...`);
      }
    } catch (error: any) {
      setLog(`❌ CRITICAL ERROR:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewMatch = async () => {
    if (!newMatch.homeTeam || !newMatch.awayTeam || !newMatch.kickoffAt) {
      setLog("❌ Töltsd ki a csapatneveket és a kezdési időpontot!");
      return;
    }
    setIsLoading(true);
    setLog(`⏳ Új meccs hozzáadása...`);

    try {
      const response = await fetch("/api/admin/add-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify(newMatch),
      });

      const data = await response.json();
      if (response.ok) {
        setLog(`✅ Meccs sikeresen hozzáadva!`);
        setNewMatch({
          homeTeam: "",
          awayTeam: "",
          homeCode: "",
          awayCode: "",
          kickoffAt: "",
          groupName: "Group A",
          stage: "Group Stage",
        });
        fetchGodModeData();
      } else {
        setLog(`❌ Hozzáadási hiba:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setLog(`❌ CRITICAL ERROR:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMatchResult = async (
    matchId: string,
    homeScore: string,
    awayScore: string,
    homePenalty?: string,
    awayPenalty?: string,
  ) => {
    if (homeScore === "" || awayScore === "") {
      setLog("❌ Kérlek adj meg pontos végeredményt mindkét csapathoz!");
      return;
    }
    setIsLoading(true);
    setLog(`⏳ Eredmény mentése (${homeScore}-${awayScore})...`);

    try {
      const response = await fetch("/api/admin/update-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
          matchId,
          homeScore: parseInt(homeScore),
          awayScore: parseInt(awayScore),
          homePenalty: homePenalty,
          awayPenalty: awayPenalty,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setLog(
          `✅ Eredmény sikeresen elmentve!\nMost kattints a 'Calc Points' gombra a pontok kiosztásához.`,
        );
        fetchGodModeData();
      } else {
        setLog(`❌ Saving error:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setLog(`❌ CRITICAL ERROR:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!adminData) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-4 max-w-md mx-auto font-sans flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-3xl mb-6 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
          🔒
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2 text-center">
          Admin Access
        </h1>
        <p className="text-slate-500 text-sm mb-8 text-center">
          Enter CRON_SECRET to unlock dashboard
        </p>

        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Secret Password..."
          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-center text-white focus:outline-none focus:border-red-500/50 transition-colors font-mono mb-4"
        />
        <button
          onClick={fetchGodModeData}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.4)] uppercase tracking-widest text-sm"
        >
          {isLoading ? "Authenticating..." : "Unlock Dashboard"}
        </button>
        <p className="mt-8 text-xs text-red-400 font-mono text-center">{log}</p>
      </div>
    );
  }

  const sortedMatches = [...adminData.matches].sort(
    (a, b) =>
      new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime(),
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-5xl mx-auto font-sans text-left">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-2xl">
              👁️
            </div>
            <div>
              <h1 className="font-heading text-3xl font-black text-white uppercase tracking-widest">
                God Mode
              </h1>
              <p className="text-slate-400 text-sm">
                Manual Match Control & Automation
              </p>
            </div>
          </div>
          <button
            onClick={() => setAdminData(null)}
            className="text-xs text-slate-500 hover:text-white transition-colors border border-white/10 px-3 py-1 rounded-md"
          >
            Lock System
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 relative">
          <h2 className="font-heading text-lg text-white uppercase tracking-widest mb-4 flex justify-between items-center">
            <span>➕ Új Meccs Felvitele</span>
            <button
              onClick={() => setIsFlagHelperOpen(!isFlagHelperOpen)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-white/5"
            >
              🏳️ Zászlókód Súgó
            </button>
          </h2>

          {isFlagHelperOpen && (
            <div className="mb-6 bg-slate-950 rounded-xl p-4 border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-2">
              {commonFlags.map((flag) => (
                <div
                  key={flag.code}
                  className="flex justify-between items-center text-xs bg-white/5 px-2 py-1.5 rounded"
                >
                  <span className="text-slate-400 truncate">{flag.name}</span>
                  <span className="font-mono text-blue-400 font-bold">
                    {flag.code}
                  </span>
                </div>
              ))}
              <div className="col-span-full text-xs text-slate-500 italic mt-2">
                Ha nem tudod a kódot, hagyd üresen, vagy írj be egy kamu kódot
                (pl: "un"), és a FIFA logó jelenik meg.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Hazai Csapat (pl. Brazil)"
              value={newMatch.homeTeam}
              onChange={(e) =>
                setNewMatch({ ...newMatch, homeTeam: e.target.value })
              }
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
            />
            <input
              type="text"
              placeholder="Vendég Csapat (pl. France)"
              value={newMatch.awayTeam}
              onChange={(e) =>
                setNewMatch({ ...newMatch, awayTeam: e.target.value })
              }
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
            />
            <input
              type="datetime-local"
              value={newMatch.kickoffAt}
              onChange={(e) =>
                setNewMatch({ ...newMatch, kickoffAt: e.target.value })
              }
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm [color-scheme:dark]"
            />
            <input
              type="text"
              placeholder="Hazai Zászlókód (pl. br)"
              value={newMatch.homeCode}
              onChange={(e) =>
                setNewMatch({ ...newMatch, homeCode: e.target.value })
              }
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
            />
            <input
              type="text"
              placeholder="Vendég Zászlókód (pl. fr)"
              value={newMatch.awayCode}
              onChange={(e) =>
                setNewMatch({ ...newMatch, awayCode: e.target.value })
              }
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
            />
            <input
              type="text"
              placeholder="Csoport (pl. Group A vagy üres)"
              value={newMatch.groupName}
              onChange={(e) =>
                setNewMatch({ ...newMatch, groupName: e.target.value })
              }
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
            />
            <select
              value={newMatch.stage}
              onChange={(e) =>
                setNewMatch({ ...newMatch, stage: e.target.value })
              }
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm md:col-span-3"
            >
              <option value="Group Stage">Group Stage</option>
              <option value="Round of 32">Round of 32</option>
              <option value="Round of 16">Round of 16</option>
              <option value="Quarter-finals">Quarter-finals</option>
              <option value="Semi-finals">Semi-finals</option>
              <option value="3rd Place Final">3rd Place Final</option>
              <option value="Final">Final</option>
            </select>
          </div>

          <button
            onClick={handleAddNewMatch}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-lg mt-2"
          >
            Meccs Mentése Adatbázisba
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              disabled={true}
              className="bg-slate-800/50 border border-white/5 text-slate-600 font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-not-allowed"
            >
              <span className="text-2xl opacity-50">🔄</span>
              <span>1. Sync Matches (Disabled)</span>
              <span className="text-[10px] text-red-500/70 font-normal">
                API Deprecated - Manual Mode On
              </span>
            </button>
            <button
              onClick={() => triggerCron("calculate-points")}
              disabled={isLoading}
              className="bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 text-green-400 font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              <span className="text-2xl">📊</span>
              <span>2. Calc Points</span>
              <span className="text-[10px] text-green-400/70 font-normal">
                Futtasd eredmény beírás után!
              </span>
            </button>
            <button
              onClick={() => triggerCron("send-reminders")}
              disabled={isLoading}
              className="bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-400 font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-2xl">📧</span>
              <span>3. Send Reminders</span>
              <span className="text-[10px] text-purple-400/70 font-normal">
                Napi 1x email a lemaradóknak (de automatikus amúgy)
              </span>
            </button>
          </div>

          <div className="mb-8 space-y-6 text-left">
            <h2 className="font-heading text-xl text-white uppercase tracking-widest border-b border-white/10 pb-2 flex justify-between items-center">
              <span>Match Results & Predictions</span>
              <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                Total: {sortedMatches.length}
              </span>
            </h2>

            {sortedMatches.length === 0 ? (
              <p className="text-slate-500 italic">
                No matches loaded in database.
              </p>
            ) : (
              sortedMatches.map((match: any) => {
                const matchPredictions = adminData.predictions.filter(
                  (p: any) => p.match_id === match.id,
                );
                const tippedUserIds = matchPredictions.map(
                  (p: any) => p.user_id,
                );
                const missingUsers = adminData.profiles.filter(
                  (user: any) => !tippedUserIds.includes(user.id),
                );

                const currentHome =
                  scores[match.id]?.home !== undefined
                    ? scores[match.id].home
                    : match.home_score !== null
                      ? match.home_score.toString()
                      : "";
                const currentAway =
                  scores[match.id]?.away !== undefined
                    ? scores[match.id].away
                    : match.away_score !== null
                      ? match.away_score.toString()
                      : "";
                const currentHomePenalty =
                  scores[match.id]?.homePenalty !== undefined
                    ? scores[match.id].homePenalty
                    : match.home_penalty !== null &&
                        match.home_penalty !== undefined
                      ? match.home_penalty.toString()
                      : "";
                const currentAwayPenalty =
                  scores[match.id]?.awayPenalty !== undefined
                    ? scores[match.id].awayPenalty
                    : match.away_penalty !== null &&
                        match.away_penalty !== undefined
                      ? match.away_penalty.toString()
                      : "";

                const isFinished = match.status === "finished";

                return (
                  <div
                    key={match.id}
                    className={`bg-black/30 border rounded-2xl p-5 shadow-lg transition-all ${isFinished ? "border-green-500/30 opacity-90" : "border-white/10"}`}
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4 border-b border-white/5 pb-4">
                      <div>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block ${isFinished ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}
                        >
                          {isFinished ? "FINISHED (Javítható)" : match.status}
                        </span>
                        <p className="font-black text-xl text-white flex items-center gap-3">
                          {match.home_team}{" "}
                          <span className="text-slate-600 text-sm font-normal">
                            vs
                          </span>{" "}
                          {match.away_team}
                        </p>
                        <p className="text-xs font-mono text-slate-500 mt-1">
                          {new Date(match.kickoff_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div
                        className={`flex items-center gap-3 bg-white/5 p-2 rounded-xl border ${isFinished ? "border-green-500/20" : "border-white/10"}`}
                      >
                        <div className="flex flex-col gap-2">
                          {/* Rendes Játékidő */}
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={currentHome}
                              onChange={(e) =>
                                setScores({
                                  ...scores,
                                  [match.id]: {
                                    ...scores[match.id],
                                    home: e.target.value,
                                    away: currentAway,
                                  },
                                })
                              }
                              className="w-12 h-10 bg-black/50 border border-white/10 rounded-lg text-center text-white font-bold focus:border-red-500 outline-none"
                              placeholder="0"
                            />
                            <span className="text-slate-500">:</span>
                            <input
                              type="number"
                              min="0"
                              value={currentAway}
                              onChange={(e) =>
                                setScores({
                                  ...scores,
                                  [match.id]: {
                                    ...scores[match.id],
                                    home: currentHome,
                                    away: e.target.value,
                                  },
                                })
                              }
                              className="w-12 h-10 bg-black/50 border border-white/10 rounded-lg text-center text-white font-bold focus:border-red-500 outline-none"
                              placeholder="0"
                            />
                          </div>

                          {match.stage !== "Group Stage" && (
                            <div className="flex items-center gap-2 justify-center">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                Pen:
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={currentHomePenalty}
                                onChange={(e) =>
                                  setScores({
                                    ...scores,
                                    [match.id]: {
                                      ...scores[match.id],
                                      homePenalty: e.target.value,
                                    },
                                  })
                                }
                                className="w-8 h-6 bg-yellow-500/10 border border-yellow-500/20 rounded text-center text-yellow-500 font-bold text-xs focus:border-yellow-500 outline-none"
                                placeholder="-"
                              />
                              <span className="text-slate-600 text-xs">-</span>
                              <input
                                type="number"
                                min="0"
                                value={currentAwayPenalty}
                                onChange={(e) =>
                                  setScores({
                                    ...scores,
                                    [match.id]: {
                                      ...scores[match.id],
                                      awayPenalty: e.target.value,
                                    },
                                  })
                                }
                                className="w-8 h-6 bg-yellow-500/10 border border-yellow-500/20 rounded text-center text-yellow-500 font-bold text-xs focus:border-yellow-500 outline-none"
                                placeholder="-"
                              />
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            saveMatchResult(
                              match.id,
                              currentHome,
                              currentAway,
                              currentHomePenalty,
                              currentAwayPenalty,
                            )
                          }
                          disabled={isLoading}
                          className={`${isFinished ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"} text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg cursor-pointer h-full`}
                        >
                          {isFinished ? "Frissítés" : "Save Result"}
                        </button>
                        <button
                          onClick={() =>
                            saveMatchResult(match.id, currentHome, currentAway)
                          }
                          disabled={isLoading}
                          className={`${isFinished ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"} text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg cursor-pointer`}
                        >
                          {isFinished ? "Frissítés" : "Save Result"}
                        </button>
                      </div>
                    </div>

                    {/* PREDICTIONS & MISSING USERS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/10">
                        <p className="text-xs text-green-400 font-bold uppercase mb-3 border-b border-green-500/10 pb-2">
                          Predictions ({matchPredictions.length})
                        </p>
                        <div className="space-y-2">
                          {matchPredictions.length > 0 ? (
                            matchPredictions.map((pred: any) => {
                              const user = adminData.profiles.find(
                                (p: any) => p.id === pred.user_id,
                              );
                              return (
                                <div
                                  key={pred.id}
                                  className="flex justify-between items-center text-sm bg-black/20 p-2 rounded-lg"
                                >
                                  <span className="text-slate-300 font-medium">
                                    {user?.name || "Unknown"}
                                  </span>
                                  <span className="font-black text-white bg-black/50 px-3 py-1 rounded shadow-inner">
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

                      <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10">
                        <p className="text-xs text-red-400 font-bold uppercase mb-3 border-b border-red-500/10 pb-2">
                          Missing Tips ({missingUsers.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {missingUsers.map((user: any) => (
                            <span
                              key={user.id}
                              className="text-xs bg-red-500/10 text-red-300 px-3 py-1.5 rounded-md font-medium border border-red-500/20"
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

          {/* LOG CONSOLE */}
          <div className="bg-black/80 rounded-xl p-4 border border-white/5 relative text-left shadow-inner">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-500/50 to-transparent"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              System Log
            </p>
            <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap break-words min-h-[80px]">
              {log}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
