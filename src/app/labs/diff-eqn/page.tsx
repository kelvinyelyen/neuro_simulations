"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from 'next/link';
import { Slider } from "@/components/ui/slider";
import { FunctionSquare, Compass, Timer, Anchor, Activity, Zap, Settings2 } from "lucide-react";
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

// Strict Mode definition
type Mode = 'leak' | 'time-constant' | 'fixed-points' | 'spike';

export default function PhasePlanePage() {
    const [mode, setMode] = useState<Mode>('leak');
    const [paramI, setParamI] = useState(0.5); // Input Current (I)
    const [tau, setTau] = useState(1.0);       // Time Constant (tau)
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);
    const [liveState, setLiveState] = useState<{ x: number, y: number, dx: number, dy: number } | null>(null);

    // FHN Constants
    const a = 0.7;
    const b = 0.8;

    // The Physics Engine
    const getDerivatives = useCallback((x: number, y: number, p: number, m: Mode, t: number) => {
        switch (m) {
            case 'leak':
                // 1st Order ODE: dV/dt = -(V - I)
                return { dx: -(x - p), dy: -y }; 
            
            case 'time-constant':
                // Visualizing Memory: dV/dt = (-V + I) / tau
                return { dx: (-(x - p)) / t, dy: -y / t };

            case 'fixed-points':
                // 2D Linear System (Stable Sink shifted by p)
                return { dx: y, dy: -x - (0.5 * y) + p };

            case 'spike':
                // FitzHugh-Nagumo
                return {
                    dx: x - (x * x * x) / 3 - y + p,
                    dy: 0.08 * (x + a - b * y) 
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

        // 1. Draw Vector Field
        ctx.lineWidth = 1;
        for (let x = -6; x <= 6; x += 0.5) {
            for (let y = -4; y <= 4; y += 0.5) {
                const { dx, dy } = getDerivatives(x, y, paramI, mode, tau);
                const speed = Math.sqrt(dx * dx + dy * dy);
                const arrowScale = 0.25 / (speed + 0.5); 
                const start = toCanvas(x, y);
                const end = toCanvas(x + dx * arrowScale, y + dy * arrowScale);

                const opacity = Math.min(0.8, speed * 0.3 + 0.1);
                ctx.strokeStyle = `rgba(113, 113, 122, ${opacity})`;

                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(end.x, end.y, 1, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(113, 113, 122, ${opacity + 0.2})`;
                ctx.fill();
            }
        }

        // 2. Draw Nullclines & Fixed Points
        ctx.lineWidth = 2.5;

        if (mode === 'leak' || mode === 'time-constant') {
            ctx.strokeStyle = "#10b981"; 
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            const xTarget = toCanvas(paramI, 0).x;
            ctx.moveTo(xTarget, 0);
            ctx.lineTo(xTarget, height);
            ctx.stroke();
            ctx.setLineDash([]);

            const sink = toCanvas(paramI, 0);
            ctx.fillStyle = "#10b981";
            ctx.beginPath();
            ctx.arc(sink.x, sink.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
            ctx.beginPath();
            ctx.arc(sink.x, sink.y, 16, 0, Math.PI * 2);
            ctx.fill();

        } else if (mode === 'fixed-points') {
             ctx.strokeStyle = "#3b82f6";
             ctx.beginPath();
             ctx.moveTo(toCanvas(-6, 0).x, toCanvas(-6, 0).y);
             ctx.lineTo(toCanvas(6, 0).x, toCanvas(6, 0).y);
             ctx.stroke();
        } else if (mode === 'spike') {
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

        // 3. Live Probe Trajectory
        if (mousePos) {
            const start = fromCanvas(mousePos.x, mousePos.y);
            const { dx, dy } = getDerivatives(start.x, start.y, paramI, mode, tau);
            setLiveState({ x: start.x, y: start.y, dx, dy });

            ctx.strokeStyle = mode === 'spike' ? "#10b981" : "#3b82f6";
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            let cur = { ...start };
            ctx.moveTo(mousePos.x, mousePos.y);
            
            for (let i = 0; i < 500; i++) {
                cur = rk4Step(cur.x, cur.y, paramI, mode, tau, 0.03);
                const p = toCanvas(cur.x, cur.y);
                ctx.lineTo(p.x, p.y);
                if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) break;
            }
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            setLiveState(null);
        }

    }, [paramI, tau, mousePos, mode, getDerivatives, rk4Step, a, b]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const getLabels = (m: Mode) => {
        switch (m) {
            case 'leak': return {
                header: "The Leak (1st Order ODE)",
                xAxis: "Voltage (V)", yAxis: "Aux", param: "Input Current (I)",
                desc: "The fundamental unit of neural dynamics. Voltage always decays toward the resting state (or input level).",
                eq: "\\frac{dV}{dt} = -(V - I)",
                color: "purple"
            };
            case 'time-constant': return {
                header: "Time Constant (τ)",
                xAxis: "Voltage (V)", yAxis: "Aux", param: "Input Current (I)",
                desc: "Tau represents 'Memory'. A high τ means the neuron reacts slowly; a low τ means it reacts instantly.",
                eq: "\\tau \\frac{dV}{dt} = -(V - I)",
                color: "blue"
            };
            case 'fixed-points': return {
                header: "Fixed Points & Equilibrium",
                xAxis: "State x", yAxis: "State y", param: "Shift",
                desc: "The 'Sink' is where the system wants to settle. Stability is determined by the flow of the vector field.",
                eq: "\\vec{v} \\to \\vec{0}",
                color: "cyan"
            };
            case 'spike': return {
                header: "Phase Plane: The Spike",
                xAxis: "Voltage (V)", yAxis: "Recovery (w)", param: "Applied Current (I)",
                desc: "Visualizing the Limit Cycle. When I > threshold, the stable fixed point disappears, creating a spike.",
                eq: "\\dot{V} = V - V^3/3 - w + I",
                color: "emerald"
            };
        }
    };

    const labels = getLabels(mode);
    const content = getPhaseContent(mode);

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
                        <Compass className={cn("w-5 h-5", mode === 'spike' ? "text-emerald-500" : "text-blue-500")} />
                        <h1 className="text-lg font-semibold tracking-tight text-white">
                            <Link href="/" className="hover:opacity-80 transition-opacity">ISCN</Link>
                            <span className="mx-3 text-zinc-700">/</span>
                            <span className="text-zinc-400 font-medium">Phase 2: Differential Equations</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                            <SelectTrigger className="w-[180px] h-9 bg-zinc-900 border-zinc-800 text-sm text-zinc-200 font-mono focus:ring-0 outline-none">
                                <SelectValue placeholder="Select Lab" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="leak">1. The Leak</SelectItem>
                                <SelectItem value="time-constant">2. Time Constant (τ)</SelectItem>
                                <SelectItem value="fixed-points">3. Fixed Points</SelectItem>
                                <SelectItem value="spike">4. Phase Plane</SelectItem>
                            </SelectContent>
                        </Select>
                        <ConceptDialog {...content} />
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden p-6 gap-6">
                    {/* Left Panel: Sidebar - Fixed width 400px */}
                    <aside className="w-[400px] flex flex-col shrink-0 overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-sm">
                        
                        {/* Scrollable container with hidden scrollbar */}
                        <div className="h-full flex flex-col p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                            
                            {/* 1. TOP: Equation */}
                            <div className="space-y-6 shrink-0">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Governing Equation</span>
                                    </div>
                                    <div className="bg-black/30 rounded-xl p-4 flex flex-col items-center justify-center border border-zinc-800/30 min-h-[90px] text-zinc-200">
                                        <BlockMath math={labels.eq} />
                                    </div>
                                </div>
                            </div>

                            {/* 2. MIDDLE: Controls */}
                            <div className="flex-1 flex flex-col space-y-8 py-6">
                                
                                {/* Parameter Section */}
                                <div className="space-y-4 pt-6 border-t border-zinc-800/50">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Settings2 className="w-3.5 h-3.5 text-zinc-600" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">System Parameters</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 leading-tight">
                                            {labels.desc} 

[Image of Action Potential]

                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Input Current Slider */}
                                        <div className="space-y-2 p-2 rounded border border-zinc-800/30 bg-zinc-900/30">
                                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-3 h-3 text-amber-500" />
                                                    <span>{labels.param}</span>
                                                </div>
                                                <span className={cn("font-bold", mode === 'spike' ? "text-emerald-400" : "text-blue-400")}>{paramI.toFixed(2)}</span>
                                            </div>
                                            <Slider
                                                value={[paramI]} min={-1.0} max={1.5} step={0.01}
                                                onValueChange={(val) => setParamI(val[0])}
                                                className={cn("py-2", mode === 'spike' ? "[&_[role=slider]]:bg-emerald-500" : "[&_[role=slider]]:bg-blue-500")}
                                            />
                                        </div>

                                        {/* Time Constant Slider - Only visible in relevant modes */}
                                        {(mode === 'time-constant' || mode === 'leak') && (
                                            <div className="space-y-2 p-2 rounded border border-zinc-800/30 bg-zinc-900/30 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                                                    <div className="flex items-center gap-2">
                                                        <Timer className="w-3 h-3 text-zinc-500" />
                                                        <span>Time Constant (τ)</span>
                                                    </div>
                                                    <span className="text-white font-bold">{tau.toFixed(2)}</span>
                                                </div>
                                                <Slider
                                                    value={[tau]} min={0.1} max={3.0} step={0.1}
                                                    onValueChange={(val) => setTau(val[0])}
                                                    className="py-2 [&_[role=slider]]:bg-white"
                                                />
                                            </div>
                                        )}
                                    </div>
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
                            
                            {/* FLOATING PROBE HUD - Top Right Corner */}
                            <div className="absolute top-4 right-4 pointer-events-none">
                                <div className={cn(
                                    "backdrop-blur-md bg-zinc-950/80 border border-zinc-800/50 p-3 rounded-lg shadow-2xl transition-all duration-200",
                                    liveState ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                                )}>
                                    <div className="flex items-center gap-2 mb-2 border-b border-zinc-800/50 pb-2">
                                        <Anchor className="w-3 h-3 text-emerald-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Probe</span>
                                    </div>
                                    {liveState && (
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
                                            <div className="text-zinc-500">x (V):</div>
                                            <div className="text-zinc-200 text-right">{liveState.x.toFixed(2)}</div>
                                            
                                            <div className="text-zinc-500">y (w):</div>
                                            <div className="text-zinc-200 text-right">{liveState.y.toFixed(2)}</div>
                                            
                                            <div className="col-span-2 pt-2 mt-1 border-t border-zinc-800/50 text-center text-zinc-400">
                                                <InlineMath math={`\\dot{\\vec{x}} = [${liveState.dx.toFixed(2)}, ${liveState.dy.toFixed(2)}]`} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="absolute bottom-4 right-6 text-xs font-bold text-zinc-600 font-mono pointer-events-none">
                                {labels.xAxis} axis
                            </div>
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-600 font-mono pointer-events-none">
                                {labels.yAxis} axis
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
