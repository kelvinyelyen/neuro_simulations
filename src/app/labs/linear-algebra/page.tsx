"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from 'next/link';
import { Slider } from "@/components/ui/slider";
import { Activity, FunctionSquare } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { ConceptDialog } from '@/components/guide/ConceptDialog';
import { getLinearContent } from './content';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

type Mode = 'math' | 'neuron';

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
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [animateMixer]);

    const dotProduct = weights.reduce((acc, w, i) => acc + w * inputs[i], 0);
    const content = getLinearContent(mode);

    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden select-none font-sans">
            
            {/* MOBILE GUARD */}
            <div className="flex md:hidden flex-col items-center justify-center h-full p-8 text-center space-y-6 bg-zinc-950 z-50 fixed inset-0">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                    <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white mb-2">Scientific Workstation</h1>
                    <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                        Please access this simulation on a <span className="text-zinc-300">Desktop</span> or <span className="text-zinc-300">Tablet</span>.
                    </p>
                </div>
            </div>

            {/* DESKTOP CONTENT */}
            <div className="hidden md:flex flex-col h-full">
                {/* Header */}
                <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                    <div className="flex items-center gap-4">
                        <Activity className={cn("w-5 h-5", mode === 'neuron' ? "text-purple-500" : "text-emerald-500")} />
                        <h1 className="text-lg font-semibold tracking-tight text-white">
                            <Link href="/" className="hover:opacity-80 transition-opacity">ISCN</Link>
                            <span className="mx-3 text-zinc-700">/</span>
                            <span className="text-zinc-400 font-medium">Signal Integration</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                            <SelectTrigger className="w-[180px] h-9 bg-zinc-900 border-zinc-800 text-sm text-zinc-200 font-mono focus:ring-0 focus:outline-none">
                                <SelectValue placeholder="Context" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="math" className="text-white hover:bg-zinc-800 cursor-pointer font-mono">
                                    Math (Dot Product)
                                </SelectItem>
                                <SelectItem value="neuron" className="text-white hover:bg-zinc-800 cursor-pointer font-mono">
                                    Neuron (Vector)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <ConceptDialog {...content} />
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden p-8 gap-8">
                    {/* Left Panel: Control Box */}
                    <aside className="w-96 flex flex-col gap-6 shrink-0 overflow-hidden">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-8 flex flex-col shadow-sm h-full">
                            
                            {/* Formula Display with Integrated Net Result Descriptions */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">
                                        Model Formula
                                    </span>
                                </div>
                                <div className="bg-black/30 rounded-xl p-4 flex items-center justify-center border border-zinc-800/30 min-h-[80px] text-white">
                                    <BlockMath>
                                        {mode === 'neuron' ? "I_{\\text{sum}} = \\sum_{i} w_i x_i" : "y = \\vec{w} \\cdot \\vec{x}"}
                                    </BlockMath>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                                        {mode === 'neuron' 
                                            ? "Summing synaptic inputs at the soma to determine the total membrane current." 
                                            : "Calculating the algebraic similarity between two vectors through element-wise multiplication."}
                                    </p>
                                    {/* Dynamic Net Result Description */}
                                    <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                                        <p className={cn(
                                            "text-[11px] font-medium leading-tight",
                                            dotProduct < 0 ? "text-rose-400/90" : "text-emerald-400/90"
                                        )}>
                                            {mode === 'neuron' 
                                                ? (dotProduct > 0.5 ? "Status: Threshold reached. The neuron is likely to fire an action potential." : "Status: Sub-threshold. Signal is too weak to trigger a spike.")
                                                : `Magnitude: ${dotProduct.toFixed(2)}. This represents the scale of the projection on the weight vector.`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Parameter Sliders */}
                            <div className="space-y-6 pt-6 border-t border-zinc-800/50 overflow-y-auto [&::-webkit-scrollbar]:hidden pr-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">
                                        {mode === 'neuron' ? "Synaptic Weights" : "Vector Components"}
                                    </span>
                                    <p className="text-[11px] text-zinc-500 leading-tight">
                                        {mode === 'neuron' 
                                            ? "Adjust synaptic strength: positive for excitation (Glutamate), negative for inhibition (GABA)." 
                                            : "Modify the weighting vector to change how the system filters incoming signals."}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {weights.map((w, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between items-center font-mono text-zinc-400">
                                                <span className="text-[11px] font-bold">
                                                    <InlineMath math={`w_${i}`} />
                                                </span>
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800",
                                                    w < 0 ? "text-rose-400" : "text-emerald-400"
                                                )}>
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
                                                className={cn(
                                                    "cursor-pointer",
                                                    w < 0 ? "[&_[role=slider]]:bg-rose-500" : "[&_[role=slider]]:bg-emerald-500"
                                                )}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Panel: Visualization Workstation */}
                    <section className="flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative shadow-inner">
                        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-12 overflow-hidden">
                            <div className="flex items-end justify-center w-full gap-8 xl:gap-16">
                                <div className="flex gap-8 items-end">
                                    {inputs.map((inVal, i) => (
                                        <div key={i} className="flex flex-col items-center gap-4">
                                            <div className="w-14 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden relative h-48 md:h-64 shadow-xl">
                                                {[0.25, 0.5, 0.75].map((tick) => (
                                                    <div key={tick} className="absolute w-full h-px bg-zinc-800/50" style={{ bottom: `${tick * 100}%` }} />
                                                ))}
                                                <div
                                                    className="absolute bottom-0 w-full bg-blue-500/60 transition-all duration-100 ease-linear border-t border-blue-400"
                                                    style={{ height: `${Math.abs(inVal) * 100}%` }}
                                                />
                                            </div>
                                            <div className="text-[11px] font-mono text-zinc-500 font-bold text-center">
                                                <InlineMath math={`x_{${i}}`} /><br/>
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
                                        {[0.25, 0.5, 0.75].map((tick) => (
                                            <div key={tick} className="absolute w-full h-px bg-zinc-800" style={{ bottom: `${tick * 100}%` }} />
                                        ))}
                                        <div
                                            className={cn(
                                                "absolute bottom-0 w-full transition-all duration-300 ease-out border-t",
                                                dotProduct < 0 ? "bg-rose-500/50 border-rose-400" : "bg-emerald-500/50 border-emerald-400"
                                            )}
                                            style={{ height: `${Math.min(Math.abs(dotProduct) * 33, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest text-center">
                                        {mode === 'neuron' ? <InlineMath math="I_{\text{sum}}" /> : <InlineMath math="y" />}
                                    </span>
                                </div>
                            </div>

                            {/* Readout Formula Bar */}
                            <div className="w-full max-w-4xl bg-zinc-950/50 border border-zinc-800 rounded-xl p-6 shadow-sm backdrop-blur-md">
                                <div className="flex flex-wrap items-center justify-center gap-x-3 font-mono text-sm xl:text-lg">
                                    <span className="text-zinc-600 italic mr-2"><InlineMath math="y =" /></span>
                                    {weights.map((w, i) => (
                                        <React.Fragment key={i}>
                                            {i > 0 && <span className="text-zinc-700">+</span>}
                                            <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800/50">
                                                <span className={cn("font-bold", w < 0 ? "text-rose-400" : "text-emerald-400")}>{w.toFixed(2)}</span>
                                                <span className="text-zinc-700">·</span>
                                                <span className="text-blue-400">{inputs[i].toFixed(2)}</span>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <span className="text-zinc-700 mx-2">=</span>
                                    <span className={cn("font-bold text-xl", dotProduct < 0 ? "text-rose-400" : "text-emerald-400")}>{dotProduct.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
