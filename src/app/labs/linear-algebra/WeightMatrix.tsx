import React from 'react';
import { cn } from '@/lib/utils';
import { InlineMath } from 'react-katex';

interface WeightMatrixProps {
    gridSize: number;
    weights: number[];
    onWeightChange: (index: number, newWeight: number) => void;
}

export const WeightMatrix: React.FC<WeightMatrixProps> = ({ gridSize, weights, onWeightChange }) => {

    const getWeightColor = (weight: number) => {
        if (weight > 0) {
            // Excitatory - Green/Emerald
            const intensity = Math.min(Math.abs(weight), 1);
            return `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`;
        } else if (weight < 0) {
            // Inhibitory - Red/Rose
            const intensity = Math.min(Math.abs(weight), 1);
            return `rgba(244, 63, 94, ${0.2 + intensity * 0.8})`;
        }
        return 'transparent';
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                Synaptic Weights (<InlineMath math="\vec{w}" />)
            </h3>
            <div
                className="grid gap-1 p-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-inner"
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
                {weights.map((w, i) => (
                    <div
                        key={i}
                        className={cn(
                            "relative w-12 h-12 sm:w-16 sm:h-16 border rounded cursor-pointer transition-all hover:scale-10 hover:z-10 hover:ring-2 hover:ring-zinc-400 group flex items-center justify-center",
                            w === 0 ? "border-zinc-800 bg-zinc-950" : "border-zinc-700/50"
                        )}
                        style={{ backgroundColor: getWeightColor(w) }}
                        onClick={() => {
                            // Cycle: -1 -> -0.9 ... -> 0 -> ... -> 1 -> -1
                            const nextW = w >= 1 ? -1 : parseFloat((w + 0.1).toFixed(1));
                            onWeightChange(i, nextW);
                        }}
                    >
                        <span className={cn(
                            "text-xs font-mono font-bold",
                            w === 0 ? "text-zinc-700" : "text-white drop-shadow-md"
                        )}>
                            {w === 0 ? '0' : w.toFixed(1)}
                        </span>

                        {/* Index label */}
                        <div className="absolute top-0.5 right-1 text-[8px] text-white/50 mix-blend-overlay font-mono pointer-events-none">
                            {i}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-zinc-500">
                Click cells to cycle weights.
                <span className="text-emerald-400"> Green = Excitatory (+)</span> |
                <span className="text-rose-400"> Red = Inhibitory (-)</span>
            </p>
        </div>
    );
};
