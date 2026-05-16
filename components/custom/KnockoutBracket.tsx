"use client";

import { MiniMatchCard } from "./MiniMatchCard";

type KnockoutBracketProps = {
  matches: any[];
  stageNames: string[];
  title: string;
};

export function KnockoutBracket({
  matches,
  stageNames,
  title,
}: KnockoutBracketProps) {
  const stageMatches = matches.filter((m) => stageNames.includes(m.group));

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4 md:pt-0">
      <div className="flex items-center gap-2 md:gap-4 mb-8 md:mb-10 w-full">
        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-blue-600/50"></div>
        <div className="bg-slate-900/80 border border-blue-500/30 px-5 py-2.5 md:px-8 md:py-3 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <h2 className="text-sm sm:text-base md:text-2xl font-black text-white uppercase tracking-widest text-center whitespace-nowrap">
            {title}
          </h2>
        </div>
        <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-blue-600/50"></div>
      </div>

      {stageMatches.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-6 w-full">
          {stageMatches.map((match) => (
            <div key={match.id} className="relative w-full max-w-[340px]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[2px] h-3 bg-blue-500/30 hidden lg:block"></div>
              <MiniMatchCard match={match} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-10 md:p-12 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl w-full max-w-2xl text-center">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
            <span className="text-xl md:text-2xl opacity-50">⏳</span>
          </div>
          <h3 className="font-heading text-lg md:text-xl font-black text-white uppercase tracking-widest mb-2">
            No matches yet
          </h3>
          <p className="text-slate-500 font-medium text-xs md:text-sm px-4">
            The matches will appear here after the end of the previous round.
          </p>
        </div>
      )}
    </div>
  );
}
