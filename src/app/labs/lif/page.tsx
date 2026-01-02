'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSimulationStore } from '@/store/simulation';
import { ForceBalance } from '@/components/viz/ForceBalance';
import { ConceptDialog } from '@/components/guide/ConceptDialog';
import { lifContent } from './content';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Play, Pause, RotateCcw, Activity, FunctionSquare } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    ReferenceLine,
    Tooltip,
    TooltipProps
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { cn } from '@/lib/utils';
import { InputMode } from '@/lib/physics/lif';

// Type Safety for Tooltip Data
interface DataPoint {
    time: number;
    voltage: number;
    input?: number;
}

const CustomTooltip = (props: TooltipProps<ValueType, NameType>) => {
    if (props.active && props.payload && props.payload.length) {
        const data = props.payload[0].payload as DataPoint;
        return (
            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded shadow-xl text-[10px] font-mono z-50 backdrop-blur-md bg-opacity-90">
                <div className="text-zinc-500 mb-1">{`Time: ${data.time.toFixed(1)} ms`}</div>
                <div className="text-emerald-400">{`Voltage: ${data.voltage.toFixed(2)} mV`}</div>
                {data.input !== undefined && (
                    <div className="text-amber-400">{`Input (I): ${data.input.toFixed(2)} nA`}</div>
                )}
            </div>
        );
    }
    return null;
};

