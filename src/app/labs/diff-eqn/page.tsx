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
import { getPhaseContent } from './content';
import { InlineMath, BlockMath } from 'react-katex';




type Mode = 'math' | 'leak' | 'resonator' | 'spike';

export default function PhasePlanePage() {
    const [mode, setMode] = useState<Mode>('math');
    const [paramI, setParamI] = useState(0.5);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);
    const [liveState, setLiveState] = useState<{ x: number, y: number, dx: number, dy: number } | null>(null);

    // Constants & Scale
    const getScale = () => {
        return 100; // Consistent zoom for all neuro modes
    };
    const getOffset = () => {
        return { x: 500, y: 375 }; // Centered
    };

    // FHN Constants (Spike)
    const a = 0.7;
    const b = 0.8;
    const tau = 0.08;

    // Re-defined here to be accessible for both render and calculation
    const getDerivatives = (x: number, y: number, p: number, m: Mode) => {
        if (m === 'leak') {
            // Linear Leak: dx/dt = -x + I, dy/dt = -y (fast decay)
            return { dx: -x + p, dy: -y };
        } else if (m === 'resonator') {
            // Harmonic: Damped Oscillator
            const damping = Math.max(0, p); // parameter acts as damping
            return { dx: y, dy: -x - damping * y };
        } else if (m === 'spike') {
            // FHN
            return {
                dx: x - (x * x * x) / 3 - y + p,
                dy: tau * (x + a - b * y)
            };
        } else {
            // 'math' - Generic Cubic
            return {
                dx: x - (x * x * x) / 3 - y + p,
                dy: tau * (x + a - b * y)
            };
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const toCanvas = (x: number, y: number) => {
            const s = getScale();
            const o = getOffset();
            return {
                x: o.x + x * s,
                y: o.y - y * s
            };
        };

        const fromCanvas = (cx: number, cy: number) => {
            const s = getScale();
            const o = getOffset();
            return {
                x: (cx - o.x) / s,
                y: (o.y - cy) / s
            };
        }; ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Grid/Arrows
        // Draw Grid/Arrows
        ctx.strokeStyle = "rgba(82, 82, 91, 0.4)";
        ctx.fillStyle = "rgba(82, 82, 91, 0.6)";

        const rangeX = { min: -5.0, max: 5.0, step: 0.5 };
        const rangeY = { min: -4.0, max: 4.0, step: 0.5 };

        for (let x = rangeX.min; x <= rangeX.max; x += rangeX.step) {
            for (let y = rangeY.min; y <= rangeY.max; y += rangeY.step) {
                const { dx, dy } = getDerivatives(x, y, paramI, mode);
                const speed = Math.sqrt(dx * dx + dy * dy);
                if (speed < 0.01) continue;

                // Dynamic arrow scaling helps visualization
                const arrowScale = 0.3 / (speed * 0.5 + 0.5);
                const drawDx = dx * arrowScale;
                const drawDy = dy * arrowScale;
                const start = toCanvas(x, y);
                const end = toCanvas(x + drawDx, y + drawDy);

                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(end.x, end.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Nullclines
        ctx.lineWidth = 2;

        if (mode === 'leak') {
            // x-nullcline: -x + p = 0 => x = p (Vertical line)
            ctx.strokeStyle = "#10b981";
            ctx.beginPath();
            const xVal = paramI;
            ctx.moveTo(toCanvas(xVal, -4).x, toCanvas(xVal, -4).y);
            ctx.lineTo(toCanvas(xVal, 4).x, toCanvas(xVal, 4).y);
            ctx.stroke();

            // y-nullcline: -y = 0 => y = 0 (Horizontal line)
            ctx.strokeStyle = "#f59e0b";
            ctx.beginPath();
            ctx.moveTo(toCanvas(-5, 0).x, toCanvas(-5, 0).y);
            ctx.lineTo(toCanvas(5, 0).x, toCanvas(5, 0).y);
            ctx.stroke();

            // Stable FP at (p, 0)
            const fpC = toCanvas(xVal, 0);
            ctx.fillStyle = "#fafafa";
            ctx.beginPath(); ctx.arc(fpC.x, fpC.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        } else if (mode === 'resonator') {
            // x-nullcline: y = 0 (Horizontal)
            ctx.strokeStyle = "#10b981";
            ctx.beginPath();
            ctx.moveTo(toCanvas(-5, 0).x, toCanvas(-5, 0).y);
            ctx.lineTo(toCanvas(5, 0).x, toCanvas(5, 0).y);
            ctx.stroke();

            // y-nullcline: -x - dy = 0 => x = -dy
            const d = Math.max(0, paramI);
            ctx.strokeStyle = "#f59e0b";
            ctx.beginPath();
            // x = -d*y
            if (d > 0.01) {
                // draw line x = -d * y  -> y = -x/d
                const start = toCanvas(-5, 5 / d);
                const end = toCanvas(5, -5 / d);
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
            } else {
                // x = 0 (Vertical)
                ctx.moveTo(toCanvas(0, -4).x, toCanvas(0, -4).y);
                ctx.lineTo(toCanvas(0, 4).x, toCanvas(0, 4).y);
            }
            ctx.stroke();

            // FP at 0,0
            const fpC = toCanvas(0, 0);
            ctx.fillStyle = "#fafafa";
            ctx.beginPath(); ctx.arc(fpC.x, fpC.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        } else {
            // 'spike' (FHN) & 'math'
            const vNullcline = (v: number) => v - (v * v * v) / 3 + paramI;
            const wNullcline = (v: number) => (v + a) / b;

            ctx.strokeStyle = "#10b981";
            ctx.beginPath();
            for (let v = -4; v <= 4; v += 0.05) {
                const w = vNullcline(v);
                const pos = toCanvas(v, w);
                if (v === -4) ctx.moveTo(pos.x, pos.y);
                else ctx.lineTo(pos.x, pos.y);
            }
            ctx.stroke();

            ctx.strokeStyle = "#f59e0b";
            ctx.beginPath();
            const startLin = toCanvas(-4, wNullcline(-4));
            const endLin = toCanvas(4, wNullcline(4));
            ctx.moveTo(startLin.x, startLin.y);
            ctx.lineTo(endLin.x, endLin.y);
            ctx.stroke();

            // FP Solve
            let v = 0;
            // Newton's method to find intersection
            for (let i = 0; i < 10; i++) {
                const val = (b / 3) * Math.pow(v, 3) + (1 - b) * v + (a - b * paramI);
                const deriv = b * v * v + (1 - b);
                v = v - val / deriv;
            }
            const w = wNullcline(v);
            const fp = toCanvas(v, w);
            ctx.fillStyle = "#fafafa";
            ctx.beginPath(); ctx.arc(fp.x, fp.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }

        // Ghost Trace & Live State Calculation
        if (mousePos) {
            const startState = fromCanvas(mousePos.x, mousePos.y);

            // Calculate current Math State for UI
            const { dx, dy } = getDerivatives(startState.x, startState.y, paramI, mode);
            setLiveState({ x: startState.x, y: startState.y, dx, dy });

            ctx.strokeStyle = mode === 'spike' ? "#10b981" : mode === 'leak' ? "#a855f7" : mode === 'resonator' ? "#06b6d4" : "#3b82f6";
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            let currX = startState.x;
            let currY = startState.y;
            ctx.moveTo(mousePos.x, mousePos.y);
            const dt = 0.02;
            const steps = 500;

            for (let i = 0; i < steps; i++) {
                const { dx, dy } = getDerivatives(currX, currY, paramI, mode);
                currX += dx * dt;
                currY += dy * dt;
                const pos = toCanvas(currX, currY);
                ctx.lineTo(pos.x, pos.y);
                if (pos.x < -100 || pos.x > canvas.width + 100 || pos.y < -100 || pos.y > canvas.height + 100) break;
            }
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            setLiveState(null);
        }

    }, [paramI, mousePos, mode]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        setMousePos({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        });
    };

    const getLabels = (m: Mode) => {
        switch (m) {
            case 'math': return {
                header: "Vector Field Analysis",
                xAxis: "x",
                yAxis: "y",
                param: "Parameter c",
                desc: "Explore the abstract Phase Plane.",
                eq: "\\begin{cases} \\dot{x} = x - \\frac{x^3}{3} - y + c \\\\ \\tau \\dot{y} = x + a - by \\end{cases}",
                color: "blue",
                live: (s: { x: number, y: number, dx: number, dy: number }) => `\\begin{aligned} \\dot{x} &= ${s.x.toFixed(2)} - ... = \\mathbf{${s.dx.toFixed(2)}} \\\\ \\dot{y} &= ... = \\mathbf{${s.dy.toFixed(2)}} \\end{aligned}`
            };
            case 'leak': return {
                header: "Linear Leak",
                xAxis: "Voltage (V)",
                yAxis: "Aux (y)",
                param: "Input Current (I)",
                desc: "A passive membrane acting like a leaky capacitor. The system always relaxes to Rest.",
                eq: "\\begin{cases} \\dot{V} = -V + I \\\\ \\dot{y} = -y \\end{cases}",
                color: "purple",
                live: (s: { x: number, y: number, dx: number, dy: number }) => `\\begin{aligned} \\dot{V} &= -${s.x.toFixed(2)} + ${paramI.toFixed(2)} = \\mathbf{${s.dx.toFixed(2)}} \\\\ \\dot{y} &= -${s.y.toFixed(2)} = \\mathbf{${s.dy.toFixed(2)}} \\end{aligned}`
            };
            case 'resonator': return {
                header: "The Resonator",
                xAxis: "Voltage (V)",
                yAxis: "Current (w)",
                param: "Damping (δ)",
                desc: "Interaction between two currents creates oscillations. With damping, they settle down.",
                eq: "\\begin{cases} \\dot{V} = w \\\\ \\dot{w} = -V - \\delta w \\end{cases}",
                color: "cyan",
                live: (s: { x: number, y: number, dx: number, dy: number }) => `\\begin{aligned} \\dot{V} &= ${s.y.toFixed(2)} \\\\ \\dot{w} &= -${s.x.toFixed(2)} - \\delta(${s.y.toFixed(2)}) = \\mathbf{${s.dy.toFixed(2)}} \\end{aligned}`
            };
            case 'spike': return {
                header: "The Spike",
                xAxis: "Voltage (V)",
                yAxis: "Recovery (w)",
                param: "Input Current (I)",
                desc: "Excitability! Pushing past the threshold triggers a massive excursion (Action Potential).",
                eq: "\\begin{cases} \\dot{V} = V - \\frac{V^3}{3} - w + I \\\\ \\tau \\dot{w} = V + a - bw \\end{cases}",
                color: "emerald",
                live: (s: { x: number, y: number, dx: number, dy: number }) => `\\begin{aligned} \\dot{V} &= V - V^3/3 - w + I = \\mathbf{${s.dx.toFixed(2)}} \\\\ \\dot{w} &= \\tau(V + a - bw) = \\mathbf{${s.dy.toFixed(2)}} \\end{aligned}`
            };
        }
    };

    const labels = getLabels(mode);
    const content = getPhaseContent(mode);

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
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", `bg-${labels.color}-500`)} />
                        <h1 className="text-lg font-bold tracking-tight text-white">
                            <Link href="/" className="hover:text-emerald-400 transition-colors">ISCN</Link> <span className="text-zinc-400 font-normal text-base">| Membrane Dynamics</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                            <SelectTrigger className="w-[180px] h-8 bg-zinc-900 border-zinc-800 text-xs text-zinc-200">
                                <SelectValue placeholder="Select Context" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 max-h-[400px]">
                                <SelectItem value="math" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Phase Plane</span>
                                </SelectItem>
                                <SelectItem value="leak" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /> Linear Leak</span>
                                </SelectItem>
                                <SelectItem value="resonator" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Resonator</span>
                                </SelectItem>
                                <SelectItem value="spike" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> The Spike</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="h-4 w-px bg-zinc-800" />

                        <ConceptDialog {...content} />
                    </div>
                </header>

                <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden h-full">

                    {/* LEFT COLUMN: Controls */}
                    <div className="col-span-4 lg:col-span-3 flex flex-col border-r border-zinc-900 bg-zinc-900/30 relative">
                        <div className="absolute inset-0 overflow-y-auto scrollbar-hide p-6 space-y-6">

                            {/* Visualizer Status - Replaced with Equation Block */}
                            <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg shadow-sm text-center">
                                <h2 className="text-xs text-zinc-400 uppercase tracking-widest mb-3 font-semibold">System Equations</h2>
                                <div className="text-sm text-zinc-300">
                                    <BlockMath>{labels.eq}</BlockMath>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="space-y-6">
                                <div className="space-y-3 p-3 rounded border border-zinc-800/50 bg-zinc-900/30">
                                    <label className="flex justify-between text-[10px] text-zinc-400 uppercase">
                                        <span>{labels.param}</span>
                                        <span className="font-mono text-zinc-200">{paramI.toFixed(2)}</span>
                                    </label>
                                    <Slider
                                        value={[paramI]}
                                        min={-1.0}
                                        max={1.5}
                                        step={0.01}
                                        onValueChange={(val) => setParamI(val[0])}
                                        className="[&>.bg-primary]:bg-emerald-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                                        <span>Low</span>
                                        <span>Med</span>
                                        <span>High</span>
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] uppercase text-zinc-500 tracking-widest">Geometry</h3>

                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-zinc-300">Nullcline 1 <InlineMath>{"\\dot{x}=0"}</InlineMath></span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <span className="text-zinc-300">Nullcline 2 <InlineMath>{"\\dot{y}=0"}</InlineMath></span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-3 h-3 rounded-full bg-zinc-100 border border-zinc-500"></div>
                                    <span className="text-zinc-300">Fixed Point <InlineMath>{"(\\dot{x}=\\dot{y}=0)"}</InlineMath></span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className={`w-8 h-0.5 border-t-2 border-dashed border-${labels.color}-500`}></div>
                                    <span className="text-zinc-300">Trajectory</span>
                                </div>
                            </div>

                            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded text-xs text-zinc-400 leading-relaxed">
                                {labels.desc}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Visuals */}
                    <div className="col-span-8 lg:col-span-9 bg-zinc-950 relative overflow-hidden h-full w-full flex flex-col items-center justify-center p-4">

                        {/* Canvas Container - Flex Centered with explicit Aspect Ratio constraints */}
                        <div
                            className="relative border border-zinc-800 rounded bg-zinc-925 shadow-2xl"
                            style={{
                                aspectRatio: '1000/750',
                                width: 'auto',
                                height: 'auto',
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                width={1000}
                                height={750}
                                className="w-full h-full cursor-crosshair block"
                                onMouseMove={handleMouseMove}
                                onMouseLeave={() => setMousePos(null)}
                            />

                            {/* Live Probe Overlay */}
                            {liveState && (
                                <div className="absolute top-4 left-4 p-4 bg-black/80 backdrop-blur-md border border-zinc-800 rounded text-zinc-200 shadow-xl pointer-events-none z-20 max-w-sm">
                                    <h4 className="text-[10px] uppercase text-zinc-500 tracking-widest mb-2 font-semibold flex items-center gap-2">
                                        <Activity size={12} /> Live Probe
                                    </h4>
                                    <div className="text-xs space-y-1 font-mono text-zinc-400 mb-3 border-b border-zinc-800 pb-2">
                                        <div>x: {liveState.x.toFixed(2)}</div>
                                        <div>y: {liveState.y.toFixed(2)}</div>
                                    </div>
                                    <div className="text-xs">
                                        <BlockMath>{labels.live(liveState)}</BlockMath>
                                    </div>
                                </div>
                            )}

                            {/* Axis Labels */}
                            <div className="absolute bottom-2 right-4 text-xs font-bold text-zinc-500 bg-zinc-900/80 px-2 py-1 rounded backdrop-blur-md border border-zinc-800">
                                {labels.xAxis} &rarr;
                            </div>
                            <div className="absolute top-4 right-1/2 translate-x-1/2 text-xs font-bold text-zinc-500 bg-zinc-900/80 px-2 py-1 rounded backdrop-blur-md border border-zinc-800">
                                &uarr; {labels.yAxis}
                            </div>

                            <div className="absolute bottom-4 left-4 text-[10px] uppercase text-zinc-600 bg-zinc-950/50 px-2 py-1 rounded border border-zinc-800 opacity-50">
                                {labels.header}
                            </div>
                        </div>

                    </div>

                </main>
            </div>
        </div>
    );
}

// Add the Mode type definition back since I'm replacing the whole function body

