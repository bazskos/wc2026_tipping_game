import { Group } from "@/lib/dummy-data";
import Image from "next/image";

export function GroupBoard({ group }: { group: Group }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col gap-5 shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-white/10 transition-all group/board text-left">
      {}
      <h3 className="font-heading text-white font-black text-xl tracking-widest uppercase flex items-center gap-3">
        <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></span>
        {group.name}
      </h3>

      <div className="flex flex-col gap-3">
        {group.teams.map((team: any, idx: number) => {
          const isQualified = idx < 2;

          const points = (team as any).points ?? 0;

          return (
            <div
              key={idx}
              className={`relative overflow-hidden flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all duration-300 ${
                isQualified
                  ? "bg-blue-950/40 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] hover:bg-blue-900/50"
                  : "bg-white/5 border-transparent opacity-70 grayscale-[30%] hover:opacity-100 hover:grayscale-0"
              }`}
            >
              {isQualified && (
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
              )}

              <div className="flex items-center gap-4 relative z-10">
                <span
                  className={`font-heading font-black text-xl w-4 ${isQualified ? "text-blue-400" : "text-slate-600"}`}
                >
                  {idx + 1}
                </span>

                <div className="relative w-12 h-8 md:w-14 md:h-10 rounded-md overflow-hidden shadow-md border border-white/10">
                  {team.code !== "un" ? (
                    <Image
                      src={`https://flagcdn.com/w80/${team.code}.png`}
                      alt={team.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                      FIFA
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm uppercase tracking-wider">
                    {team.name}
                  </span>

                  {isQualified ? (
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      In Q. Zone
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      In Danger
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-end gap-1 relative z-10">
                <span
                  className={`font-mono text-xl md:text-2xl font-black ${isQualified ? "text-white" : "text-slate-400"}`}
                >
                  {points}
                </span>
                <span className="text-xs font-bold text-slate-600 pb-1">
                  pts
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
