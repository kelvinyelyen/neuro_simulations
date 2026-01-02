"use client";

import React, { useState, useEffect, useRef, useCallback } from "react"; // Added useCallback
import Link from 'next/link';
import { Slider } from "@/components/ui/slider";
import { FunctionSquare, Compass } from "lucide-react"; // Removed Activity
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

type Mode = 'math' | 'leak' | 'resonator' | 'spike';

export default function PhasePlanePage() {
    const [mode, setMode] = useState<Mode>('math');
    const [paramI, setParamI] = useState(0.5);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);
    const [liveState, setLiveState] = useState<{ x: number, y: number, dx: number, dy: number } | null>(null);

    const a = 0.7;
    const b = 0.8;
    const tau = 0.08;

    // Fixed: Wrapped in useCallback to satisfy useEffect dependency
    const getDerivatives = useCallback((x: number, y: number, p: number, m: Mode) => {
        if (m === 'leak') {
            return { dx: -x + p, dy: -y };
        } else if (m === 'resonator') {
            const damping = Math.max(0, p);
            return { dx: y, dy: -x - damping * y };
        } else {
            return {
                dx: x - (x * x * x) / 3 - y + p,
                dy: tau * (x + a - b * y)
            };
        }
    }, [a, b, tau]);

    // Fixed: Wrapped in useCallback
    const rk4Step = useCallback((x: number, y: number, p: number, m: Mode, dt: number) => {
        const k1 = getDerivatives(x, y, p, m);
        const k2 = getDerivatives(x + k1.dx * dt / 2, y + k1.dy * dt / 2, p, m);
        const k3 = getDerivatives(x + k2.dx * dt / 2, y + k2.dy * dt / 2, p, m);
        const k4 = getDerivatives(x + k3.dx * dt, y + k3.dy * dt, p, m);
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

        // Fixed Error 150:17: Replaced ternary expression with proper conditional logic
        ctx.strokeStyle = "rgba(113, 113, 122, 0.25)";
        ctx.lineWidth = 1;
        for (let x = -6; x <= 6; x += 0.5) {
            for (let y = -4; y <= 4; y += 0.5) {
                const { dx, dy } = getDerivatives(x, y, paramI, mode);
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

        ctx.lineWidth = 2.5;
        if (mode === 'leak') {
            ctx.strokeStyle = "#10b981";
            ctx.beginPath();
            ctx.moveTo(toCanvas(paramI, -4).x, toCanvas(paramI, -4).y);
            ctx.lineTo(toCanvas(paramI, 4).x, toCanvas(paramI, 4).y);
            ctx.stroke();

            ctx.strokeStyle = "#f59e0b";
            ctx.beginPath();
            ctx.moveTo(toCanvas(-6, 0).x, toCanvas(-6, 0).y);
            ctx.lineTo(toCanvas(6, 0).x, toCanvas(6, 0).y);
            ctx.stroke();
        } else if (mode === 'resonator') {
            ctx.strokeStyle = "#10b981";
            ctx.beginPath();
            ctx.moveTo(toCanvas(-6, 0).x, toCanvas(-6, 0).y);
            ctx.lineTo(toCanvas(6, 0).x, toCanvas(6, 0).y);
            ctx.stroke();

            ctx.strokeStyle = "#f59e0b";
            ctx.beginPath();
            const d = Math.max(0.01, paramI);
            ctx.moveTo(toCanvas(-4, 4 / d).x, toCanvas(-4, 4 / d).y);
            ctx.lineTo(toCanvas(4, -4 / d).x, toCanvas(4, -4 / d).y);
            ctx.stroke();
        } else {
            ctx.strokeStyle = "#10b981";
            ctx.beginPath();
            for (let v = -4; v <= 4; v += 0.05) {
                const w = v - (v * v * v) / 3 + paramI;
                const p = toCanvas(v, w);
                if (v === -4) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();

            ctx.strokeStyle = "#f59e0b";
            ctx.beginPath();
            ctx.moveTo(toCanvas(-4, (-4 + a) / b).x, toCanvas(-4, (-4 + a) / b).y);
            ctx.lineTo(toCanvas(4, (4 + a) / b).x, toCanvas(4, (4 + a) / b).y);
            ctx.stroke();
        }

        if (mousePos) {
            const start = fromCanvas(mousePos.x, mousePos.y);
            const { dx, dy } = getDerivatives(start.x, start.y, paramI, mode);
            setLiveState({ x: start.x, y: start.y, dx, dy });

            ctx.strokeStyle = mode === 'spike' ? "#10b981" : "#3b82f6";
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            let cur = { ...start };
            ctx.moveTo(mousePos.x, mousePos.y);
            
            for (let i = 0; i < 400; i++) {
                cur = rk4Step(cur.x, cur.y, paramI, mode, 0.03);
                const p = toCanvas(cur.x, cur.y);
                ctx.lineTo(p.x, p.y);
                if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) break;
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

    }, [paramI, mousePos, mode, getDerivatives, rk4Step, a, b]); // Included useCallback hooks as dependencies

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const getLabels = (m: Mode) => {
        switch (m) {
            case 'math': return {
                header: "Nonlinear Dynamics",
                xAxis: "x", yAxis: "y", param: "Control Parameter (c)",
                desc: "Analyze the topology of a generic cubic system.",
                eq: "\\dot{x} = x - \\frac{x^3}{3} - y + c",
                color: "blue"
            };
            case 'leak': return {
                header: "Passive Membrane",
                xAxis: "Voltage (V)", yAxis: "Aux (y)", param: "Input Current (I)",
                desc: "A linear system where trajectories always relax to a stable fixed point.",
                eq: "\\dot{V} = -V + I",
                color: "purple"
            };
            case 'resonator': return {
                header: "Resonator Node",
                xAxis: "Voltage (V)", yAxis: "Recovery (w)", param: "Damping (δ)",
                desc: "Linear oscillations created by negative feedback.",
                eq: "\\dot{V} = w, \\quad \\dot{w} = -V - \\delta w",
                color: "cyan"
            };
            case 'spike': return {
                header: "FitzHugh-Nagumo",
                xAxis: "Voltage (V)", yAxis: "Recovery (w)", param: "Applied Current (I)",
                desc: "The fundamental model for neural excitability and spiking.",
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
                        <span className="text-zinc-400 font-medium">Phase Plane Analysis</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                        <SelectTrigger className="w-[180px] h-9 bg-zinc-900 border-zinc-800 text-sm text-zinc-200 font-mono focus:ring-0">
                            <SelectValue placeholder="Select Context" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="math">Phase Plane</SelectItem>
                            <SelectItem value="leak">Linear Leak</SelectItem>
                            <SelectItem value="resonator">Resonator</SelectItem>
                            <SelectItem value="spike">The Spike</SelectItem>
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
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">System Model</span>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 flex items-center justify-center border border-zinc-800/30 min-h-[100px] text-white">
                                <BlockMath math={labels.eq} />
                            </div>
                        </div>

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
                            <p className="text-xs text-zinc-500 leading-relaxed italic">{labels.desc}</p>
                        </div>

                        <div className="pt-6 border-t border-zinc-800/50 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Real-time Probe</span>
                            <div className="text-sm font-bold font-mono text-white bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col gap-2">
                                {liveState ? (
                                    <>
                                        <div className="flex justify-between opacity-60 text-[10px]">
                                            <span>POS: ({liveState.x.toFixed(2)}, {liveState.y.toFixed(2)})</span>
                                            <span className="animate-pulse text-emerald-500 uppercase">Tracking</span>
                                        </div>
                                        <div className="text-center pt-2 border-t border-zinc-800">
                                            <InlineMath math={`\\vec{v} = [${liveState.dx.toFixed(2)}, ${liveState.dy.toFixed(2)}]`} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-zinc-600 text-center py-2 italic text-xs">Hover to probe field...</div>
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
                    
                    <div className="p-4 px-10 border-t border-zinc-800/50 flex justify-between items-center bg-zinc-950/50">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", mode === 'spike' ? "bg-emerald-500" : "bg-blue-500")} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">Engine: Phase_Plane_RK4</span>
                        </div>
                        <span className="text-[10px] text-zinc-700 uppercase tracking-widest font-mono">Precision: High_Res_DPR</span>
                    </div>
                </section>
            </main>
        </div>
    );
}
