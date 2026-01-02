"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from 'next/link';
import { Slider } from "@/components/ui/slider";
import { Activity, FunctionSquare, Layers, Zap } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { ConceptDialog } from '@/components/guide/ConceptDialog';
import { getLinearContent } from './content'; // Update content to match new modes
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Unified "Whitebox" Modes: Biology is the context.
type Mode = 'synapse' | 'neuron' | 'circuit';

export default function LinearAlgebraPage() {
    const [mode, setMode] = useState<Mode>('neuron');
    
    // Level 1 & 2: Vector of weights
    const [weights, setWeights] = useState<number[]>([0.5, -0.2, 0.8]);
    // Level 3: Matrix of weights (3x3)
    const [matrix, setMatrix] = useState<number[][]>([
        [0.8, -0.1, 0.2],
        [-0.4, 0.9, -0.2],
        [0.1, 0.3, 0.7]
    ]);
    
    const [inputs, setInputs] = useState<number[]>([0.5, 0.5, 0.5]);
    const requestRef = useRef<number>(0);

    const animateMixer = useCallback(() => {
        const time = Date.now() / 1000;
        setInputs([
            Math.sin(time + 0) * 0.5 + 0.5,
            Math.sin(time + 2) * 0.5 + 0.5,
            Math.sin(time + 4) * 0.5 + 0.5,
        ]);
        requestRef.current = requestAnimationFrame(animateMixer);
    }, []);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animateMixer);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [animateMixer]);

    // Calculation Logic
    const getOutputs = () => {
        if (mode === 'synapse') return [inputs[0] * weights[0]];
        if (mode === 'neuron') return [weights.reduce((acc, w, i) => acc + w * inputs[i], 0)];
        // Matrix multiplication for 'circuit'
        return matrix.map(row => row.reduce((acc, w, i) => acc + w * inputs[i], 0));
    };

    const outputs = getOutputs();
    const content = getLinearContent(mode);

    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden select-none font-sans">
            <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                <div className="flex items-center gap-4">
                    <Zap className={cn("w-5 h-5", mode === 'circuit' ? "text-purple-500" : "text-emerald-500")} />
                    <h1 className="text-lg font-semibold tracking-tight text-white">
                        <Link href="/" className="hover:opacity-80 transition-opacity">ISCN</Link>
                        <span className="mx-3 text-zinc-700">/</span>
                        <span className="text-zinc-400 font-medium capitalize">{mode} Level</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                        <SelectTrigger className="w-[200px] h-9 bg-zinc-900 border-zinc-800 text-sm text-zinc-200 font-mono">
                            <SelectValue placeholder="Scale" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="synapse" className="text-white">1. Synaptic Gain</SelectItem>
                            <SelectItem value="neuron" className="text-white">2. Spatial Summation</SelectItem>
                            <SelectItem value="circuit" className="text-white">3. Neural Mapping</SelectItem>
                        </SelectContent>
                    </Select>
                    <ConceptDialog {...content} />
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden p-8 gap-8">
                <aside className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-8 flex flex-col shadow-sm">
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Neural Math</span>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 flex items-center justify-center border border-zinc-800/30 min-h-[80px] text-white">
                                <BlockMath>
                                    {mode === 'synapse' ? "y = w \cdot x" : 
                                     mode === 'neuron' ? "V_{sum} = \sum w_i x_i" : 
                                     "\mathbf{y} = \mathbf{W}\mathbf{x}"}
                                </BlockMath>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-zinc-800/50">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">
                                {mode === 'circuit' ? "Connectivity Matrix" : "Synaptic Strengths"}
                            </span>
                            
                            {/* DYNAMIC PARAMETER SECTION */}
                            <div className="space-y-6">
                                {mode !== 'circuit' ? (
                                    weights.slice(0, mode === 'synapse' ? 1 : 3).map((w, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between items-center font-mono text-zinc-400">
                                                <span className="text-[11px] font-bold">w_{i}</span>
                                                <span className={cn("text-xs font-bold px-2 py-0.5 rounded", w < 0 ? "text-rose-400" : "text-emerald-400")}>
                                                    {w.toFixed(2)}
                                                </span>
                                            </div>
                                            <Slider 
                                                min={-1} max={1} step={0.1} value={[w]} 
                                                onValueChange={([val]) => {
                                                    const newW = [...weights];
                                                    newW[i] = val;
                                                    setWeights(newW);
                                                }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* Matrix mini-inputs could go here for "Whitebox" editing */}
                                        <p className="col-span-3 text-[10px] text-zinc-500 italic text-center">Interactive Grid visualization recommended</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative">
                    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-12">
                        
                        <div className="flex items-end justify-center w-full gap-8">
                            {/* INPUTS */}
                            <div className="flex gap-4 items-end">
                                {inputs.slice(0, mode === 'synapse' ? 1 : 3).map((inVal, i) => (
                                    <Tank key={i} value={inVal} label={`x_${i}`} color="bg-blue-500/60" />
                                ))}
                            </div>

                            <div className="h-48 flex flex-col justify-center text-zinc-800 text-4xl">→</div>

                            {/* OUTPUTS */}
                            <div className="flex gap-4 items-end">
                                {outputs.map((outVal, i) => (
                                    <Tank key={i} value={outVal} label={mode === 'circuit' ? `y_${i}` : 'V_{sum}'} color={outVal < 0 ? "bg-rose-500/50" : "bg-emerald-500/50"} isOutput />
                                ))}
                            </div>
                        </div>

                    </div>
                </section>
            </main>
        </div>
    );
}

// Reusable Tank Component for Whitebox Visualization
function Tank({ value, label, color, isOutput = false }: { value: number, label: string, color: string, isOutput?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className={cn("w-12 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden relative h-48 shadow-xl", isOutput && "w-16 border-2")}>
                <div 
                    className={cn("absolute bottom-0 w-full transition-all duration-150 border-t", color)}
                    style={{ height: `${Math.min(Math.abs(value) * 50, 100)}%` }}
                />
            </div>
            <div className="text-[11px] font-mono text-zinc-500 font-bold text-center">
                <InlineMath math={label} /><br/>
                <span className="text-zinc-400">{value.toFixed(2)}</span>
            </div>
        </div>
    );
}
