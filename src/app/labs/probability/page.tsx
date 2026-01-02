"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { getProbabilityContent } from './content';

type Mode = 'coin' | 'poisson';

export default function ProbabilityPage() {
    const [mode, setMode] = useState<Mode>('poisson');
    const [rate, setRate] = useState(0.5); 
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const coinHistoryRef = useRef<number[]>([]);
    const spikeTimesRef = useRef<number[]>([]);

    const [stats, setStats] = useState<{
        coinCounts: { heads: number; total: number };
        spikeCount: number;
    }>({ coinCounts: { heads: 0, total: 0 }, spikeCount: 0 });

    const lastUiUpdateRef = useRef(0);

    const getLabels = (m: Mode) => {
        switch (m) {
            case 'coin': return {
                header: "Bernoulli Process",
                param: "Probability (p)",
                formula: `P(k) = p^k (1-p)^{1-k}`,
                color: "text-emerald-400",
                accent: "bg-emerald-500",
                desc: "Simulating independent binary events (Ion Channels).",
                live: () => {
                    const { heads, total } = stats.coinCounts;
                    return `Heads: ${heads}/${total} (${total > 0 ? (heads / total).toFixed(2) : '0.00'})`;
                }
            };
            case 'poisson': return {
                header: "Poisson Process",
                param: "Firing Rate (λ)",
                formula: `P(k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}`,
                color: "text-purple-400",
                accent: "bg-purple-500",
                desc: "Simulating random spike arrival times.",
                live: () => `Count: ${stats.spikeCount} spikes`
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

        let animationId: number;
        let lastFrameTime = performance.now() / 1000;

        const render = () => {
            const now = performance.now() / 1000;
            const dt = now - lastFrameTime;
            lastFrameTime = now;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#09090b"; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (mode === 'coin') {
                const flipRate = 5;
                if (Math.random() < flipRate * dt) {
                    const outcome = Math.random() < rate ? 1 : 0;
                    coinHistoryRef.current = [...coinHistoryRef.current, outcome].slice(-200);
                }

                const history = coinHistoryRef.current;
                const coinSize = 10;
                const streamY = 100;
                
                history.forEach((outcome, i) => {
                    const ageIndex = (history.length - 1) - i;
                    const x = canvas.width - 50 - (ageIndex * (coinSize + 5));
                    if (x < 0) return;
                    ctx.beginPath();
                    ctx.arc(x, streamY, coinSize / 2, 0, Math.PI * 2);
                    ctx.fillStyle = outcome === 1 ? "#10b981" : "#ef4444";
                    ctx.fill();
                });

                const heads = history.filter(c => c === 1).length;
                const tails = history.filter(c => c === 0).length;
                const total = history.length || 1;
                const barWidth = 60;
                const maxBarHeight = 150;

                ctx.font = "12px sans-serif";
                const hTails = (tails / total) * maxBarHeight;
                ctx.fillStyle = "#ef4444";
                ctx.fillRect(canvas.width / 4 - barWidth / 2, canvas.height - 50 - hTails, barWidth, hTails);
                ctx.fillStyle = "#fff";
                ctx.fillText(`0 (Closed): ${(tails / total).toFixed(2)}`, canvas.width / 4 - 40, canvas.height - 30);

                const hHeads = (heads / total) * maxBarHeight;
                ctx.fillStyle = "#10b981";
                ctx.fillRect(3 * canvas.width / 4 - barWidth / 2, canvas.height - 50 - hHeads, barWidth, hHeads);
                ctx.fillStyle = "#fff";
                ctx.fillText(`1 (Open): ${(heads / total).toFixed(2)}`, 3 * canvas.width / 4 - 35, canvas.height - 30);

                const targetY = canvas.height - 50 - (rate * maxBarHeight);
                ctx.strokeStyle = "#fbbf24";
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, targetY);
                ctx.lineTo(canvas.width, targetY);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = "#fbbf24";
                ctx.fillText(`Target p=${rate.toFixed(2)}`, canvas.width - 100, targetY - 5);

            } else {
                const realRate = 5 + (rate * 45); 
                if (Math.random() < realRate * dt) {
                    spikeTimesRef.current.push(now);
                    const cutoff = now - 5.0;
                    spikeTimesRef.current = spikeTimesRef.current.filter(t => t >= cutoff);
                }
                const spikes = spikeTimesRef.current;
                const rasterY = 80;
                const histBottom = canvas.height - 40;
                const histHeight = 150;
                const histX = 60;
                const histWidth = canvas.width - 120;
                const scrollSpeed = 150;

                ctx.fillStyle = "#a1a1aa";
                ctx.font = "12px sans-serif";
                ctx.fillText(`RASTER PLOT (Rate: ~${realRate.toFixed(0)}Hz)`, 20, 30);

                ctx.strokeStyle = "#27272a";
                ctx.beginPath();
                ctx.moveTo(0, rasterY);
                ctx.lineTo(canvas.width, rasterY);
                ctx.stroke();

                ctx.strokeStyle = "#a855f7"; 
                ctx.lineWidth = 2;
                ctx.beginPath();
                spikes.forEach(t => {
                    const age = now - t;
                    const x = canvas.width - 50 - (age * scrollSpeed);
                    if (x > 0 && x < canvas.width) {
                        ctx.moveTo(x, rasterY - 15);
                        ctx.lineTo(x, rasterY + 15);
                    }
                });
                ctx.stroke();

                const isis: number[] = [];
                for (let i = 1; i < spikes.length; i++) {
                    isis.push(spikes[i] - spikes[i - 1]);
                }

                if (isis.length > 2) {
                    const maxIsi = 0.2;
                    const binCount = 30;
                    const binSize = maxIsi / binCount;
                    const bins = new Array(binCount).fill(0);

                    isis.forEach(interval => {
                        if (interval < maxIsi) {
                            const binIndex = Math.floor(interval / binSize);
                            if (binIndex < binCount) bins[binIndex]++;
                        }
                    });

                    ctx.fillStyle = "#a1a1aa";
                    ctx.fillText("ISI HISTOGRAM (Inter-Spike Intervals)", 20, histBottom - histHeight - 20);
                    const maxBinVal = Math.max(...bins, 1);
                    const barW = histWidth / binCount;

                    ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
                    ctx.strokeStyle = "rgba(168, 85, 247, 0.5)";
                    ctx.lineWidth = 1;

                    bins.forEach((count, i) => {
                        const h = (count / maxBinVal) * histHeight;
                        const x = histX + (i * barW);
                        const y = histBottom - h;
                        ctx.fillRect(x, y, barW - 1, h);
                        ctx.strokeRect(x, y, barW - 1, h);
                    });

                    ctx.beginPath();
                    ctx.strokeStyle = "#0ed3cf";
                    ctx.lineWidth = 2;
                    for (let px = 0; px <= histWidth; px += 2) {
                        const tVal = (px / histWidth) * maxIsi;
                        const theoryVal = Math.exp(-realRate * tVal);
                        const y = histBottom - (theoryVal * histHeight);
                        if (px === 0) ctx.moveTo(histX + px, y);
                        else ctx.lineTo(histX + px, y);
                    }
                    ctx.stroke();
                }
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
        return () => cancelAnimationFrame(animationId);
    }, [mode, rate]);

    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-sm z-10 shrink-0">
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
                        <SelectTrigger className="w-[180px] h-9 bg-zinc-900 border-zinc-800 text-sm text-zinc-200 focus:ring-0">
                            <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="coin">Bernoulli (Coin)</SelectItem>
                            <SelectItem value="poisson">Poisson (Spikes)</SelectItem>
                        </SelectContent>
                    </Select>
                    <ConceptDialog
                        title={guideContent.title}
                        subtitle={guideContent.subtitle}
                        sections={guideContent.sections}
                    />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden p-8 gap-8">
                
                {/* Left Panel: Controls */}
                <aside className="w-80 flex flex-col gap-6 shrink-0">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-8 flex flex-col">
                        
                        {/* Parameter Control */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                                    {labels.param}
                                </label>
                                <span className={cn("text-base font-bold tabular-nums", labels.color)}>
                                    {rate.toFixed(2)}
                                </span>
                            </div>
                            
                            <Slider
                                value={[rate]}
                                min={0.01}
                                max={0.99}
                                step={0.01}
                                onValueChange={([v]) => setRate(v)}
                                className={cn(
                                    "py-2",
                                    mode === 'poisson' ? "[&_[role=slider]]:bg-purple-500" : "[&_[role=slider]]:bg-emerald-500"
                                )}
                            />
                            
                            <p className="text-xs text-zinc-500 leading-relaxed italic pr-4">
                                {labels.desc}
                            </p>
                        </div>

                        {/* Formula Display */}
                        <div className="pt-6 border-t border-zinc-800/50 space-y-3">
                            <div className="flex items-center gap-2">
                                <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600">Model Formula</span>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 flex items-center justify-center border border-zinc-800/30">
                                <span className="text-sm font-light text-zinc-300">
                                    $${labels.formula}$$
                                </span>
                            </div>
                        </div>

                        {/* Telemetry */}
                        <div className="pt-6 border-t border-zinc-800/50 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600">Live Statistics</span>
                            <div className="text-sm font-medium text-white tabular-nums bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                                {labels.live()}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Panel: Visualization */}
                <section className="flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col relative shadow-inner">
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="w-full max-w-4xl relative group">
                             {/* Canvas Glow effect */}
                             <div className={cn(
                                "absolute -inset-1 rounded-xl blur-lg opacity-10 transition duration-1000",
                                mode === 'coin' ? "bg-emerald-500" : "bg-purple-500"
                            )} />
                            <canvas
                                ref={canvasRef}
                                width={800}
                                height={400}
                                className="relative w-full h-auto bg-zinc-950 rounded-xl shadow-2xl border border-zinc-800"
                            />
                        </div>
                    </div>
                    
                    {/* Status Footnote */}
                    <div className="p-4 px-8 border-t border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", mode === 'coin' ? "bg-emerald-500" : "bg-purple-500")} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                                {mode === 'coin' ? "Bernoulli Engine" : "Poisson Engine"}
                            </span>
                        </div>
                        <span className="text-[10px] text-zinc-700 uppercase tracking-widest">
                            Simulation Hz: 60
                        </span>
                    </div>
                </section>
            </main>
        </div>
    );
}
