"use client";

import { useState } from "react";

const commonFlags = [
  { name: "Algéria", code: "dz" },
  { name: "Anglia", code: "gb-eng" },
  { name: "Argentína", code: "ar" },
  { name: "Ausztrália", code: "au" },
  { name: "Ausztria", code: "at" },
  { name: "Belgium", code: "be" },
  { name: "Bosznia", code: "ba" },
  { name: "Brazília", code: "br" },
  { name: "Chile", code: "cl" },
  { name: "Curaçao", code: "cw" },
  { name: "Csehország", code: "cz" },
  { name: "Dánia", code: "dk" },
  { name: "Dél-Afrika", code: "za" },
  { name: "Dél-Korea", code: "kr" },
  { name: "Ecuador", code: "ec" },
  { name: "Franciaország", code: "fr" },
  { name: "Hollandia", code: "nl" },
  { name: "Horvátország", code: "hr" },
  { name: "Japán", code: "jp" },
  { name: "Kanada", code: "ca" },
  { name: "Kolumbia", code: "co" },
  { name: "Németország", code: "de" },
  { name: "Olaszország", code: "it" },
  { name: "Portugália", code: "pt" },
  { name: "Spanyolország", code: "es" },
  { name: "Svájc", code: "ch" },
  { name: "Szenegál", code: "sn" },
  { name: "USA", code: "us" },
  { name: "Uruguay", code: "uy" },
].sort((a, b) => a.name.localeCompare(b.name));

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [log, setLog] = useState<string>("Waiting for command...");
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  const [scores, setScores] = useState<
    Record<
      string,
      {
        home: string;
        away: string;
        homePenalty?: string;
        awayPenalty?: string;
        statusShort?: string;
        homeAet?: string;
        awayAet?: string;
      }
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
        headers: { Authorization: `Bearer ${secret}` },
      });
      const text = await response.text();
      setLog(response.ok ? `✅ SIKER:\n${text}` : `❌ ERROR:\n${text}`);
    } catch (e: any) {
      setLog(`❌ HIBA:\n${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGodModeData = async () => {
    if (!secret) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/data", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const result = await response.json();
      if (response.ok) {
        setAdminData(result.data);
        setLog("✅ Dashboard betöltve!");
      }
    } catch (e: any) {
      setLog(`❌ HIBA:\n${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewMatch = async () => {
    if (!newMatch.homeTeam || !newMatch.awayTeam || !newMatch.kickoffAt) {
      setLog("❌ Töltsd ki a mezőket!");
      return;
    }
    setIsLoading(true);

    // IDŐZÓNA JAVÍTÁS:
    const localDate = new Date(newMatch.kickoffAt);
    const tzOffset = localDate.getTimezoneOffset() * 60000;
    const localIsoString = new Date(localDate.getTime() - tzOffset)
      .toISOString()
      .slice(0, -1);

    try {
      const response = await fetch("/api/admin/add-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ ...newMatch, kickoffAt: localIsoString }),
      });
      if (response.ok) {
        setLog(`✅ Meccs hozzáadva!`);
        fetchGodModeData();
      }
    } catch (e: any) {
      setLog(`❌ HIBA:\n${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMatchResult = async (
    matchId: string,
    homeScore: string,
    awayScore: string,
    homeScoreAet?: string,
    awayScoreAet?: string,
    homePenalty?: string,
    awayPenalty?: string,
    statusShort?: string,
  ) => {
    if (!homeScore || !awayScore) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/update-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
          matchId,
          homeScore,
          awayScore,
          homeScoreAet,
          awayScoreAet,
          homePenalty,
          awayPenalty,
          statusShort,
        }),
      });
      if (response.ok) {
        setLog(`✅ Elmentve!`);
        fetchGodModeData();
      }
    } catch (e: any) {
      setLog(`❌ HIBA:\n${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!adminData) {
    return (
      <div className="min-h-screen pt-32 px-4 max-w-md mx-auto text-center font-sans">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Secret Password..."
          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-center text-white mb-4"
        />
        <button
          onClick={fetchGodModeData}
          className="w-full bg-red-600 text-white font-bold py-4 rounded-xl cursor-pointer hover:bg-red-500"
        >
          Unlock Dashboard
        </button>
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
        {/* ÚJ MECCS HOZZÁADÁSA */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-white uppercase mb-4 font-bold flex justify-between items-center">
            <span>➕ Új Meccs</span>
            <button
              onClick={() => setIsFlagHelperOpen(!isFlagHelperOpen)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-white/5 cursor-pointer"
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
              placeholder="Hazai"
              value={newMatch.homeTeam}
              onChange={(e) =>
                setNewMatch({ ...newMatch, homeTeam: e.target.value })
              }
              className="bg-black/50 border border-white/10 p-2 rounded text-white"
            />
            <input
              type="text"
              placeholder="Vendég"
              value={newMatch.awayTeam}
              onChange={(e) =>
                setNewMatch({ ...newMatch, awayTeam: e.target.value })
              }
              className="bg-black/50 border border-white/10 p-2 rounded text-white"
            />
            <input
              type="datetime-local"
              value={newMatch.kickoffAt}
              onChange={(e) =>
                setNewMatch({ ...newMatch, kickoffAt: e.target.value })
              }
              className="bg-black/50 border border-white/10 p-2 rounded text-white [color-scheme:dark]"
            />
            <input
              type="text"
              placeholder="Hazai Kód (pl. br)"
              value={newMatch.homeCode}
              onChange={(e) =>
                setNewMatch({ ...newMatch, homeCode: e.target.value })
              }
              className="bg-black/50 border border-white/10 p-2 rounded text-white"
            />
            <input
              type="text"
              placeholder="Vendég Kód (pl. fr)"
              value={newMatch.awayCode}
              onChange={(e) =>
                setNewMatch({ ...newMatch, awayCode: e.target.value })
              }
              className="bg-black/50 border border-white/10 p-2 rounded text-white"
            />
            <input
              type="text"
              placeholder="Csoport (pl. Group A)"
              value={newMatch.groupName}
              onChange={(e) =>
                setNewMatch({ ...newMatch, groupName: e.target.value })
              }
              className="bg-black/50 border border-white/10 p-2 rounded text-white"
            />

            <select
              value={newMatch.stage}
              onChange={(e) =>
                setNewMatch({ ...newMatch, stage: e.target.value })
              }
              className="bg-black/50 border border-white/10 p-2 rounded text-white md:col-span-3 cursor-pointer"
            >
              <option value="Group Stage">Group Stage</option>
              <option value="Round of 32">Round of 32</option>
              <option value="Round of 16">Round of 16</option>
              <option value="Quarter-finals">Quarter-finals</option>
              <option value="Semi-finals">Semi-finals</option>
              <option value="Final">Final</option>
            </select>
          </div>
          <button
            onClick={handleAddNewMatch}
            className="w-full bg-blue-600 text-white p-3 rounded font-bold cursor-pointer hover:bg-blue-500"
          >
            Meccs Mentése
          </button>
        </div>

        {/* GOMBOK */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => triggerCron("calculate-points")}
            className="flex-1 bg-green-600/20 hover:bg-green-600/30 transition-colors text-green-400 border border-green-500/50 p-4 rounded font-bold cursor-pointer"
          >
            📊 Pontok Számítása
          </button>
        </div>

        {/* MECCSEK LISTÁJA */}
        <div className="space-y-6">
          {sortedMatches.map((match: any) => {
            const currentHome =
              scores[match.id]?.home ??
              (match.home_score !== null ? match.home_score.toString() : "");
            const currentAway =
              scores[match.id]?.away ??
              (match.away_score !== null ? match.away_score.toString() : "");
            const currentStatusShort =
              scores[match.id]?.statusShort ??
              (match.status_short && match.status_short !== "NS"
                ? match.status_short
                : "FT");
            const currentHomeAet =
              scores[match.id]?.homeAet ??
              (match.home_score_aet !== null
                ? match.home_score_aet?.toString()
                : "");
            const currentAwayAet =
              scores[match.id]?.awayAet ??
              (match.away_score_aet !== null
                ? match.away_score_aet?.toString()
                : "");
            const currentHomePen =
              scores[match.id]?.homePenalty ??
              (match.home_penalty !== null
                ? match.home_penalty?.toString()
                : "");
            const currentAwayPen =
              scores[match.id]?.awayPenalty ??
              (match.away_penalty !== null
                ? match.away_penalty?.toString()
                : "");

            return (
              <div
                key={match.id}
                className="bg-black/30 border border-white/10 p-5 rounded-xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-white font-bold text-lg">
                      {match.home_team} vs {match.away_team}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-1">
                      {new Date(match.kickoff_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      • <span className="text-blue-400">{match.stage}</span>
                    </div>
                  </div>

                  {/* BEVITELI MEZŐK */}
                  <div className="flex gap-4 items-center bg-slate-900 p-2 rounded">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-6">90':</span>
                        <input
                          type="number"
                          value={currentHome}
                          onChange={(e) =>
                            setScores({
                              ...scores,
                              [match.id]: {
                                ...scores[match.id],
                                home: e.target.value,
                              },
                            })
                          }
                          className="w-10 bg-black border border-white/10 text-center text-white"
                        />
                        <input
                          type="number"
                          value={currentAway}
                          onChange={(e) =>
                            setScores({
                              ...scores,
                              [match.id]: {
                                ...scores[match.id],
                                away: e.target.value,
                              },
                            })
                          }
                          className="w-10 bg-black border border-white/10 text-center text-white"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={currentStatusShort}
                          onChange={(e) =>
                            setScores({
                              ...scores,
                              [match.id]: {
                                ...scores[match.id],
                                statusShort: e.target.value,
                              },
                            })
                          }
                          className="bg-black text-xs text-white p-1 cursor-pointer"
                        >
                          <option value="FT">Rendes (FT)</option>
                          <option value="AET">Hosszabítás (AET)</option>
                          <option value="PEN">Tizenegyes (PEN)</option>
                        </select>
                      </div>

                      {(currentStatusShort === "AET" ||
                        currentStatusShort === "PEN") && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-blue-400 w-6">
                            AET:
                          </span>
                          <input
                            type="number"
                            value={currentHomeAet}
                            onChange={(e) =>
                              setScores({
                                ...scores,
                                [match.id]: {
                                  ...scores[match.id],
                                  homeAet: e.target.value,
                                },
                              })
                            }
                            className="w-8 bg-black border border-blue-500/30 text-center text-blue-400 text-xs"
                          />
                          <input
                            type="number"
                            value={currentAwayAet}
                            onChange={(e) =>
                              setScores({
                                ...scores,
                                [match.id]: {
                                  ...scores[match.id],
                                  awayAet: e.target.value,
                                },
                              })
                            }
                            className="w-8 bg-black border border-blue-500/30 text-center text-blue-400 text-xs"
                          />
                        </div>
                      )}

                      {currentStatusShort === "PEN" && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-yellow-500 w-6">
                            PEN:
                          </span>
                          <input
                            type="number"
                            value={currentHomePen}
                            onChange={(e) =>
                              setScores({
                                ...scores,
                                [match.id]: {
                                  ...scores[match.id],
                                  homePenalty: e.target.value,
                                },
                              })
                            }
                            className="w-8 bg-black border border-yellow-500/30 text-center text-yellow-500 text-xs"
                          />
                          <input
                            type="number"
                            value={currentAwayPen}
                            onChange={(e) =>
                              setScores({
                                ...scores,
                                [match.id]: {
                                  ...scores[match.id],
                                  awayPenalty: e.target.value,
                                },
                              })
                            }
                            className="w-8 bg-black border border-yellow-500/30 text-center text-yellow-500 text-xs"
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
                          currentHomeAet,
                          currentAwayAet,
                          currentHomePen,
                          currentAwayPen,
                          currentStatusShort,
                        )
                      }
                      className="bg-red-600 hover:bg-red-500 transition-colors text-white font-bold p-3 rounded cursor-pointer"
                    >
                      Mentés
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