export default function LifLab() {
    const {
        params, setParams,
        history, ghostTrace, captureGhostTrace, clearGhostTrace,
        isRunning, setIsRunning, resetSimulation, step,
        hoveredTerm, setHoveredTerm
    } = useSimulationStore();

    const requestRef = useRef<number>();

    const animate = useCallback(() => {
        if (isRunning) {
            step(); step();
        }
        requestRef.current = requestAnimationFrame(animate);
    }, [isRunning, step]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [animate]);

    const onSliderChangeStart = () => {
        if (!ghostTrace && history.length > 10) {
            captureGhostTrace();
        }
    };

    const renderInputMath = () => {
        switch (params.inputMode) {
            case 'pulse': return "I(t) = A · δ(t - t_{spike})";
            case 'noise': return "I(t) = I_{mean} + σ · ξ(t)";
            case 'sine': return "I(t) = A · sin(2πft)";
            default: return "I = Constant";
        }
    };

    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden select-none font-sans">
            
            {/* Header */}
            <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                <div className="flex items-center gap-4">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h1 className="text-lg font-semibold tracking-tight text-white">
                        <Link href="/" className="hover:opacity-80 transition-opacity">ISCN</Link>
                        <span className="mx-3 text-zinc-700">/</span>
                        <span className="text-zinc-400 font-medium">LIF Synthesis</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 mr-2">
                        <Button
                            size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-white"
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                            size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-white"
                            onClick={resetSimulation}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="h-4 w-px bg-zinc-800" />
                    <ConceptDialog {...lifContent} />
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden p-8 gap-8">
                
                {/* Left Panel: Control Box */}
                <aside className="w-80 flex flex-col gap-6 shrink-0">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-8 flex flex-col shadow-sm">
                        
                        {/* Equation Box */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Governing Equation</span>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 flex flex-col items-center justify-center border border-zinc-800/30 min-h-[80px]">
                                <div className="text-sm font-mono flex items-center gap-1 tracking-tighter">
                                    <span className="text-zinc-500">τ</span>
                                    <span className="text-zinc-300">V&apos; = -(V - </span>
                                    <span className={cn("transition-colors cursor-help", hoveredTerm === 'E_L' ? "text-cyan-400" : "text-cyan-600")}
                                          onMouseEnter={() => setHoveredTerm('E_L')} onMouseLeave={() => setHoveredTerm(null)}>E_L</span>
                                    <span className="text-zinc-300">) + </span>
                                    <span className={cn("transition-colors cursor-help", hoveredTerm === 'R' ? "text-emerald-400" : "text-emerald-600")}
                                          onMouseEnter={() => setHoveredTerm('R')} onMouseLeave={() => setHoveredTerm(null)}>R</span>
                                    <span className="text-zinc-300"> · I(t)</span>
                                </div>
                                <div className="mt-2 text-[9px] font-mono text-amber-500/80 uppercase">
                                    {renderInputMath()}
                                </div>
                            </div>
                        </div>

                        {/* Sliders Area */}
                        <div className="space-y-6 pt-2 overflow-y-auto pr-1 scrollbar-hide">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Biophysics</span>
                                
                                <div className="space-y-3" onMouseEnter={() => setHoveredTerm('R')} onMouseLeave={() => setHoveredTerm(null)}>
                                    <div className="flex justify-between items-center font-mono">
                                        <span className="text-[10px] text-zinc-500 font-bold">Resistance (R)</span>
                                        <span className="text-xs font-bold text-emerald-400">{params.R} MΩ</span>
                                    </div>
                                    <Slider
                                        min={1} max={100} step={1} value={[params.R]}
                                        onValueChange={(val) => setParams({ R: val[0] })}
                                        onPointerDown={onSliderChangeStart}
                                        className="[&_[role=slider]]:bg-emerald-500"
                                    />
                                </div>

                                <div className="space-y-3" onMouseEnter={() => setHoveredTerm('E_L')} onMouseLeave={() => setHoveredTerm(null)}>
                                    <div className="flex justify-between items-center font-mono">
                                        <span className="text-[10px] text-zinc-500 font-bold">Leak Pot. (E_L)</span>
                                        <span className="text-xs font-bold text-cyan-400">{params.E_L} mV</span>
                                    </div>
                                    <Slider
                                        min={-100} max={-40} step={1} value={[params.E_L]}
                                        onValueChange={(val) => setParams({ E_L: val[0] })}
                                        onPointerDown={onSliderChangeStart}
                                        className="[&_[role=slider]]:bg-cyan-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-800/50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Stimulus</span>
                                    <Select value={params.inputMode} onValueChange={(val: InputMode) => setParams({ inputMode: val })}>
                                        <SelectTrigger className="w-24 h-6 bg-zinc-950 border-zinc-800 text-[9px] font-mono text-zinc-400">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                            <SelectItem value="constant">Constant</SelectItem>
                                            <SelectItem value="pulse">Pulse</SelectItem>
                                            <SelectItem value="noise">Noise</SelectItem>
                                            <SelectItem value="sine">Sine</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                                    <div className="flex justify-between items-center font-mono">
                                        <span className="text-[9px] text-amber-500/70 font-bold">Amplitude</span>
                                        <span className="text-xs font-bold text-amber-500">{params.I} nA</span>
                                    </div>
                                    <Slider
                                        min={0} max={20} step={0.1} value={[params.I]}
                                        onValueChange={(val) => setParams({ I: val[0] })}
                                        className="[&_[role=slider]]:bg-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                             <ForceBalance />
                        </div>
                    </div>
                </aside>

                {/* Right Panel: Oscilloscope Workstation */}
                <section className="flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative shadow-inner">
                    
                    {ghostTrace && (
                        <div className="absolute top-4 right-4 z-20">
                            <Button 
                                variant="outline" size="sm" onClick={clearGhostTrace} 
                                className="text-[9px] h-6 border-zinc-800 bg-zinc-950/50 text-zinc-500 hover:text-rose-400 font-mono"
                            >
                                Clear Ghost Trace
                            </Button>
                        </div>
                    )}

                    <div className="flex-1 relative p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} hide />
                                <YAxis domain={[-90, -30]} hide />
                                <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                                
                                <ReferenceLine y={params.thresh} stroke="#dc2626" strokeDasharray="3 3" strokeOpacity={0.5} />
                                <ReferenceLine y={params.E_L} stroke="#0ea5e9" strokeDasharray="3 3" strokeOpacity={0.3} />

                                {ghostTrace && (
                                    <Line
                                        data={ghostTrace} type="monotone" dataKey="voltage"
                                        stroke="#3f3f46" strokeWidth={1.5} dot={false} isAnimationActive={false}
                                    />
                                )}

                                <Line
                                    type="monotone" dataKey="voltage" stroke="#10b981"
                                    strokeWidth={2} dot={false} isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Workstation Footer */}
                    <div className="p-4 px-10 border-t border-zinc-800/50 flex justify-between items-center bg-zinc-950/50">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full", isRunning ? "bg-emerald-500 animate-pulse" : "bg-zinc-600")} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono tracking-tight">
                                {`Telemetry: ${isRunning ? 'Streaming' : 'Idle'} // DT: 0.1ms`}
                            </span>
                        </div>
                        <div className="flex gap-6">
                            <span className="text-[10px] text-zinc-700 uppercase tracking-widest font-mono">{`Mode: ${params.inputMode}`}</span>
                            <span className="text-[10px] text-zinc-700 uppercase tracking-widest font-mono">Engine: LIF_INTEGRATOR_V2</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
