"use client";

import { useState } from "react";

const commonFlags = [
  { name: "Algéria", code: "dz" },
  { name: "Anglia", code: "gb-eng" },
  { name: "Argentína", code: "ar" },
  { name: "Ausztrália", code: "au" },
  { name: "Ausztria", code: "at" },
  { name: "Belgium", code: "be" },
  { name: "Bolívia", code: "bo" },
  { name: "Bosznia", code: "ba" },
  { name: "Brazília", code: "br" },
  { name: "Chile", code: "cl" },
  { name: "Costa Rica", code: "cr" },
  { name: "Curaçao", code: "cw" },
  { name: "Csehország", code: "cz" },
  { name: "Dánia", code: "dk" },
  { name: "Dél-Afrika", code: "za" },
  { name: "Dél-Korea", code: "kr" },
  { name: "Ecuador", code: "ec" },
  { name: "Egyiptom", code: "eg" },
  { name: "Elefántcsontpart", code: "ci" },
  { name: "Finnország", code: "fi" },
  { name: "Franciaország", code: "fr" },
  { name: "Ghána", code: "gh" },
  { name: "Görögország", code: "gr" },
  { name: "Hollandia", code: "nl" },
  { name: "Horvátország", code: "hr" },
  { name: "Irán", code: "ir" },
  { name: "Írország", code: "ie" },
  { name: "Izland", code: "is" },
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
  { name: "Paraguay", code: "py" },
  { name: "Peru", code: "pe" },
  { name: "Portugália", code: "pt" },
  { name: "Románia", code: "ro" },
  { name: "Sábia", code: "sa" },
  { name: "Skócia", code: "gb-sct" },
  { name: "Spanyolország", code: "es" },
  { name: "Svájc", code: "ch" },
  { name: "Svédország", code: "se" },
  { name: "Szenegál", code: "sn" },
  { name: "Szerbia", code: "rs" },
  { name: "Szlovákia", code: "sk" },
  { name: "Tunézia", code: "tn" },
  { name: "Törökország", code: "tr" },
  { name: "Ukrajna", code: "ua" },
  { name: "USA", code: "us" },
  { name: "Uruguay", code: "uy" },
  { name: "Új-Zéland", code: "nz" },
  { name: "Wales", code: "gb-wls" },
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

  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});

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

    // DIRECT CONVERSION:
    const date = new Date(newMatch.kickoffAt);
    const isoDate = date.toISOString(); // This automatically converts to UTC

    try {
      const response = await fetch("/api/admin/add-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ ...newMatch, kickoffAt: isoDate }),
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

  const openEdit = (match: any) => {
    const d = new Date(match.kickoff_at);
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setEditData((prev) => ({
      ...prev,
      [match.id]: {
        homeTeam: match.home_team ?? "",
        awayTeam: match.away_team ?? "",
        homeCode: match.home_code ?? "",
        awayCode: match.away_code ?? "",
        kickoffAt: localIso,
        stage: match.stage ?? "Group Stage",
        groupName: match.group_name ?? "",
      },
    }));
    setEditingMatchId(match.id);
  };

  const saveMatchInfo = async (matchId: string) => {
    const data = editData[matchId];
    if (!data) return;
    setIsLoading(true);

    const isoDate = new Date(data.kickoffAt).toISOString();

    try {
      const response = await fetch("/api/admin/update-match-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
          matchId,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam,
          homeCode: data.homeCode,
          awayCode: data.awayCode,
          kickoffAt: isoDate,
          stage: data.stage,
          // FIX: send null for group_name if it is a knockout stage
          groupName: data.stage === "Group Stage" ? data.groupName : null,
        }),
      });
      if (response.ok) {
        setLog(`✅ Meccs adatai frissítve!`);
        setEditingMatchId(null);
        fetchGodModeData();
      } else {
        const txt = await response.text();
        setLog(`❌ HIBA: ${txt}`);
      }
    } catch (e: any) {
      setLog(`❌ HIBA:\n${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const setEdit = (matchId: string, field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: value },
    }));
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
        {/* ADD NEW MATCH */}
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

            {/* FIX: Group field only appears for Group Stage */}
            {newMatch.stage === "Group Stage" && (
              <input
                type="text"
                placeholder="Csoport (pl. Group A)"
                value={newMatch.groupName}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, groupName: e.target.value })
                }
                className="bg-black/50 border border-white/10 p-2 rounded text-white"
              />
            )}

            {/* FIX: Clear groupName when changing stage if not Group Stage */}
            <select
              value={newMatch.stage}
              onChange={(e) => {
                const newStage = e.target.value;
                setNewMatch({
                  ...newMatch,
                  stage: newStage,
                  groupName:
                    newStage === "Group Stage" ? newMatch.groupName : "",
                });
              }}
              className={`bg-black/50 border border-white/10 p-2 rounded text-white cursor-pointer ${
                newMatch.stage === "Group Stage"
                  ? "md:col-span-3"
                  : "md:col-span-4"
              }`}
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
            className="w-full bg-blue-600 text-white p-3 rounded font-bold cursor-pointer hover:bg-blue-500"
          >
            Meccs Mentése
          </button>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => triggerCron("calculate-points")}
            className="flex-1 bg-green-600/20 hover:bg-green-600/30 transition-colors text-green-400 border border-green-500/50 p-4 rounded font-bold cursor-pointer"
          >
            📊 Pontok Számítása
          </button>
        </div>

        <pre className="text-xs text-slate-400 bg-black/30 border border-white/5 rounded-xl p-4 mb-8 whitespace-pre-wrap font-mono">
          {log}
        </pre>

        {/* MATCH LIST */}
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

            const isEditing = editingMatchId === match.id;
            const ed = editData[match.id];
            const isGroupStage = match.stage === "Group Stage";

            return (
              <div
                key={match.id}
                className="bg-black/30 border border-white/10 rounded-xl overflow-hidden"
              >
                <div className="flex justify-between items-start p-5 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-lg">
                      {match.home_team} vs {match.away_team}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>
                        {new Date(match.kickoff_at).toLocaleString("hu-HU", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-blue-400">{match.stage}</span>
                      {isGroupStage && match.group_name && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-amber-400 font-bold">
                            {match.group_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      isEditing ? setEditingMatchId(null) : openEdit(match)
                    }
                    className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-colors cursor-pointer flex-shrink-0 ${
                      isEditing
                        ? "bg-slate-700 border-white/10 text-slate-300 hover:bg-slate-600"
                        : "bg-slate-800 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {isEditing ? "✕ Bezárás" : "✏️ Szerkesztés"}
                  </button>
                </div>

                {isEditing && ed && (
                  <div className="border-t border-white/10 bg-slate-900/60 p-5">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                      Meccs adatok szerkesztése
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
                          Hazai csapat
                        </label>
                        <input
                          type="text"
                          value={ed.homeTeam}
                          onChange={(e) =>
                            setEdit(match.id, "homeTeam", e.target.value)
                          }
                          className="w-full bg-black/50 border border-white/10 p-2 rounded text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
                          Vendég csapat
                        </label>
                        <input
                          type="text"
                          value={ed.awayTeam}
                          onChange={(e) =>
                            setEdit(match.id, "awayTeam", e.target.value)
                          }
                          className="w-full bg-black/50 border border-white/10 p-2 rounded text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
                          Hazai zászlókód
                        </label>
                        <input
                          type="text"
                          value={ed.homeCode}
                          onChange={(e) =>
                            setEdit(match.id, "homeCode", e.target.value)
                          }
                          className="w-full bg-black/50 border border-white/10 p-2 rounded text-white text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
                          Vendég zászlókód
                        </label>
                        <input
                          type="text"
                          value={ed.awayCode}
                          onChange={(e) =>
                            setEdit(match.id, "awayCode", e.target.value)
                          }
                          className="w-full bg-black/50 border border-white/10 p-2 rounded text-white text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
                          Kezdés időpontja
                        </label>
                        <input
                          type="datetime-local"
                          value={ed.kickoffAt}
                          onChange={(e) =>
                            setEdit(match.id, "kickoffAt", e.target.value)
                          }
                          className="w-full bg-black/50 border border-white/10 p-2 rounded text-white text-sm [color-scheme:dark]"
                        />
                      </div>

                      {/* FIX: Group field only appears for Group Stage in editor */}
                      {ed.stage === "Group Stage" && (
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
                            Csoport (pl. Group A)
                          </label>
                          <input
                            type="text"
                            value={ed.groupName}
                            onChange={(e) =>
                              setEdit(match.id, "groupName", e.target.value)
                            }
                            className="w-full bg-black/50 border border-white/10 p-2 rounded text-white text-sm"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">
                          Szakasz (Stage)
                        </label>
                        {/* FIX: Clear groupName when changing stage in editor too */}
                        <select
                          value={ed.stage}
                          onChange={(e) => {
                            const newStage = e.target.value;
                            setEditData((prev) => ({
                              ...prev,
                              [match.id]: {
                                ...prev[match.id],
                                stage: newStage,
                                groupName:
                                  newStage === "Group Stage"
                                    ? prev[match.id]?.groupName
                                    : "",
                              },
                            }));
                          }}
                          className="w-full bg-black/50 border border-white/10 p-2 rounded text-white text-sm cursor-pointer"
                        >
                          <option value="Group Stage">Group Stage</option>
                          <option value="Round of 32">Round of 32</option>
                          <option value="Round of 16">Round of 16</option>
                          <option value="Quarter-finals">Quarter-finals</option>
                          <option value="Semi-finals">Semi-finals</option>
                          <option value="3rd Place Final">
                            3rd Place Final
                          </option>
                          <option value="Final">Final</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => saveMatchInfo(match.id)}
                      disabled={isLoading}
                      className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 transition-colors text-white font-bold p-2.5 rounded cursor-pointer text-sm"
                    >
                      💾 Adatok mentése
                    </button>
                  </div>
                )}

                <div className="border-t border-white/5 px-5 py-4">
                  <div className="flex gap-4 items-center justify-end bg-slate-900 p-2 rounded">
                    {/* INPUT FIELDS */}
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
