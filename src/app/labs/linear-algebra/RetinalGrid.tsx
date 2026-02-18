import React from 'react';
import { cn } from '@/lib/utils';
import { InlineMath } from 'react-katex';

interface RetinalGridProps {
    gridSize: number;
    firingRates: number[];
    onRateChange: (index: number, newRate: number) => void;
}

export const RetinalGrid: React.FC<RetinalGridProps> = ({ gridSize, firingRates, onRateChange }) => {
    // Helper to get brightness color based on firing rate (0 to 1)
    const getCellColor = (rate: number) => {
        // Simple grayscale mapping: 0 = Black (no firing), 1 = White (max firing)
        const intensity = Math.min(Math.max(rate, 0), 1);
        const val = Math.floor(intensity * 255);
        return `rgb(${val}, ${val}, ${val})`;
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                Retinal Layer (<InlineMath math="\vec{r}" />)
            </h3>
            <div
                className="grid gap-1 p-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-inner"
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
                {firingRates.map((rate, i) => (
                    <div
                        key={i}
                        className="relative w-12 h-12 sm:w-16 sm:h-16 border border-zinc-700/50 rounded cursor-pointer transition-all hover:z-10 hover:ring-2 hover:ring-zinc-400 group"
                        style={{ backgroundColor: getCellColor(rate) }}
                        onClick={() => {
                            // Cycle: 0 -> 0.1 ... -> 1 -> 0
                            const nextRate = rate >= 1 ? 0 : parseFloat((rate + 0.1).toFixed(1));
                            onRateChange(i, nextRate);
                        }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                            <span className="text-xs font-mono text-white font-bold">{rate.toFixed(1)}</span>
                        </div>
                        {/* Index label */}
                        <div className="absolute top-0.5 right-1 text-[8px] text-zinc-500/80 mix-blend-difference font-mono pointer-events-none">
                            {i}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-zinc-500 text-center max-w-[200px]">
                Click cells to cycle firing rates.<br />
                Brighter = Higher Firing Rate.
            </p>
        </div>
    );
};
