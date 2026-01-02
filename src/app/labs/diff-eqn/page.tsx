"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from 'next/link';
import { Slider } from "@/components/ui/slider";
import { FunctionSquare, Compass, Timer } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { ConceptDialog } from '@/components/guide/ConceptDialog';
import { getPhaseContent } from './content';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Updated Mode type based on your handwritten roadmap
type Mode = 'leak' | 'time-constant' | 'fixed-points' | 'spike';

export default function PhasePlanePage() {
    const [mode, setMode] = useState<Mode>('leak');
    const [paramI, setParamI] = useState(0.5);
    // New state for Time Constant (tau) - crucial for Phase 2
    const [tauValue, setTauValue] = useState(0.8); 
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);
    const [liveState, setLiveState] = useState<{ x: number, y: number, dx: number, dy: number } | null>(null);

    // Fixed parameters for FitzHugh-Nagumo
    const a = 0.7;
    const b = 0.8;

    const getDerivatives = useCallback((x: number, y: number, p: number, m: Mode, t: number) => {
        switch (m) {
            case 'leak':
                // The Leak (First order ODE): dV/dt = -V + I
                return { dx: -x + p, dy: -y };
            case 'time-constant':
                // Visualizing Tau: dV/dt = (-V + I) / tau
                // Lower tau = faster reaction (larger vectors)
                return { dx: (-x + p) / t, dy: -y / t };
            case 'fixed-points':
                // Standard 2D linear system to show equilibrium stability
                return { dx: y, dy: -x - p * y };
            case 'spike':
                // FitzHugh-Nagumo: The fundamental spiking model
                return {
                    dx: x - (x * x * x) / 3 - y + p,
                    dy: t * (x + a - b * y)
                };
            default:
                return { dx: 0, dy: 0 };
        }
    }, [a, b]);

    const rk4Step = useCallback((x: number, y: number, p: number, m: Mode, t: number, dt: number) => {
        const k1 = getDerivatives(x, y, p, m, t);
        const k2 = getDerivatives(x + k1.dx * dt / 2, y + k1.dy * dt / 2, p, m, t);
        const k3 = getDerivatives(x + k2.dx * dt / 2, y + k2.dy * dt / 2, p, m, t);
        const k4 = getDerivatives(x + k3.dx * dt, y + k3.dy * dt, p, m, t);
        return {
            x: x + (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx),
            y: y + (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy)
        };
    }, [getDerivatives]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const scale = 80;
        const offset = { x: width / 2, y: height / 2 };

        const toCanvas = (x: number, y: number) => ({
            x: offset.x + x * scale,
            y: offset.y - y * scale
        });

        const fromCanvas = (cx: number, cy: number) => ({
            x: (cx - offset.x) / scale,
            y: (offset.y - cy) / scale
        });

        ctx.fillStyle = "#09090b";
        ctx.fillRect(0, 0, width, height);

        // Vector Field
        ctx.strokeStyle = "rgba(113, 113, 122, 0.25)";
        ctx.lineWidth = 1;
        for (let x = -6; x <= 6; x += 0.5) {
            for (let y = -4; y <= 4; y += 0.5) {
                const { dx, dy } = getDerivatives(x, y, paramI, mode, tauValue);
                const speed = Math.sqrt(dx * dx + dy * dy);
                const arrowScale = 0.2 / (speed + 0.5);
                const start = toCanvas(x, y);
                const end = toCanvas(x + dx * arrowScale, y + dy * arrowScale);

                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(end.x, end.y, 1, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(113, 113, 122, 0.4)";
                ctx.fill();
            }
        }

        // Fixed Points & Nullclines
        ctx.lineWidth = 2.5;
        if (mode === 'leak' || mode === 'time-constant') {
            // V-nullcline (Fixed point is at V=I)
            ctx.strokeStyle = "#10b981";
            ctx.beginPath();
            ctx.moveTo(toCanvas(paramI, -4).x, toCanvas(paramI, -4).y);
            ctx.lineTo(toCanvas(paramI, 4).x, toCanvas(paramI, 4).y);
            ctx.stroke();

            // Visualizing the Fixed Point Sink
            const fp = toCanvas(paramI, 0);
            ctx.fillStyle = "#10b981";
            ctx.beginPath();
            ctx.arc(fp.x, fp.y, 6, 0, Math.PI * 2);
            ctx.fill();
        } else if (mode === 'spike') {
            // Cubic Nullcline
            ctx.strokeStyle = "#10b981";
            ctx.beginPath();
            for (let v = -4; v <= 4; v += 0.05) {
                const w = v - (v * v * v) / 3 + paramI;
                const p = toCanvas(v, w);
                if (v === -4) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            // Linear Recovery Nullcline
            ctx.strokeStyle = "#f59e0b";
            ctx.beginPath();
            ctx.moveTo(toCanvas(-4, (-4 + a) / b).x, toCanvas(-4, (-4 + a) / b).y);
            ctx.lineTo(toCanvas(4, (4 + a) / b).x, toCanvas(4, (4 + a) / b).y);
            ctx.stroke();
        }

        // Live Trajectory Probe
        if (mousePos) {
            const start = fromCanvas(mousePos.x, mousePos.y);
            const { dx, dy } = getDerivatives(start.x, start.y, paramI, mode, tauValue);
            setLiveState({ x: start.x, y: start.y, dx, dy });

            ctx.strokeStyle = mode === 'spike' ? "#10b981" : "#3b82f6";
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            let cur = { ...start };
            ctx.moveTo(mousePos.x, mousePos.y);
            
            for (let i = 0; i < 400; i++) {
                cur = rk4Step(cur.x, cur.y, paramI, mode, tauValue, 0.03);
                const p = toCanvas(cur.x, cur.y);
                ctx.lineTo(p.x, p.y);
                if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) break;
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

    }, [paramI, tauValue, mousePos, mode, getDerivatives, rk4Step]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const getLabels = (m: Mode) => {
        switch (m) {
            case 'leak': return {
                header: "Passive Membrane",
                xAxis: "Voltage (V)", yAxis: "y", param: "Input Current (I)",
                desc: "The Leak: Voltage always relaxes to the input equilibrium.",
                eq: "\\dot{V} = -(V - I)",
                color: "purple"
            };
            case 'time-constant': return {
                header: "Time Constant (τ)",
                xAxis: "Voltage (V)", yAxis: "y", param: "Input Current (I)",
                desc: "The Neuron's Memory: Adjust τ to change the speed of decay.",
                eq: "\\tau\\dot{V} = -V + I",
                color: "blue"
            };
            case 'fixed-points': return {
                header: "Equilibrium & Stability",
                xAxis: "x", yAxis: "y", param: "Damping (δ)",
                desc: "Observe how trajectories roll into the stable sink (Fixed Point).",
                eq: "\\dot{y} = -x - \\delta y",
                color: "cyan"
            };
            case 'spike': return {
                header: "FitzHugh-Nagumo Spike",
                xAxis: "Voltage (V)", yAxis: "Recovery (w)", param: "Applied Current (I)",
                desc: "Phase Plane: Spiking occurs when the fixed point becomes unstable.",
                eq: "\\dot{V} = V - \\frac{V^3}{3} - w + I",
                color: "emerald"
            };
        }
    };

    const labels = getLabels(mode);
    const content = getPhaseContent(mode);

    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden select-none">
            <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                <div className="flex items-center gap-4">
                    <Compass className={cn("w-5 h-5", mode === 'spike' ? "text-emerald-500" : "text-blue-500")} />
                    <h1 className="text-lg font-semibold tracking-tight text-white">
                        <Link href="/" className="hover:opacity-80 transition-opacity">ISCN</Link>
                        <span className="mx-3 text-zinc-700">/</span>
                        <span className="text-zinc-400 font-medium">Phase 2: Differential Equations</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                        <SelectTrigger className="w-[180px] h-9 bg-zinc-900 border-zinc-800 text-sm text-zinc-200 font-mono focus:ring-0">
                            <SelectValue placeholder="Select Lab" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="leak">1. The Leak</SelectItem>
                            <SelectItem value="time-constant">2. Time Constant (τ)</SelectItem>
                            <SelectItem value="fixed-points">3. Fixed Points</SelectItem>
                            <SelectItem value="spike">4. The Spike</SelectItem>
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
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Governing Equation</span>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 flex items-center justify-center border border-zinc-800/30 min-h-[100px] text-white">
                                <BlockMath math={labels.eq} />
                            </div>
                        </div>

                        {/* Parameter I Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 font-mono">{labels.param}</label>
                                <span className={cn("text-base font-bold font-mono", mode === 'spike' ? "text-emerald-400" : "text-blue-400")}>{paramI.toFixed(2)}</span>
                            </div>
                            <Slider
                                value={[paramI]} min={-1.0} max={1.5} step={0.01}
                                onValueChange={(val) => setParamI(val[0])}
                                className={cn("py-2", mode === 'spike' ? "[&_[role=slider]]:bg-emerald-500" : "[&_[role=slider]]:bg-blue-500")}
                            />
                        </div>

                        {/* Time Constant Slider - Conditional for Lab 2 & 4 */}
                        {(mode === 'time-constant' || mode === 'spike') && (
                            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Timer className="w-3 h-3 text-zinc-500" />
                                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 font-mono">Time Constant (τ)</label>
                                    </div>
                                    <span className="text-base font-bold font-mono text-white">{tauValue.toFixed(2)}</span>
                                </div>
                                <Slider
                                    value={[tauValue]} min={0.01} max={2.0} step={0.01}
                                    onValueChange={(val) => setTauValue(val[0])}
                                    className="py-2 [&_[role=slider]]:bg-white"
                                />
                                <p className="text-[10px] text-zinc-500 italic">Adjusts how fast the system evolves.</p>
                            </div>
                        )}

                        <div className="pt-6 border-t border-zinc-800/50 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Phase Portrait Probe</span>
                            <div className="text-sm font-bold font-mono text-white bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col gap-2">
                                {liveState ? (
                                    <>
                                        <div className="flex justify-between opacity-60 text-[10px]">
                                            <span>POS: ({liveState.x.toFixed(2)}, {liveState.y.toFixed(2)})</span>
                                            <span className="animate-pulse text-emerald-500 uppercase">Vector Active</span>
                                        </div>
                                        <div className="text-center pt-2 border-t border-zinc-800">
                                            <InlineMath math={`\\vec{V} = [${liveState.dx.toFixed(2)}, ${liveState.dy.toFixed(2)}]`} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-zinc-600 text-center py-2 italic text-xs">Hover to see flow...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative shadow-inner">
                    <div className="flex-1 relative cursor-crosshair">
                        <canvas
                            ref={canvasRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setMousePos(null)}
                            className="w-full h-full"
                        />
                        <div className="absolute bottom-4 right-6 text-xs font-bold text-zinc-600 font-mono">
                            {labels.xAxis} axis
                        </div>
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-600 font-mono">
                            {labels.yAxis} axis
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
