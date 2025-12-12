'use client';

import React from 'react';
import { useSimulationStore } from '@/store/simulation';
import { cn } from '@/lib/utils';


export function ForceBalance() {
    const { forces, hoveredTerm, setHoveredTerm } = useSimulationStore();

    // Scaling factors for visualization
    const MAX_FORCE = 200;
    const getPercent = (value: number) => Math.min(Math.abs(value) / MAX_FORCE * 100, 100);

    return (
        <div className="flex flex-col gap-2 p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg shadow-sm shrink-0">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1 mb-1">
                <h3 className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
                    Force Balance
                </h3>
            </div>

            <div className="grid grid-cols-3 gap-2 h-24">
                {/* Drive Force (Up) */}
                <div
                    className={cn(
                        "relative flex flex-col justify-end items-center bg-zinc-950 rounded border border-zinc-800 overflow-hidden group transition-all duration-200",
                        (hoveredTerm === 'R' || hoveredTerm === 'I' || hoveredTerm === 'Drive') ? "border-emerald-500/50 shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]" : ""
                    )}
                    onMouseEnter={() => setHoveredTerm('Drive')}
                    onMouseLeave={() => setHoveredTerm(null)}
                >
                    <div className="absolute inset-x-0 bottom-0 bg-emerald-950/20 h-full" />
                    <div
                        className="w-full bg-emerald-500/80 transition-all duration-75 ease-out"
                        style={{ height: `${getPercent(forces.drive)}%` }}
                    />

                    <div className="absolute top-1 left-0 right-0 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Drive</span>
                        <span className="text-[10px] font-mono text-zinc-300">{forces.drive.toFixed(1)}</span>
                    </div>
                </div>

                {/* Leak Force (Down) */}
                <div
                    className={cn(
                        "relative flex flex-col justify-start items-center bg-zinc-950 rounded border border-zinc-800 overflow-hidden group transition-all duration-200",
                        hoveredTerm === 'E_L' ? "border-cyan-500/50 shadow-[0_0_10px_-3px_rgba(6,182,212,0.3)]" : ""
                    )}
                    onMouseEnter={() => setHoveredTerm('E_L')} // E_L is the main driver of leak target, though leak also depends on V. 'Leak' hover?
                    onMouseLeave={() => setHoveredTerm(null)}
                >
                    <div className="absolute inset-x-0 top-0 bg-cyan-950/20 h-full" />
                    {/* Leak force is negative (down), so we anchor top */}
                    <div
                        className="w-full bg-cyan-500/80 transition-all duration-75 ease-out"
                        style={{ height: `${getPercent(forces.leak)}%` }}
                    />

                    <div className="absolute bottom-1 left-0 right-0 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">Leak</span>
                        <span className="text-[10px] font-mono text-zinc-300">{forces.leak.toFixed(1)}</span>
                    </div>
                </div>

                {/* Net Change */}
                <div className="relative flex flex-col items-center justify-center bg-zinc-950 rounded border border-zinc-800 overflow-hidden">
                    <div className="absolute w-full h-px bg-zinc-800 top-1/2 z-0" />

                    {/* Bar from Center */}
                    <div
                        className={cn(
                            "absolute w-full transition-all duration-75 ease-out z-10 opacity-80",
                            forces.net > 0 ? "bg-white bottom-1/2 rounded-t-sm" : "bg-zinc-400 top-1/2 rounded-b-sm"
                        )}
                        style={{ height: `${getPercent(forces.net) / 2}%` }}
                    />

                    <div className="absolute top-1 left-0 right-0 text-center z-20">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Net</span>
                    </div>
                    <div className="absolute bottom-1 left-0 right-0 text-center z-20">
                        <span className="text-[10px] font-mono text-white">{forces.net > 0 ? '+' : ''}{forces.net.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
