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
            ctx.fillStyle = "#18181b"; 
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

                ctx.font = "12px monospace";
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
                ctx.font = "12px monospace";
                ctx.fillText(`RASTER PLOT (Rate: ~${realRate.toFixed(0)}Hz)`, 20, 30);

                ctx.strokeStyle = "#3f3f46";
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

                    ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
                    ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";
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

                    ctx.fillStyle = "#0ed3cf";
                    ctx.fillText("Theory (Exp Decay)", histX + histWidth - 150, histBottom - histHeight);
                    ctx.fillStyle = "#a855f7";
                    ctx.fillText(`Data (N=${spikes.length})`, histX + histWidth - 150, histBottom - histHeight + 15);
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
            <div className="hidden md:flex flex-col h-full w-full">
                <header className="h-12 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", mode === 'coin' ? "bg-emerald-500" : "bg-purple-500")} />
                        <h1 className="text-lg font-bold tracking-tight text-white">
                            <Link href="/" className="hover:text-emerald-400 transition-colors">ISCN</Link> <span className="text-zinc-400 font-normal text-base">| Neural Stochasticity</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                            <SelectTrigger className="w-[180px] h-8 bg-zinc-900 border-zinc-800 text-xs text-zinc-200">
                                <SelectValue placeholder="Select Mode" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="coin" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">Bernoulli (Coin)</SelectItem>
                                <SelectItem value="poisson" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">Poisson (Spikes)</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="h-4 w-px bg-zinc-800" />

                        <ConceptDialog
                            title={guideContent.title}
                            subtitle={guideContent.subtitle}
                            sections={guideContent.sections}
                        />
                    </div>
                </header>

                <main className="flex-1 bg-zinc-950 relative overflow-hidden">
                    <div className="h-full flex flex-row items-center justify-start p-8 gap-12 lg:px-20">
                        
                        {/* Control Box - Fixed Width Sidebar */}
                        <div className="w-80 space-y-6 bg-zinc-900/60 p-6 rounded-2xl border border-white/5 backdrop-blur-md shrink-0 shadow-xl">
                            <div className="space-y-5">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <label className={cn("text-xs font-bold uppercase tracking-widest transition-colors opacity-70", labels.color)}>
                                            Parameter
                                        </label>
                                        <div className="text-sm font-medium text-zinc-200">{labels.param}</div>
                                    </div>
                                    <span className={cn("font-mono text-lg bg-zinc-950/50 px-3 py-1 rounded-lg border border-white/5", labels.color)}>
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
                                        "py-2 cursor-pointer", 
                                        mode === 'poisson' ? "[&_[role=slider]]:bg-purple-500" : "[&_[role=slider]]:bg-emerald-500"
                                    )}
                                />
                                
                                <p className="text-[11px] text-zinc-500 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 italic">
                                    {labels.desc}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <div className="space-y-3">
                                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Real-time Telemetry</span>
                                    <div className="font-mono text-xs text-white bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                                        <div className="flex justify-between opacity-50">
                                            <span>Stream State</span>
                                            <span className="animate-pulse">Active</span>
                                        </div>
                                        <div className="text-sm pt-1 text-center font-bold">
                                            {labels.live()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visualization - Expands to fit remaining space */}
                        <div className="flex-1 h-full flex items-center justify-center min-w-0">
                            <div className="relative group w-full max-w-4xl">
                                {/* Decorative Glow */}
                                <div className={cn(
                                    "absolute -inset-1 rounded-xl blur opacity-10 transition duration-1000 group-hover:opacity-20",
                                    mode === 'poisson' ? "bg-purple-500" : "bg-emerald-500"
                                )} />
                                
                                <canvas
                                    ref={canvasRef}
                                    width={800}
                                    height={400}
                                    className="relative rounded-xl shadow-2xl border border-white/10 bg-zinc-900/90 w-full h-auto aspect-[2/1]"
                                />
                                
                                {/* Scale Label */}
                                <div className="absolute bottom-4 left-4 text-[10px] text-zinc-600 font-mono">
                                    Canvas_Buffer: 800x400_px
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
