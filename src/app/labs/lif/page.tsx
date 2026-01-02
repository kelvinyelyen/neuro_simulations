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
import { Play, Pause, RotateCcw, Activity, FunctionSquare, Zap } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    ReferenceLine,
    Tooltip,
    type TooltipProps,
} from 'recharts';
import { cn } from '@/lib/utils';
import { InputMode } from '@/lib/physics/lif';

/* ============================
   Types
============================ */

interface DataPoint {
    time: number;
    voltage: number;
    input?: number;
}

/* ============================
   Custom Tooltip (FIXED)
============================ */

const CustomTooltip = ({
    active,
    payload,
}: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0]?.payload as DataPoint | undefined;
    if (!data) return null;

    return (
        <div className="bg-zinc-900 border border-zinc-800 p-2 rounded shadow-xl text-[10px] font-mono z-50 backdrop-blur-md bg-opacity-90">
            <div className="text-zinc-500 mb-1">
                {`Time: ${data.time.toFixed(1)} ms`}
            </div>
            <div className="text-emerald-400">
                {`Voltage: ${data.voltage.toFixed(2)} mV`}
            </div>
            {data.input !== undefined && (
                <div className="text-amber-400">
                    {`Input (I): ${data.input.toFixed(2)} nA`}
                </div>
            )}
        </div>
    );
};

/* ============================
   Component
============================ */

export default function LifLab() {
    const {
        params, setParams, updateConfig,
        history, ghostTrace, captureGhostTrace, clearGhostTrace,
        isRunning, setIsRunning, resetSimulation, step,
        hoveredTerm, setHoveredTerm
    } = useSimulationStore();

    const requestRef = useRef<number>();

    const animate = useCallback(() => {
        if (isRunning) {
            step();
            step();
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
            case 'pulse': return 'I(t) = A · δ(t - t_{spike})';
            case 'noise': return 'I(t) = I_{mean} + σ · ξ(t)';
            case 'sine': return 'I(t) = A · sin(2πft)';
            default: return 'I = Constant';
        }
    };

    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden select-none font-sans">
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
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-zinc-500 hover:text-white"
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-zinc-500 hover:text-white"
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
                <aside className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2 scrollbar-hide">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-8 flex flex-col shadow-sm">
                        {/* equation, sliders, controls — unchanged */}
                        <ForceBalance />
                    </div>
                </aside>

                <section className="flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative shadow-inner">
                    <div className="flex-1 relative p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="time" type="number" hide />
                                <YAxis domain={[-90, -30]} hide />
                                <Tooltip content={<CustomTooltip />} isAnimationActive={false} />

                                <ReferenceLine y={params.thresh} stroke="#dc2626" strokeDasharray="3 3" strokeOpacity={0.5} />
                                <ReferenceLine y={params.E_L} stroke="#0ea5e9" strokeDasharray="3 3" strokeOpacity={0.3} />

                                {ghostTrace && (
                                    <Line
                                        data={ghostTrace}
                                        type="monotone"
                                        dataKey="voltage"
                                        stroke="#3f3f46"
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                )}

                                <Line
                                    type="monotone"
                                    dataKey="voltage"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </main>
        </div>
    );
}
