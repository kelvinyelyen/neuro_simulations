"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { Slider } from "@/components/ui/slider";
import { Activity } from "lucide-react";
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
import { BlockMath } from 'react-katex';

type Mode = 'math' | 'neuro';

export default function LinearAlgebraPage() {
    const [mode, setMode] = useState<Mode>('math');

    // Mixer State
    const [weights, setWeights] = useState<number[]>([0.5, -0.2, 0.8]);
    const [inputs, setInputs] = useState<number[]>([0, 0, 0]);
    const requestRef = useRef<number>();

    // Mixer Animation Loop
    const animateMixer = () => {
        const time = Date.now() / 1000;
        setInputs([
            Math.sin(time + 0) * 0.5 + 0.5,
            Math.sin(time + 2) * 0.5 + 0.5,
            Math.sin(time + 4) * 0.5 + 0.5,
        ]);
        requestRef.current = requestAnimationFrame(animateMixer);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animateMixer);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const dotProduct = weights.reduce((acc, w, i) => acc + w * inputs[i], 0);

    const content = getLinearContent(mode);

    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 font-mono flex flex-col overflow-hidden">
            {/* MOBILE GUARD */}
            <div className="flex md:hidden flex-col items-center justify-center h-full p-8 text-center space-y-6 bg-zinc-950 z-50">
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
                <header className="h-12 border-b border-zinc-900 flex items-center justify-between px-4 bg-zinc-950/80 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", mode === 'neuro' ? "bg-purple-500" : "bg-emerald-500")} />
                        <h1 className="text-lg font-bold tracking-tight text-white">
                            <Link href="/" className="hover:text-emerald-400 transition-colors">ISCN</Link> <span className="text-zinc-400 font-normal text-base">| Linear Algebra</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                            <SelectTrigger className="w-[180px] h-8 bg-zinc-900 border-zinc-800 text-xs text-zinc-200">
                                <SelectValue placeholder="Select Context" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="math" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">Math (Dot Product)</SelectItem>
                                <SelectItem value="neuro" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">Neuro (Synapses)</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="h-4 w-px bg-zinc-800" />
                        <ConceptDialog {...content} />
                    </div>
                </header>

                <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden h-full">

                    {/* LEFT SIDEBAR: Controls & Stats */}
                    <div className="col-span-3 flex flex-col border-r border-zinc-900 bg-zinc-925 relative z-20">
                        <div className="absolute inset-0 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-hide p-6 space-y-8">

                            {/* 1. Formula Display & Output */}
                            <div className="space-y-4">
                                <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 text-center space-y-4">
                                    {/* Full Formula */}
                                    <div className="py-2">
                                        <BlockMath>{mode === 'neuro' ? "I_{sum} = \\sum_{i} w_i x_i" : "y = \\vec{w} \\cdot \\vec{x}"}</BlockMath>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-800">
                                        <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-1 font-semibold">
                                            {mode === 'neuro' ? "Somatic Current" : "Dot Product"}
                                        </h3>
                                        <div className={cn("text-3xl font-bold font-mono", dotProduct < 0 ? "text-rose-400" : "text-emerald-400")}>
                                            {dotProduct.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Sliders (Controls) */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        {mode === 'neuro' ? "Synaptic Weights" : "Vector Components"}
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    {weights.map((w, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between items-center text-xs font-mono">
                                                <span className="text-zinc-400 font-semibold tracking-wide">
                                                    {mode === 'neuro' ? `Synapse ${i + 1} (w_${i})` : `Weight w_${i}`}
                                                </span>
                                                <span className={cn("px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800", w < 0 ? "text-rose-400" : "text-emerald-400")}>
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
                                                className={cn("cursor-pointer", w < 0 ? "[&_.absolute]:bg-rose-500" : "[&_.absolute]:bg-emerald-500")}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* RIGHT COLUMN: Visuals */}
                    <div className="col-span-9 flex flex-col bg-zinc-950 relative overflow-hidden items-center justify-center">
                        <div className="flex-1 w-full flex flex-col items-center justify-center p-8 overflow-y-auto">

                            {/* THE TANKS */}
                            <div className="flex items-end justify-center w-full gap-4 md:gap-8 lg:gap-12 mb-8 md:mb-12 lg:mb-16 transform scale-100">
                                {/* Inputs */}
                                <div className="flex gap-8 items-end">
                                    {inputs.map((inVal, i) => (
                                        <div key={i} className="flex flex-col items-center gap-4">
                                            <div className="w-16 md:w-20 bg-zinc-900/50 rounded-lg overflow-hidden relative border border-zinc-800 h-48 md:h-64 lg:h-80 shadow-2xl">
                                                {/* Grid lines */}
                                                {[0.25, 0.5, 0.75].map((tick) => (
                                                    <div key={tick} className="absolute w-full h-px bg-zinc-800/50" style={{ bottom: `${tick * 100}%` }} />
                                                ))}
                                                <div
                                                    className="absolute bottom-0 w-full bg-blue-500/80 transition-all duration-100 ease-linear shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                                    style={{ height: `${Math.abs(inVal) * 100}%` }}
                                                >
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-zinc-500 font-mono mb-1">
                                                    x<sub>{i}</sub>
                                                </div>
                                                <div className="text-lg font-bold text-zinc-300 font-mono">
                                                    {inVal.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Operator / Arrow */}
                                <div className="h-48 md:h-64 lg:h-80 flex flex-col justify-center pb-12">
                                    <div className="text-zinc-700 text-6xl font-thin opacity-50">
                                        &rarr;
                                    </div>
                                </div>

                                {/* The SUMMATION TANK */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-24 md:w-32 h-48 md:h-64 lg:h-80 bg-zinc-900/50 rounded-lg border-2 border-zinc-700 relative overflow-hidden shadow-2xl">
                                        {/* Grid lines */}
                                        {[0.25, 0.5, 0.75].map((tick) => (
                                            <div key={tick} className="absolute w-full h-px bg-zinc-800" style={{ bottom: `${tick * 100}%` }} />
                                        ))}

                                        {/* Liquid */}
                                        <div
                                            className={cn(
                                                "absolute bottom-0 w-full transition-all duration-300 ease-out flex items-center justify-center text-white font-bold",
                                                dotProduct < 0 ? "bg-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.4)]" : "bg-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                                            )}
                                            style={{
                                                height: `${Math.min(Math.abs(dotProduct) * 33, 100)}%`, // Scale appropriately
                                            }}
                                        >
                                            {/* Reflection glint */}
                                            <div className="absolute top-0 left-0 w-full h-2 bg-white/20" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-zinc-500 font-mono mb-1">
                                            y (Sum)
                                        </div>
                                        <div className={cn("text-3xl font-bold font-mono", dotProduct < 0 ? "text-rose-400" : "text-emerald-400")}>
                                            {dotProduct.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ACTIVE FORMULA DISPLAY (Read-Only) */}
                            <div className="w-full max-w-5xl bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 md:p-8 backdrop-blur-sm">
                                <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-2 font-mono text-sm md:text-lg lg:text-xl">

                                    <span className="text-zinc-500 italic mr-4">y =</span>

                                    {weights.map((w, i) => (
                                        <React.Fragment key={i}>
                                            {i > 0 && <span className="text-zinc-600 mx-2">+</span>}

                                            <div className="flex items-center bg-zinc-950/50 px-3 py-2 rounded border border-zinc-800/50">
                                                {/* Weight */}
                                                <span className={cn("font-bold", w < 0 ? "text-rose-400" : "text-emerald-400")}>
                                                    {w.toFixed(2)}
                                                </span>
                                                <span className="text-zinc-600 mx-2">·</span>
                                                {/* Input */}
                                                <span className="text-blue-400">
                                                    {inputs[i].toFixed(2)}
                                                </span>
                                            </div>
                                        </React.Fragment>
                                    ))}

                                    <span className="text-zinc-600 mx-4">=</span>

                                    {/* Result */}
                                    <span className={cn("font-bold text-2xl px-4 py-2 rounded bg-zinc-950 border border-zinc-800", dotProduct < 0 ? "text-rose-400" : "text-emerald-400")}>
                                        {dotProduct.toFixed(2)}
                                    </span>

                                </div>
                                <div className="text-center mt-4 text-xs text-zinc-500 uppercase tracking-widest">
                                    Live Computation
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

