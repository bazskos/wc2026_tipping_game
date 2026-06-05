"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PrintPage() {
  const [activeTab, setActiveTab] = useState<string>("groups");
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("/api/matches");
        const result = await res.json();
        if (result.data) {
          setMatches(result.data);
        }
      } catch (error) {
        console.error("Error fetching match data for print:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMatches();
  }, []);

  const tabLabels: Record<string, string> = {
    groups: "Group Phase",
    r32: "Round of 32",
    r16: "Round of 16",
    qf: "Quarter Finals",
    sf: "Semi Finals",
    final: "Grand Final",
  };

  const knockoutConfig: Record<
    string,
    { stage: string | string[]; count: number }
  > = {
    r32: { stage: "Round of 32", count: 16 },
    r16: { stage: "Round of 16", count: 8 },
    qf: { stage: "Quarter-finals", count: 4 },
    sf: { stage: "Semi-finals", count: 2 },
    final: { stage: ["Final", "3rd Place Final"], count: 2 },
  };

  const MatchRow = ({ team1, team2 }: { team1: string; team2: string }) => (
    <div className="flex items-center justify-between py-1.5 print:py-1 border-b border-slate-200 last:border-0 text-sm">
      <div className="flex-1 font-bold text-slate-700 truncate text-right pr-2">
        {team1}
      </div>

      <div className="flex flex-col gap-1 items-center px-1">
        <div className="flex items-center gap-1 text-[8px] font-black text-slate-500 tracking-wider">
          <span className="w-10 text-right">GUESS</span>
          <div className="w-5 h-5 border border-slate-400 rounded bg-white"></div>
          <span>:</span>
          <div className="w-5 h-5 border border-slate-400 rounded bg-white"></div>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 tracking-wider">
          <span className="w-10 text-right">REAL</span>
          <div className="w-5 h-5 border border-slate-300 rounded bg-slate-50"></div>
          <span>:</span>
          <div className="w-5 h-5 border border-slate-300 rounded bg-slate-50"></div>
        </div>
      </div>

      <div className="flex-1 font-bold text-slate-700 truncate text-left pl-2">
        {team2}
      </div>
    </div>
  );

  const groupMatches = matches.filter((m) => m.stage === "Group Stage");
  const groupsObj = groupMatches.reduce((acc: any, match: any) => {
    const groupName = match.group_name || "Unknown Group";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(match);
    return acc;
  }, {});
  const sortedGroups = Object.keys(groupsObj).sort();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans print:bg-white print:p-0">
      <div className="max-w-[1200px] mx-auto mb-8 print:hidden bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Printable betting slip
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Select the phase, then print the PDF
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              ← Back
            </Link>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-[0_10px_20px_rgba(37,99,235,0.2)] flex items-center gap-2 group cursor-pointer"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform"
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
              Save as PDF
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-100">
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all cursor-pointer ${
                activeTab === key
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto bg-white print:max-w-full">
        <div className="border-b-4 border-slate-900 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl print:text-2xl font-black uppercase tracking-widest text-slate-900 mb-1">
              WC2026
            </h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Phase:{" "}
              <span className="text-blue-600">{tabLabels[activeTab]}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Player name:
            </div>
            <div className="w-56 border-b-2 border-slate-400 h-6"></div>
          </div>
        </div>

        {activeTab === "groups" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 gap-x-8 gap-y-8 print:gap-x-6 print:gap-y-6">
            {sortedGroups.length === 0 ? (
              <div className="text-slate-400 font-bold italic col-span-full">
                No group matches loaded in database yet.
              </div>
            ) : (
              sortedGroups.map((groupName, idx) => (
                <div
                  key={idx}
                  className="break-inside-avoid bg-slate-50/50 p-3 rounded-xl border border-slate-200"
                >
                  <h3 className="font-black text-base uppercase tracking-widest border-b-2 border-slate-300 pb-1 mb-2 text-slate-800 flex items-center justify-between">
                    {groupName}
                    <span className="text-[9px] text-slate-400 font-bold">
                      {groupsObj[groupName].length} MATCHES
                    </span>
                  </h3>
                  <div className="flex flex-col">
                    {groupsObj[groupName].map((match: any, mIdx: number) => (
                      <MatchRow
                        key={mIdx}
                        team1={match.home_team}
                        team2={match.away_team}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-8 gap-y-6 print:gap-x-6 print:gap-y-4">
            {(() => {
              const config = knockoutConfig[activeTab];
              const stagesToMatch = Array.isArray(config.stage)
                ? config.stage
                : [config.stage];

              const dbMatches = matches.filter((m) =>
                stagesToMatch.includes(m.stage),
              );

              const displayMatches = [];
              for (let i = 0; i < config.count; i++) {
                if (dbMatches[i]) {
                  displayMatches.push({
                    home: dbMatches[i].home_team || "TBD",
                    away: dbMatches[i].away_team || "TBD",
                  });
                } else {
                  displayMatches.push({ home: "TBD", away: "TBD" });
                }
              }

              return displayMatches.map((match, i) => (
                <div
                  key={i}
                  className="break-inside-avoid bg-slate-50/50 p-4 rounded-xl border border-slate-200"
                >
                  <h3 className="font-black text-[10px] uppercase tracking-widest border-b-2 border-slate-200 pb-1.5 mb-2 text-slate-400">
                    Match #{i + 1}
                  </h3>
                  <MatchRow team1={match.home} team2={match.away} />
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { margin: 1cm; size: A4 portrait; }
          body { background: white !important; -webkit-print-color-adjust: exact; padding-top: 0 !important; }
          nav { display: none !important; }
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        }
      `,
        }}
      />
    </div>
  );
}
