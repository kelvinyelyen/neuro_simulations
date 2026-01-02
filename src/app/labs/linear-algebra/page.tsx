"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from 'next/link';
import { Slider } from "@/components/ui/slider";
import { Activity, FunctionSquare, Zap, ShieldAlert, Coins, BrainCircuit } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { ConceptDialog } from '@/components/guide/ConceptDialog';
import { getLinearContent, Mode } from './content';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function LinearAlgebraPage() {
    const [mode, setMode] = useState<Mode>('math');
    const [weights, setWeights] = useState<number[]>([0.5, -0.2, 0.8]);
    const [inputs, setInputs] = useState<number[]>([0, 0, 0]);
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

    const dotProduct = weights.reduce((acc, w, i) => acc + w * inputs[i], 0);
    const content = getLinearContent(mode);

    // Dynamic Icon Selection
    const getModeIcon = () => {
        switch(mode) {
            case 'circuit': return <Zap className="w-5 h-5 text-blue-500" />;
            case 'stability': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
            case 'economy': return <Coins className="w-5 h-5 text-amber-500" />;
            case 'memory': return <BrainCircuit className="w-5 h-5 text-emerald-500" />;
            default: return <Activity className={cn("w-5 h-5", mode === 'neuron' ? "text-purple-500" : "text-emerald-500")} />;
        }
    };

    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden select-none font-sans">
            <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                <div className="flex items-center gap-4">
                    {getModeIcon()}
                    <h1 className="text-lg font-semibold tracking-tight text-white">
                        <Link href="/" className="hover:opacity-80 transition-opacity">ISCN</Link>
                        <span className="mx-3 text-zinc-700">/</span>
                        <span className="text-zinc-400 font-medium">Integration: Linear Algebra</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                        <SelectTrigger className="w-[180px] h-9 bg-zinc-900 border-zinc-800 text-sm text-zinc-200 font-mono focus:ring-0">
                            <SelectValue placeholder="Context" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="math">1. Dot Product</SelectItem>
                            <SelectItem value="neuron">2. Vector Neuron</SelectItem>
                            <SelectItem value="circuit">3. Circuit Model</SelectItem>
                            <SelectItem value="stability">4. Stability (E/I)</SelectItem>
                            <SelectItem value="economy">5. Economy</SelectItem>
                            <SelectItem value="memory">6. Memory</SelectItem>
                        </SelectContent>
                    </Select>
                    <ConceptDialog {...content} />
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden p-8 gap-8">
                <aside className="w-80 flex flex-col gap-6 shrink-0">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-8 flex flex-col shadow-sm">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Formula</span>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 flex items-center justify-center border border-zinc-800/30 min-h-[80px] text-white">
                                <BlockMath>
                                    {mode === 'circuit' ? "V = \\frac{\\sum g_i V_i}{\\sum g_i}" : 
                                     mode === 'math' ? "y = \\vec{w} \\cdot \\vec{x}" : 
                                     "I_{\\text{sum}} = \\sum w_i x_i"}
                                </BlockMath>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-zinc-800/50">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">
                                {mode === 'circuit' ? "Conductances (g)" : "Weights (w)"}
                            </span>
                            <div className="space-y-6">
                                {weights.map((w, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between items-center font-mono text-zinc-400">
                                            <span className="text-[11px] font-bold">
                                                <InlineMath math={mode === 'circuit' ? `g_{${i}}` : `w_{${i}}`} />
                                            </span>
                                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded", w < 0 ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10")}>
                                                {w.toFixed(2)}
                                            </span>
                                        </div>
                                        <Slider
                                            min={-1} max={1} step={0.1}
                                            value={[w]}
                                            onValueChange={([val]) => {
                                                const newW = [...weights];
                                                newW[i] = val;
                                                setWeights(newW);
                                            }}
                                            className={cn(w < 0 ? "[&_[role=slider]]:bg-rose-500" : "[&_[role=slider]]:bg-emerald-500")}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative shadow-inner">
                    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-12 overflow-y-auto">
                        <div className="flex items-end justify-center w-full gap-8 xl:gap-16">
                            <div className="flex gap-8 items-end">
                                {inputs.map((inVal, i) => (
                                    <div key={i} className="flex flex-col items-center gap-4">
                                        <div className="w-14 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden relative h-48 md:h-64 shadow-xl">
                                            <div className="absolute bottom-0 w-full bg-blue-500/60 transition-all duration-100 ease-linear"
                                                style={{ height: `${Math.abs(inVal) * 100}%` }} />
                                        </div>
                                        <div className="text-[11px] font-mono text-zinc-500 font-bold text-center">
                                            <InlineMath math={mode === 'circuit' ? `V_{${i}}` : `x_{${i}}`} /><br/>
                                            <span className="text-zinc-400">{inVal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="h-48 md:h-64 flex flex-col justify-center">
                                <span className="text-zinc-800 text-4xl font-light">→</span>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="w-24 h-48 md:h-64 bg-zinc-900 border-2 border-zinc-800 rounded-xl relative overflow-hidden shadow-2xl">
                                    <div className={cn("absolute bottom-0 w-full transition-all duration-300", 
                                        dotProduct < 0 ? "bg-rose-500/50" : "bg-emerald-500/50")}
                                        style={{ height: `${Math.min(Math.abs(dotProduct) * 33, 100)}%` }} />
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">
                                    {mode === 'circuit' ? "V_out" : "Output"}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
