import React, { useState, useMemo, useEffect } from "react";
import { FunctionSquare, LayoutGrid, MousePointerClick } from "lucide-react";
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { RetinalGrid } from './RetinalGrid';
import { WeightMatrix } from './WeightMatrix';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const GRID_SIZE = 5;
const TOTAL_NEURONS = GRID_SIZE * GRID_SIZE;

export const VisualProcessingLab = () => {
    // State for Retinal Layer (Firing Rates)
    const [inputs, setInputs] = useState<number[]>(Array(TOTAL_NEURONS).fill(0));

    // State for Synaptic Weights - Default to On-Center
    const [weights, setWeights] = useState<number[]>(() => {
        const center = Math.floor(GRID_SIZE / 2);
        const centerIdx = center * GRID_SIZE + center;
        const w = Array(TOTAL_NEURONS).fill(-0.25); // Surround inhibition
        w[centerIdx] = 1; // Center excitation
        return w;
    });

    const dotProduct = useMemo(() => {
        return inputs.reduce((acc, val, i) => acc + val * weights[i], 0);
    }, [inputs, weights]);

    // State for Active Preset
    const [activePreset, setActivePreset] = useState<string>('on-center');

    // Presets
    const applyPreset = (type: 'on-center' | 'off-center' | 'vertical' | 'horizontal') => {
        setActivePreset(type);
        const newW = Array(TOTAL_NEURONS).fill(0);
        const center = Math.floor(GRID_SIZE / 2);

        switch (type) {
            case 'on-center':
                for (let i = 0; i < TOTAL_NEURONS; i++) newW[i] = -0.25;
                newW[center * GRID_SIZE + center] = 1;
                break;
            case 'off-center':
                for (let i = 0; i < TOTAL_NEURONS; i++) newW[i] = 0.25;
                newW[center * GRID_SIZE + center] = -1;
                break;
            case 'vertical':
                for (let r = 0; r < GRID_SIZE; r++) {
                    for (let c = 0; c < GRID_SIZE; c++) {
                        const i = r * GRID_SIZE + c;
                        if (c === center) newW[i] = 1;
                        else newW[i] = -0.5;
                    }
                }
                break;
            case 'horizontal':
                for (let r = 0; r < GRID_SIZE; r++) {
                    for (let c = 0; c < GRID_SIZE; c++) {
                        const i = r * GRID_SIZE + c;
                        if (r === center) newW[i] = 1;
                        else newW[i] = -0.5;
                    }
                }
                break;
        }
        setWeights(newW);
    };

    const clearInputs = () => setInputs(Array(TOTAL_NEURONS).fill(0));

    return (
        <main className="flex-1 flex overflow-hidden p-8 gap-8">
            {/* Left Panel: Configuration */}
            <aside className="w-[420px] flex flex-col gap-6 shrink-0 overflow-hidden">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-8 flex flex-col shadow-sm h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">

                    {/* Intro/Formula */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">
                                Integration Model
                            </span>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 flex items-center justify-center border border-zinc-800/30 text-white min-h-[60px]">
                            <BlockMath>
                                {"L = \\sum_{i=1}^{25} w_i \\cdot r_i"}
                            </BlockMath>
                        </div>
                    </div>

                    {/* Weight Presets */}
                    <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">
                                Receptive Field Presets
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {['on-center', 'off-center', 'vertical', 'horizontal'].map((preset) => (
                                <Button
                                    key={preset}
                                    variant="outline"
                                    className={cn(
                                        "text-xs h-8 capitalize",
                                        activePreset === preset
                                            ? "bg-zinc-800 text-white border-zinc-700"
                                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                                    )}
                                    onClick={() => applyPreset(preset as any)}
                                >
                                    {preset.replace('-', ' ')} {preset.includes('edge') ? '' : (preset === 'vertical' || preset === 'horizontal' ? 'Edge' : '')}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Weight Matrix Editor */}
                    <div className="pt-4 border-t border-zinc-800/50">
                        <WeightMatrix
                            gridSize={GRID_SIZE}
                            weights={weights}
                            onWeightChange={(i, w) => {
                                const newW = [...weights];
                                newW[i] = w;
                                setWeights(newW);
                            }}
                        />
                    </div>

                </div>
            </aside>

            {/* Right Panel: Interactive Lab */}
            <section className="flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative shadow-inner">

                <div className="absolute top-4 right-4 z-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-500 hover:text-white"
                        onClick={clearInputs}
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Clear Retina
                    </Button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 p-8">

                    {/* Input: Retina */}
                    <div className="flex flex-col items-center gap-6">
                        <RetinalGrid
                            gridSize={GRID_SIZE}
                            firingRates={inputs}
                            onRateChange={(i, r) => {
                                const newIn = [...inputs];
                                newIn[i] = r;
                                setInputs(newIn);
                            }}
                        />
                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                            <MousePointerClick className="w-3 h-3" />
                            <span>Paint Light Pattern</span>
                        </div>
                    </div>

                    {/* Flow Arrow */}
                    <div className="text-zinc-800 transform rotate-90 md:rotate-0">
                        <InlineMath math="\xrightarrow{\quad \cdot \quad}" />
                    </div>

                    {/* Output: LGN Neuron */}
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            {/* Neuron Body Visualization */}
                            <div className={cn(
                                "w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)]",
                                dotProduct > 0.5
                                    ? "bg-emerald-500 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                                    : "bg-zinc-900 border-zinc-800"
                            )}>
                                <div className="text-center z-10">
                                    <div className="text-[10px] text-white/60 font-mono uppercase tracking-widest mb-1">
                                        LGN Response
                                    </div>
                                    <div className={cn(
                                        "text-3xl font-black font-mono",
                                        dotProduct > 0 ? "text-white" : "text-zinc-500"
                                    )}>
                                        {dotProduct.toFixed(2)}
                                    </div>
                                </div>

                                {/* Spiking Animation Effect */}
                                {dotProduct > 5 && (
                                    <div className="absolute inset-0 rounded-full border-4 border-white opacity-0 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                )}
                            </div>
                        </div>

                        {/* Comparison Logic Display */}
                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 max-w-[250px] text-center">
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                The LGN neuron sums the firing rates of all
                                <span className="text-zinc-200 mx-1">Retinal Neurons</span>.
                            </p>
                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
};
