"use client";

import { MiniMatchCard } from "./MiniMatchCard";

const FIFA_BRACKET_GRIDS: Record<string, string[][]> = {
  "Round of 32": [
    ["74", "77"],
    ["73", "75"],
    ["83", "84"],
    ["81", "82"],
    ["76", "78"],
    ["79", "80"],
    ["86", "88"],
    ["85", "87"],
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
      <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-[1600px]">
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
                className="flex flex-col gap-4 bg-slate-900/30 border border-white/5 p-5 rounded-3xl relative shadow-xl"
              >
                <div className="text-[10px] font-black font-mono text-blue-400/80 uppercase tracking-widest px-2">
                  Tie #{pairIdx + 1}
                </div>

                {matchA ? (
                  <MiniMatchCard match={matchA} readOnly={true} />
                ) : (
                  <EmptySlot matchNum={pair[0]} />
                )}

                <div className="flex items-center justify-center -my-1 relative opacity-30 select-none">
                  <div className="w-full h-px bg-blue-500"></div>
                  <span className="absolute bg-[#020817] px-2 text-[9px] font-mono text-blue-400 font-bold uppercase tracking-widest">
                    vs
                  </span>
                </div>

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
    <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-center gap-1 h-[104px] opacity-50 select-none">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono font-bold text-slate-500">
          MATCH {matchNum}
        </span>
        <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-slate-500 font-mono">
          TBD
        </span>
      </div>
      <div className="text-center my-auto font-mono text-sm font-bold text-slate-600 tracking-wider">
        Winner vs Winner
      </div>
    </div>
  );
}
