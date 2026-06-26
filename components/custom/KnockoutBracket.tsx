"use client";

import { MiniMatchCard } from "./MiniMatchCard";

// Official FIFA 2026 bracket match numbers
const FIFA_BRACKET_GRIDS: Record<string, string[][]> = {
  "Round of 32": [
    ["74", "77"],
    ["73", "75"],
    ["83", "84"],
    ["81", "82"],
    ["76", "78"],
    ["79", "80"],
    ["86", "85"],
    ["87", "88"],
  ],
  "Round of 16": [
    ["89", "90"],
    ["93", "94"],
    ["91", "92"],
    ["95", "96"],
  ],
  "Quarter-finals": [
    ["97", "98"],
    ["99", "100"],
  ],
  "Semi-finals": [["101", "102"]],
  Final: [["103", "104"]],
};

type KnockoutBracketProps = {
  matches: any[];
  stageNames: string[];
  title: string;
};

const extractMatchId = (val: any) => {
  if (!val) return "";
  return val.toString().replace(/[^0-9]/g, "");
};

export function KnockoutBracket({
  matches,
  stageNames,
  title,
}: KnockoutBracketProps) {
  const mainStage = stageNames[0];
  const gridTemplate = FIFA_BRACKET_GRIDS[mainStage];

  if (gridTemplate) {
    return (
      <div className="w-full flex flex-col items-center animate-in fade-in duration-500 pt-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 w-full max-w-6xl px-4">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-blue-600/50"></div>
          <div className="bg-slate-900/90 border border-blue-500/30 px-8 py-3 rounded-full shadow-[0_0_25px_rgba(59,130,246,0.15)]">
            <h2 className="text-base md:text-2xl font-black text-white uppercase tracking-widest text-center whitespace-nowrap">
              {title} Bracket
            </h2>
          </div>
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-blue-600/50"></div>
        </div>

        {/* Bracket Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-[1600px] px-4">
          {gridTemplate.map((pair, pairIdx) => {
            const findByNum = (targetNum: string) => {
              return matches.find((m) => {
                const rawVal = m.group ?? m.groupName ?? m.group_name;
                const cleanVal = extractMatchId(rawVal);
                return cleanVal === targetNum && stageNames.includes(m.stage);
              });
            };

            const matchA = findByNum(pair[0]);
            const matchB = findByNum(pair[1]);

            return (
              <div
                key={pairIdx}
                className="flex flex-col gap-4 bg-slate-900/20 border border-white/5 p-5 rounded-3xl relative shadow-xl"
              >
                {/* 100% ENGLISH BADGE */}
                <div className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest px-2">
                  Tie #{pairIdx + 1}
                </div>

                {/* Top match */}
                {matchA ? (
                  <MiniMatchCard match={matchA} readOnly={true} />
                ) : (
                  <EmptySlot matchNum={pair[0]} />
                )}

                {/* 100% ENGLISH CONNECTOR */}
                <div className="flex items-center justify-center -my-1 relative opacity-30 select-none">
                  <div className="w-full h-px bg-blue-500"></div>
                  <span className="absolute bg-[#020817] px-2 text-[9px] font-mono text-blue-400 font-bold uppercase tracking-widest">
                    vs
                  </span>
                </div>

                {/* Bottom match */}
                {matchB ? (
                  <MiniMatchCard match={matchB} readOnly={true} />
                ) : (
                  <EmptySlot matchNum={pair[1]} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <div>Loading bracket...</div>;
}

function EmptySlot({ matchNum }: { matchNum: string }) {
  return (
    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center gap-1 h-[104px] opacity-40 select-none">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono font-bold text-slate-500">
          MATCH {matchNum}
        </span>
        <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-600 font-mono">
          LOCKED
        </span>
      </div>
      <div className="text-center my-auto font-mono text-base font-black text-slate-700 tracking-wider">
        TBD vs TBD
      </div>
    </div>
  );
}
