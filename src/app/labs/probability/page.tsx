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
    const [rate, setRate] = useState(0.5); // Lambda or P(Heads)
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Refs for high-frequency simulation data (avoids re-rendering loop)
    const coinHistoryRef = useRef<number[]>([]);
    const spikeTimesRef = useRef<number[]>([]);

    // State for low-frequency UI updates
    const [stats, setStats] = useState<{
        coinCounts: { heads: number; total: number };
        spikeCount: number;
    }>({ coinCounts: { heads: 0, total: 0 }, spikeCount: 0 });

    const lastTimeRef = useRef(0); // This ref is not used in the new logic, can be removed if not needed elsewhere.
    const lastUiUpdateRef = useRef(0);

    const getLabels = (m: Mode) => {
        switch (m) {
            case 'coin': return {
                header: "Bernoulli Process",
                param: "Probability (p)",
                desc: "Simulating independent binary events (Ion Channels).",
                live: () => {
                    const { heads, total } = stats.coinCounts;
                    return `Heads: ${heads}/${total} (${total > 0 ? (heads / total).toFixed(2) : '0.00'})`;
                }
            };
            case 'poisson': return {
                header: "Poisson Process",
                param: "Firing Rate (λ)",
                desc: "Simulating random spike arrival times.",
                live: () => `Count: ${stats.spikeCount} spikes`
            };
        }
    };

    const labels = getLabels(mode);
    const guideContent = getProbabilityContent(mode);

    // Reset when mode changes
    useEffect(() => {
        coinHistoryRef.current = [];
        spikeTimesRef.current = [];
        setStats({ coinCounts: { heads: 0, total: 0 }, spikeCount: 0 });
        lastTimeRef.current = 0;
    }, [mode]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        // Use standard time tracking
        let lastFrameTime = performance.now() / 1000; // seconds

        const render = () => {
            const now = performance.now() / 1000; // seconds
            const dt = now - lastFrameTime;
            lastFrameTime = now;

            // CLEAR
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#18181b"; // zinc-900 (matches bg)
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (mode === 'coin') {
                // --- BERNOULLI (COIN) MODE ---
                // Use dt for consistent speed regardless of framerate
                // Flip rate: e.g., 5 flips per second
                const flipRate = 5;
                if (Math.random() < flipRate * dt) {
                    const outcome = Math.random() < rate ? 1 : 0;
                    coinHistoryRef.current = [...coinHistoryRef.current, outcome].slice(-200);
                }

                const history = coinHistoryRef.current;

                // Draw Stream
                const coinSize = 10;
                const streamY = 100;
                history.forEach((outcome, i) => {
                    // index 0 is oldest. We want newest on right? 
                    // Usually arrays push to end. slice(-200) keeps end.
                    // So history[length-1] is newest.
                    // Let's draw newest at right edge.
                    const ageIndex = (history.length - 1) - i; // 0 for newest
                    const x = canvas.width - 50 - (ageIndex * (coinSize + 5));

                    if (x < 0) return;
                    ctx.beginPath();
                    ctx.arc(x, streamY, coinSize / 2, 0, Math.PI * 2);
                    ctx.fillStyle = outcome === 1 ? "#10b981" : "#ef4444";
                    ctx.fill();
                });

                // Draw Stats Bars
                const heads = history.filter(c => c === 1).length;
                const tails = history.filter(c => c === 0).length;
                const total = history.length || 1;

                const barWidth = 60;
                const maxBarHeight = 150;

                // Labels
                ctx.font = "12px monospace";

                // Tails
                const hTails = (tails / total) * maxBarHeight;
                ctx.fillStyle = "#ef4444";
                ctx.fillRect(canvas.width / 4 - barWidth / 2, canvas.height - 50 - hTails, barWidth, hTails);
                ctx.fillStyle = "#fff";
                ctx.fillText(`0 (Closed): ${(tails / total).toFixed(2)}`, canvas.width / 4 - 40, canvas.height - 30);

                // Heads
                const hHeads = (heads / total) * maxBarHeight;
                ctx.fillStyle = "#10b981";
                ctx.fillRect(3 * canvas.width / 4 - barWidth / 2, canvas.height - 50 - hHeads, barWidth, hHeads);
                ctx.fillStyle = "#fff";
                ctx.fillText(`1 (Open): ${(heads / total).toFixed(2)}`, 3 * canvas.width / 4 - 35, canvas.height - 30);

                // Target Line
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
                // --- POISSON (SPIKES) MODE ---

                // 1. UPDATE PHYSICS
                const realRate = 5 + (rate * 45); // 5Hz to 50Hz
                // Poisson prob in dt: lambda * dt
                if (Math.random() < realRate * dt) {
                    // Store time in SECONDS
                    spikeTimesRef.current.push(now);
                    // Prune old spikes (> 5 seconds old)
                    const cutoff = now - 5.0;
                    if (spikeTimesRef.current.length > 0 && spikeTimesRef.current[0] < cutoff) {
                        // Simple optimization: remove if too old. 
                        // Or just slice to keep array size manageable.
                        spikeTimesRef.current = spikeTimesRef.current.filter(t => t >= cutoff);
                    }
                }
                const spikes = spikeTimesRef.current;

                // Layout Constants
                const rasterY = 80;
                const histBottom = canvas.height - 40;
                const histHeight = 150;
                const histX = 60;
                const histWidth = canvas.width - 120;

                // 2. DRAW RASTER
                const scrollSpeed = 150; // px/s

                // Label
                ctx.fillStyle = "#a1a1aa";
                ctx.font = "12px monospace";
                ctx.fillText(`RASTER PLOT (Rate: ~${realRate.toFixed(0)}Hz)`, 20, 30);

                // Axis
                ctx.strokeStyle = "#3f3f46";
                ctx.beginPath();
                ctx.moveTo(0, rasterY);
                ctx.lineTo(canvas.width, rasterY);
                ctx.stroke();

                // Spikes
                ctx.strokeStyle = "#a855f7"; // Purple
                ctx.lineWidth = 2;
                ctx.beginPath();
                spikes.forEach(t => {
                    const age = now - t; // seconds
                    const x = canvas.width - 50 - (age * scrollSpeed);
                    if (x > 0 && x < canvas.width) {
                        ctx.moveTo(x, rasterY - 15);
                        ctx.lineTo(x, rasterY + 15);
                    }
                });
                ctx.stroke();

                // 3. CALCULATE HISTOGRAM (ISI)
                // We need ISIs from the *entire* recent history to build a distribution
                // But typically ISIs are built over time. 
                // For this demo, let's just calculate ISIs from the visible buffer (5s).

                const isis: number[] = [];
                for (let i = 1; i < spikes.length; i++) {
                    isis.push(spikes[i] - spikes[i - 1]); // seconds
                }

                if (isis.length > 2) {
                    const maxIsi = 0.2; // 200ms window
                    const binCount = 30;
                    const binSize = maxIsi / binCount;
                    const bins = new Array(binCount).fill(0);

                    isis.forEach(interval => {
                        if (interval < maxIsi) {
                            const binIndex = Math.floor(interval / binSize);
                            if (binIndex < binCount) bins[binIndex]++;
                        }
                    });

                    // 4. DRAW HISTOGRAM
                    ctx.fillStyle = "#a1a1aa";
                    ctx.fillText("ISI HISTOGRAM (Inter-Spike Intervals)", 20, histBottom - histHeight - 20);

                    // Normalize height
                    // Heuristic: Max bin usually corresponds to peak probability
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

                    // 5. THEORETICAL CURVE
                    // PDF: lambda * e^(-lambda * t)
                    // At t=0, val = lambda. 
                    // We need to scale match the visual peak.
                    // The visual peak (bin 0) is roughly proportional to P(0).
                    // So we can align the curves at t=0 or based on maxBinVal.

                    ctx.beginPath();
                    ctx.strokeStyle = "#0ed3cf";
                    ctx.lineWidth = 2;

                    for (let px = 0; px <= histWidth; px += 2) {
                        const tVal = (px / histWidth) * maxIsi;
                        const theoryVal = Math.exp(-realRate * tVal); // shape e^-lt

                        // Scale: theoryVal is 1.0 at t=0.
                        // We want it to match the histogram's 'ideal' height at t=0? 
                        // Let's just scale it to the full plot height for clear visibility of shape comparison
                        // or match it to the max bin if we want to be accurate.
                        // Matching Max Bin is tricky if data is noisy. 
                        // Let's simplified: Scale such that t=0 is 90% of plot height 
                        // IF the data normalized similarly. 
                        // Actually, comparing *Shape* is key.

                        const y = histBottom - (theoryVal * histHeight);

                        if (px === 0) ctx.moveTo(histX + px, y);
                        else ctx.lineTo(histX + px, y);
                    }
                    ctx.stroke();

                    // Legend
                    ctx.fillStyle = "#0ed3cf";
                    ctx.fillText("Theory (Exp Decay)", histX + histWidth - 150, histBottom - histHeight);
                    ctx.fillStyle = "#a855f7";
                    ctx.fillText(`Data (N=${spikes.length})`, histX + histWidth - 150, histBottom - histHeight + 15);
                }
            }

            // UI SYNC (Throttled 10Hz)
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
    }, [mode, rate]); // Dep array clean!


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

            {/* Header */}
            {/* DESKTOP CONTENT */}
            <div className="hidden md:flex flex-col h-full w-full">
                <header className="h-12 border-b border-zinc-900 flex items-center justify-between px-4 bg-zinc-950/80 backdrop-blur-sm z-10 shrink-0">
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

                {/* Main Content - Scrollable Wrapper */}
                <main className="flex-1 overflow-y-auto bg-zinc-950 relative scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    <div className="min-h-full flex flex-col items-center justify-center p-6 pb-20">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={400}
                            className="rounded-lg shadow-2xl border border-zinc-800 bg-zinc-900/80 mb-8 w-full max-w-4xl shrink-0"
                        />

                        <div className="w-full max-w-md space-y-6 bg-zinc-900/80 p-6 rounded-xl border border-white/10 backdrop-blur-sm shrink-0">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-emerald-400">
                                        {labels.param}
                                    </label>
                                    <span className="font-mono text-xs bg-zinc-950 px-2 py-1 rounded text-emerald-300">
                                        {rate.toFixed(2)}
                                    </span>
                                </div>
                                <Slider
                                    value={[rate]}
                                    min={0.01}
                                    max={0.99}
                                    step={0.01}
                                    onValueChange={([v]) => setRate(v)}
                                    className="py-2"
                                />
                                <p className="text-xs text-zinc-500 italic text-center">
                                    {labels.desc}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-zinc-800">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400">Live Stats:</span>
                                    <span className="font-mono text-white">
                                        {labels.live()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
