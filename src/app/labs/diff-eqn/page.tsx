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




type Mode = 'math' | 'eco' | 'neuro' | 'exp' | 'harmonic' | 'logistic';

export default function PhasePlanePage() {
    const [mode, setMode] = useState<Mode>('math');
    const [paramI, setParamI] = useState(0.5);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);
    const [liveState, setLiveState] = useState<{ x: number, y: number, dx: number, dy: number } | null>(null);

    // Constants & Scale
    const getScale = (m: Mode) => {
        if (m === 'eco' || m === 'logistic') return 80; // Zoom in a bit more for eco/logistic since range is small
        return 100; // Zoom in for math/neuro
    };
    const getOffset = (m: Mode) => {
        if (m === 'eco') return { x: 50, y: 750 }; // Bottom-left
        if (m === 'logistic') return { x: 50, y: 750 }; // Bottom-left
        return { x: 500, y: 400 }; // Centered
    };

    // FHN Constants
    const a = 0.7;
    const b = 0.8;
    const tau = 0.08;

    // LV Constants
    const beta = 0.5;
    const delta = 0.5;
    const gamma = 1.0;

    // Logistic Constants
    const K = 4.0;
    const r = 0.8;

    // Re-defined here to be accessible for both render and calculation
    const getDerivatives = (x: number, y: number, p: number, m: Mode) => {
        if (m === 'eco') {
            const alpha = 1.0 + p * 0.5;
            return { dx: alpha * x - beta * x * y, dy: delta * x * y - gamma * y };
        } else if (m === 'logistic') {
            const rMod = r + p * 0.5;
            return { dx: rMod * x * (1 - x / K), dy: -y };
        } else if (m === 'exp') {
            return { dx: x + p, dy: -y };
        } else if (m === 'harmonic') {
            const damping = Math.max(0, p);
            return { dx: y, dy: -x - damping * y };
        } else {
            // FHN
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

        const scale = getScale(mode);
        const offset = getOffset(mode);

        const toCanvas = (x: number, y: number) => ({
            x: x * scale + offset.x,
            y: -y * scale + offset.y
        });

        const fromCanvas = (cx: number, cy: number) => ({
            x: (cx - offset.x) / scale,
            y: -(cy - offset.y) / scale
        });

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Grid/Arrows
        ctx.strokeStyle = "rgba(82, 82, 91, 0.4)";
        ctx.fillStyle = "rgba(82, 82, 91, 0.6)";

        let rangeX = { min: -5.0, max: 5.0, step: 0.5 };
        let rangeY = { min: -4.0, max: 4.0, step: 0.5 };

        if (mode === 'eco' || mode === 'logistic') {
            rangeX = { min: -0.5, max: 10.0, step: 0.5 };
            rangeY = { min: -0.5, max: 8.0, step: 0.5 };
        }

        for (let x = rangeX.min; x <= rangeX.max; x += rangeX.step) {
            for (let y = rangeY.min; y <= rangeY.max; y += rangeY.step) {
                const { dx, dy } = getDerivatives(x, y, paramI, mode);
                const speed = Math.sqrt(dx * dx + dy * dy);
                if (speed < 0.01) continue;

                const arrowScale = 0.3 / (speed + 0.5);
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

        if (mode === 'eco') {
            const alpha = 1.0 + paramI * 0.5;
            const yLine = alpha / beta;
            const xLine = gamma / delta;

            ctx.strokeStyle = "#10b981"; // Emerald
            ctx.beginPath();
            ctx.moveTo(toCanvas(0, yLine).x, toCanvas(0, yLine).y);
            ctx.lineTo(toCanvas(10, yLine).x, toCanvas(10, yLine).y);
            ctx.moveTo(toCanvas(0, 0).x, toCanvas(0, 0).y);
            ctx.lineTo(toCanvas(0, 8).x, toCanvas(0, 8).y); // y-axis
            ctx.stroke();

            ctx.strokeStyle = "#f59e0b"; // Amber
            ctx.beginPath();
            ctx.moveTo(toCanvas(xLine, 0).x, toCanvas(xLine, 0).y);
            ctx.lineTo(toCanvas(xLine, 8).x, toCanvas(xLine, 8).y);
            ctx.moveTo(toCanvas(0, 0).x, toCanvas(0, 0).y);
            ctx.lineTo(toCanvas(10, 0).x, toCanvas(10, 0).y); // x-axis
            ctx.stroke();

            // FP
            const fpC = toCanvas(xLine, yLine);
            ctx.fillStyle = "#fafafa";
            ctx.beginPath(); ctx.arc(fpC.x, fpC.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        } else if (mode === 'logistic') {
            ctx.strokeStyle = "#10b981"; // X-nullcline
            ctx.beginPath();
            // x=K
            ctx.moveTo(toCanvas(K, -1).x, toCanvas(K, -1).y);
            ctx.lineTo(toCanvas(K, 8).x, toCanvas(K, 8).y);
            ctx.stroke();

            ctx.strokeStyle = "#f59e0b"; // Y-nullcline (y=0)
            ctx.beginPath();
            ctx.moveTo(toCanvas(0, 0).x, toCanvas(0, 0).y);
            ctx.lineTo(toCanvas(10, 0).x, toCanvas(10, 0).y);
            ctx.stroke();

            // Stable FP at (K, 0)
            const fpC = toCanvas(K, 0);
            ctx.fillStyle = "#fafafa";
            ctx.beginPath(); ctx.arc(fpC.x, fpC.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        } else if (mode === 'harmonic') {
            ctx.strokeStyle = "#10b981";
            ctx.beginPath();
            ctx.moveTo(toCanvas(-5, 0).x, toCanvas(-5, 0).y);
            ctx.lineTo(toCanvas(5, 0).x, toCanvas(5, 0).y);
            ctx.stroke();

            const d = Math.max(0, paramI);
            if (d > 0.01) {
                ctx.strokeStyle = "#f59e0b";
                ctx.beginPath();
                // y = -x/d
                const start = toCanvas(-5, 5 / d);
                const end = toCanvas(5, -5 / d);
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            } else {
                ctx.strokeStyle = "#f59e0b";
                ctx.beginPath();
                ctx.moveTo(toCanvas(0, -4).x, toCanvas(0, -4).y);
                ctx.lineTo(toCanvas(0, 4).x, toCanvas(0, 4).y);
                ctx.stroke();
            }

            // FP at 0,0
            const fpC = toCanvas(0, 0);
            ctx.fillStyle = "#fafafa";
            ctx.beginPath(); ctx.arc(fpC.x, fpC.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        } else if (mode === 'exp') {
            ctx.strokeStyle = "#10b981";
            ctx.beginPath();
            const xVal = -paramI;
            ctx.moveTo(toCanvas(xVal, -4).x, toCanvas(xVal, -4).y);
            ctx.lineTo(toCanvas(xVal, 4).x, toCanvas(xVal, 4).y);
            ctx.stroke();

            ctx.strokeStyle = "#f59e0b";
            ctx.beginPath();
            ctx.moveTo(toCanvas(-5, 0).x, toCanvas(-5, 0).y);
            ctx.lineTo(toCanvas(5, 0).x, toCanvas(5, 0).y);
            ctx.stroke();

            // Saddle at (-p, 0)
            const fpC = toCanvas(xVal, 0);
            ctx.fillStyle = "#fafafa";
            ctx.beginPath(); ctx.arc(fpC.x, fpC.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        } else {
            // FHN
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

            ctx.strokeStyle = mode === 'neuro' ? "#ec4899" : mode === 'eco' ? "#f59e0b" : "#3b82f6";
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            let currX = startState.x;
            let currY = startState.y;
            ctx.moveTo(mousePos.x, mousePos.y);
            const dt = 0.02;
            const steps = (mode === 'eco' || mode === 'exp' || mode === 'logistic') ? 1200 : 400;

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
                desc: "Generic Cubic System (FHN).",
                eq: "\\begin{cases} \\dot{x} = x - \\frac{x^3}{3} - y + c \\\\ \\tau \\dot{y} = x + a - by \\end{cases}",
                color: "blue",
                live: (s: { x: number, y: number, dx: number, dy: number }) => `\\begin{aligned} \\dot{x} &= ${s.x.toFixed(2)} - \\frac{(${s.x.toFixed(2)})^3}{3} - ${s.y.toFixed(2)} + ${paramI.toFixed(2)} = \\mathbf{${s.dx.toFixed(2)}} \\\\ \\dot{y} &= \\tau(${s.x.toFixed(2)} + a - b(${s.y.toFixed(2)})) = \\mathbf{${s.dy.toFixed(2)}} \\end{aligned}`
            };
            case 'eco': return {
                header: "Predator-Prey Dynamics",
                xAxis: "Prey",
                yAxis: "Predator",
                param: "Prey Growth Rate (α)",
                desc: "Lotka-Volterra equations.",
                eq: "\\begin{cases} \\dot{x} = \\alpha x - \\beta xy \\\\ \\dot{y} = \\delta xy - \\gamma y \\end{cases}",
                color: "amber",
                live: (s: { x: number, y: number, dx: number, dy: number }) => `\\begin{aligned} \\dot{x} &= ${(1 + paramI * 0.5).toFixed(2)}(${s.x.toFixed(2)}) - ${beta}(${s.x.toFixed(2)})(${s.y.toFixed(2)}) = \\mathbf{${s.dx.toFixed(2)}} \\\\ \\dot{y} &= ${delta}(${s.x.toFixed(2)})(${s.y.toFixed(2)}) - ${gamma}(${s.y.toFixed(2)}) = \\mathbf{${s.dy.toFixed(2)}} \\end{aligned}`
            };
            case 'neuro': return {
                header: "Excitable Dynamics",
                xAxis: "Voltage (V)",
                yAxis: "Recovery (w)",
                param: "Input Current (I)",
                desc: "FitzHugh-Nagumo Model.",
                eq: "\\begin{cases} \\dot{V} = V - \\frac{V^3}{3} - w + I \\\\ \\tau \\dot{w} = V + a - bw \\end{cases}",
                color: "emerald",
                live: (s: { x: number, y: number, dx: number, dy: number }) => `\\begin{aligned} \\dot{V} &= ... = \\mathbf{${s.dx.toFixed(2)}} \\\\ \\dot{w} &= ... = \\mathbf{${s.dy.toFixed(2)}} \\end{aligned}`
            };
            case 'exp': return {
                header: "Exponential Growth/Decay",
                xAxis: "x (Growth)",
                yAxis: "y (Decay)",
                param: "Bias (c)",
                desc: "Fundamental linear dynamics.",
                eq: "\\begin{cases} \\dot{x} = x + c \\\\ \\dot{y} = -y \\end{cases}",
                color: "purple",
                live: (s: { x: number, y: number, dx: number, dy: number }) => `\\begin{aligned} \\dot{x} &= ${s.x.toFixed(2)} + ${paramI.toFixed(2)} = \\mathbf{${s.dx.toFixed(2)}} \\\\ \\dot{y} &= -${s.y.toFixed(2)} = \\mathbf{${s.dy.toFixed(2)}} \\end{aligned}`
            };
            case 'harmonic': return {
                header: "Harmonic Oscillator",
                xAxis: "Position (x)",
                yAxis: "Velocity (v)",
                param: "Damping (δ)",
                desc: "Springs and Pendulums.",
                eq: "\\begin{cases} \\dot{x} = v \\\\ \\dot{v} = -x - \\delta v \\end{cases}",
                color: "cyan",
                live: (s: { x: number, y: number, dx: number, dy: number }) => `\\begin{aligned} \\dot{x} &= ${s.y.toFixed(2)} \\\\ \\dot{v} &= -${s.x.toFixed(2)} - \\delta(${s.y.toFixed(2)}) = \\mathbf{${s.dy.toFixed(2)}} \\end{aligned}`
            };
            case 'logistic': return {
                header: "Logistic Growth",
                xAxis: "Population (x)",
                yAxis: "Decay (y)",
                param: "Rate Mod (r)",
                desc: "Population with carrying capacity.",
                eq: "\\begin{cases} \\dot{x} = r x (1 - \\frac{x}{K}) \\\\ \\dot{y} = -y \\end{cases}",
                color: "rose",
                live: (s: { x: number, y: number, dx: number, dy: number }) => `\\begin{aligned} \\dot{x} &= r(${s.x.toFixed(2)})(1 - \\frac{${s.x.toFixed(2)}}{${K}}) = \\mathbf{${s.dx.toFixed(2)}} \\\\ \\dot{y} &= -${s.y.toFixed(2)} \\end{aligned}`
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
                            <Link href="/" className="hover:text-emerald-400 transition-colors">ISCN</Link> <span className="text-zinc-400 font-normal text-base">| {labels.header}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
                            <SelectTrigger className="w-[180px] h-8 bg-zinc-900 border-zinc-800 text-xs text-zinc-200">
                                <SelectValue placeholder="Select Context" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 max-h-[400px]">
                                <SelectItem value="math" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Pure Math</span>
                                </SelectItem>
                                <SelectItem value="eco" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Ecosystem</span>
                                </SelectItem>
                                <SelectItem value="neuro" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Neuroscience</span>
                                </SelectItem>
                                <SelectItem value="exp" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /> Exponential</span>
                                </SelectItem>
                                <SelectItem value="harmonic" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Harmonic Osc</span>
                                </SelectItem>
                                <SelectItem value="logistic" className="text-zinc-300 focus:text-white focus:bg-zinc-800 cursor-pointer">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /> Logistic Map</span>
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

