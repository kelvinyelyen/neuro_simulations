"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { Slider } from "@/components/ui/slider";
import { Activity, FunctionSquare, Info, Settings2, Timer, Zap } from "lucide-react";
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { ConceptDialog } from '@/components/guide/ConceptDialog';
import { getProbabilityContent } from './content';

type Mode = 'coin' | 'poisson';

export default function ProbabilityPage() {
    const [mode, setMode] = useState<Mode>('poisson');
    const [rate, setRate] = useState(0.5); 
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const coinHistoryRef = useRef<number[]>([]);
    const spikeTimesRef = useRef<number[]>([]);
    
    const [stats, setStats] = useState({
        coinCounts: { heads: 0, total: 0 },
        spikeCount: 0 
    });
    const lastUiUpdateRef = useRef(0);

    const getLabels = (m: Mode) => {
        switch (m) {
            case 'coin': return {
                header: "Bernoulli Process",
                param: "Probability (p)",
                formula: `P(X=k) = p^k (1-p)^{1-k}`,
                color: "text-emerald-400",
                accent: "bg-emerald-500",
                desc: "Modelling ion channels as independent binary gates. ",
                live: () => {
                    const { heads, total } = stats.coinCounts;
                    return `Heads: ${heads} | Total: ${total} (Ratio: ${total > 0 ? (heads / total).toFixed(2) : '0.00'})`;
                }
            };
            case 'poisson': return {
                header: "Poisson Process",
                param: "Firing Rate (λ)",
                formula: `P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}`,
                color: "text-purple-400",
                accent: "bg-purple-500",
                desc: "Modelling spike trains as random events in time. ",
                live: () => `Window Spike Count: ${stats.spikeCount}`
            };
        }
    };

    const labels = getLabels(mode);
    const guideContent = getProbabilityContent(mode);

    useEffect(() => {
        coinHistoryRef.current = [];
        spikeTimesRef.current = [];
        setStats({ coinCounts: { heads: 0, total: 0 }, spikeCount: 0 });
    }, [mode]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            // canvas.style.width = `${rect.width}px`; // Removed to prevent layout thrashing
            // canvas.style.height = `${rect.height}px`;
            ctx.scale(dpr, dpr);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        let animationId: number;
        let lastFrameTime = performance.now() / 1000;

        const render = () => {
            const now = performance.now() / 1000;
            const dt = now - lastFrameTime;
            lastFrameTime = now;

            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            ctx.clearRect(0, 0, width, height);
            // ctx.fillStyle = "#09090b"; // Transparent background to blend with UI
            // ctx.fillRect(0, 0, width, height);

            ctx.font = "12px ui-monospace, monospace";

            if (mode === 'coin') {
                const flipRate = 5;
                if (Math.random() < flipRate * dt) {
                    const outcome = Math.random() < rate ? 1 : 0;
                    coinHistoryRef.current = [...coinHistoryRef.current, outcome].slice(-200);
                }

                const history = coinHistoryRef.current;
                const paddingX = 40;
                const bottomY = height - 80;
                const maxH = 160;

                // Draw Coins
                history.forEach((outcome, i) => {
                    const ageIndex = (history.length - 1) - i;
                    const x = width - (ageIndex * 15); 
                    if (x < 0) return;
                    ctx.beginPath();
                    ctx.arc(x, 60, 5, 0, Math.PI * 2);
                    ctx.fillStyle = outcome === 1 ? "#10b981" : "#ef4444";
                    ctx.fill();
                });

                const heads = history.filter(c => c === 1).length;
                const total = history.length || 1;
                const barW = 80;

                // Tails Bar
                ctx.fillStyle = "#ef4444";
                const hTails = ((total - heads) / total) * maxH;
                ctx.fillRect(width * 0.25 - barW / 2, bottomY - hTails, barW, hTails);
                
                // Heads Bar
                ctx.fillStyle = "#10b981";
                const hHeads = (heads / total) * maxH;
                ctx.fillRect(width * 0.75 - barW / 2, bottomY - hHeads, barW, hHeads);

                // Text Labels
                ctx.fillStyle = "#a1a1aa";
                ctx.textAlign = "center";
                ctx.fillText(`P(0): ${((total - heads) / total).toFixed(2)}`, width * 0.25, bottomY + 25);
                ctx.fillText(`P(1): ${(heads / total).toFixed(2)}`, width * 0.75, bottomY + 25);

                // Theoretical Line
                const targetY = bottomY - (rate * maxH);
                ctx.strokeStyle = "#fbbf24";
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(width * 0.6, targetY); 
                ctx.lineTo(width * 0.9, targetY);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillText("Target p", width * 0.9 + 30, targetY + 4);

            } else {
                const realRate = 5 + (rate * 45); 
                if (Math.random() < realRate * dt) {
                    spikeTimesRef.current.push(now);
                    spikeTimesRef.current = spikeTimesRef.current.filter(t => t >= now - 5.0);
                }

                const spikes = spikeTimesRef.current;
                const paddingX = 60; 
                const histBottom = height - 90;
                const histH = 180;
                const histW = width - (paddingX * 2);

                // Raster Plot
                ctx.strokeStyle = "#a855f7"; 
                ctx.lineWidth = 2;
                ctx.beginPath();
                spikes.forEach(t => {
                    const x = width - ((now - t) * (width / 5)); 
                    if (x >= 0 && x <= width) {
                        ctx.moveTo(x, 40);
                        ctx.lineTo(x, 70);
                    }
                });
                ctx.stroke();

                // Histogram Axis
                ctx.strokeStyle = "#27272a";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(paddingX, histBottom - histH); 
                ctx.lineTo(paddingX, histBottom);
                ctx.lineTo(paddingX + histW, histBottom);
                ctx.stroke();

                const isis: number[] = [];
                for (let i = 1; i < spikes.length; i++) isis.push(spikes[i] - spikes[i - 1]);

                if (isis.length > 2) {
                    const maxIsi = 0.25;
                    const binCount = 40;
                    const bins = new Array(binCount).fill(0);
                    isis.forEach(v => {
                        const idx = Math.floor(v / (maxIsi / binCount));
                        if (idx < binCount) bins[idx]++;
                    });

                    const maxB = Math.max(...bins, 1);
                    ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
                    bins.forEach((b, i) => {
                        const h = (b / maxB) * histH;
                        const xPos = paddingX + (i * (histW / binCount));
                        ctx.fillRect(xPos, histBottom - h, (histW / binCount) - 1, h);
                    });

                    // Exponential Fit Line
                    ctx.beginPath();
                    ctx.strokeStyle = "#0ed3cf";
                    ctx.lineWidth = 2;
                    for (let x = 0; x < histW; x++) {
                        const tVal = (x / histW) * maxIsi;
                        const yVal = Math.exp(-realRate * tVal);
                        if (x === 0) ctx.moveTo(paddingX + x, histBottom - (yVal * histH));
                        else ctx.lineTo(paddingX + x, histBottom - (yVal * histH));
                    }
                    ctx.stroke();

                    // Labels
                    ctx.fillStyle = "#52525b";
                    ctx.textAlign = "left";
                    ctx.fillText("0ms", paddingX, histBottom + 20);
                    
                    ctx.textAlign = "right";
                    ctx.fillText("250ms", paddingX + histW, histBottom + 20);
                    
                    ctx.save();
                    ctx.translate(paddingX - 35, histBottom - (histH / 2));
                    ctx.rotate(-Math.PI / 2);
                    ctx.textAlign = "center";
                    ctx.fillText("Frequency", 0, 0);
                    ctx.restore();

                    ctx.textAlign = "center";
                    ctx.fillStyle = "#71717a";
                    ctx.fillText("Inter-Spike Interval (ISI)", paddingX + (histW / 2), histBottom + 45);
                }
                ctx.textAlign = "start";
            }

            if (now - lastUiUpdateRef.current > 0.1) {
                lastUiUpdateRef.current = now;
                setStats({
                    coinCounts: {
                        heads: coinHistoryRef.current.filter(x => x === 1).length,
                        total: coinHistoryRef.current.length || 1
                    },
                    spikeCount: spikeTimesRef.current.length
                });
            }
            animationId = requestAnimationFrame(render);
        };
        animationId = requestAnimationFrame(render);
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, [mode, rate]);

    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 font-mono flex flex-col overflow-hidden select-none font-sans">
            
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
                        <Activity className={cn("w-5 h-5", mode === 'coin' ? "text-emerald-500" : "text-purple-500")} />
                        <h1 className="text-lg font-semibold tracking-tight text-white">
                            <Link href="/" className="hover:opacity-80 transition-opacity">ISCN</Link>
                            <span className="mx-3 text-zinc-700">/</span>
                            <span className="text-zinc-400 font-medium">Neural Stochasticity</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                            <SelectTrigger className="w-[180px] h-9 bg-zinc-900 border-zinc-800 text-sm text-zinc-200 font-mono focus:ring-0 focus:outline-none">
                                <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="coin" className="text-white hover:bg-zinc-800 cursor-pointer font-mono">Bernoulli (Coin)</SelectItem>
                                <SelectItem value="poisson" className="text-white hover:bg-zinc-800 cursor-pointer font-mono">Poisson (Spikes)</SelectItem>
                            </SelectContent>
                        </Select>
                        <ConceptDialog title={guideContent.title} subtitle={guideContent.subtitle} sections={guideContent.sections} />
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden p-6 gap-6">
                    {/* Left Panel: Sidebar - Fixed 400px width */}
                    <aside className="w-[400px] flex flex-col shrink-0 overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-sm">
                        
                        {/* Scrollable Container with Hidden Scrollbar */}
                        <div className="h-full flex flex-col p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                            
                            {/* 1. TOP: Equation */}
                            <div className="shrink-0 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Statistical Model</span>
                                    </div>
                                    <div className="bg-black/30 rounded-xl p-4 flex flex-col items-center justify-center border border-zinc-800/30 min-h-[90px] text-zinc-200">
                                        <BlockMath math={labels.formula} />
                                    </div>
                                    <p className="text-[11px] text-zinc-500 italic leading-relaxed border-l-2 border-zinc-800 pl-3">
                                        {labels.desc}
                                    </p>
                                </div>
                            </div>

                            {/* 2. MIDDLE: Controls */}
                            <div className="flex-1 flex flex-col py-6 space-y-6">
                                <div className="space-y-4 pt-6 border-t border-zinc-800/50">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Settings2 className="w-3.5 h-3.5 text-zinc-600" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Parameters</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 leading-tight">
                                            Adjust the underlying probability or rate of the stochastic process.
                                        </p>
                                    </div>

                                    <div className="space-y-2 p-3 rounded-xl border border-zinc-800/30 bg-zinc-900/30">
                                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-3 h-3 text-amber-500" />
                                                <span>{labels.param}</span>
                                            </div>
                                            <span className={cn("text-base font-bold", labels.color)}>{rate.toFixed(2)}</span>
                                        </div>
                                        <Slider
                                            value={[rate]} min={0.01} max={0.99} step={0.01}
                                            onValueChange={([v]) => setRate(v)}
                                            className={cn("py-2", mode === 'poisson' ? "[&_[role=slider]]:bg-purple-500" : "[&_[role=slider]]:bg-emerald-500")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. BOTTOM: Status Footer */}
                            <div className="mt-auto pt-6 border-t border-zinc-800/50 shrink-0">
                                <div className="flex items-center gap-2 mb-3 text-zinc-600">
                                    <Info className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] font-mono">Live Telemetry</span>
                                </div>
                                <div className={cn(
                                    "p-4 rounded-xl border bg-zinc-950/50 transition-all duration-300", 
                                    mode === 'coin' ? "border-emerald-500/20 bg-emerald-950/10" : "border-purple-500/20 bg-purple-950/10"
                                )}>
                                    <p className={cn(
                                        "text-[11px] font-medium leading-tight font-mono text-center",
                                        mode === 'coin' ? "text-emerald-400" : "text-purple-400"
                                    )}>
                                        {labels.live()}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </aside>

                    {/* Right Panel: Visualization Workstation */}
                    <section className="flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative shadow-inner">
                        
                        {/* Dashboard Overlay */}
                        <div className="absolute top-6 left-6 z-10 pointer-events-none select-none">
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-5xl font-black text-opacity-10 font-mono tracking-tighter uppercase",
                                    mode === 'coin' ? "text-emerald-500" : "text-purple-500"
                                )}>
                                    {mode.toUpperCase()}
                                </span>
                                <div className="flex items-center gap-2 mt-2">
                                    <Timer className="w-3.5 h-3.5 text-zinc-600" />
                                    <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-bold font-mono">
                                        Real-time Simulation
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Canvas */}
                        <div className="flex-1 w-full h-full p-0">
                            <canvas ref={canvasRef} className="w-full h-full block" />
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
