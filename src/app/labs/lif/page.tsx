'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSimulationStore } from '@/store/simulation';
import { ForceBalance } from '@/components/viz/ForceBalance';
import { ConceptDialog } from '@/components/guide/ConceptDialog';
import { lifContent } from './content';
import { Button } from '@/components/ui/button';
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
    TooltipProps,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { cn } from '@/lib/utils';

/* ---------------------------------------------
   Tooltip Data Type
--------------------------------------------- */
interface DataPoint {
    time: number;
    voltage: number;
    input?: number;
}

/**
 * Type-safe Custom Tooltip (Recharts + TS compliant)
 */
const CustomTooltip = ({
    active,
    payload,
}: TooltipProps<ValueType, NameType>) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload as DataPoint;

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

export default function LifLab() {
    const {
        params,
        history,
        ghostTrace,
        isRunning,
        setIsRunning,
        resetSimulation,
        step,
        hoveredTerm,
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

    const renderInputMath = () => {
        switch (params.inputMode) {
            case 'pulse':
                return 'I(t) = A · δ(t - tₛ)';
            case 'noise':
                return 'I(t) = I₀ + σξ(t)';
            case 'sine':
                return 'I(t) = A · sin(2πft)';
            default:
                return 'I = Constant';
        }
    };

    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden select-none font-sans">
            {/* Header */}
            <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                <div className="flex items-center gap-4">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h1 className="text-lg font-semibold tracking-tight text-white">
                        <Link href="/" className="hover:opacity-80 transition-opacity">
                            ISCN
                        </Link>
                        <span className="mx-3 text-zinc-700">/</span>
                        <span className="text-zinc-400 font-medium">
                            LIF Synthesis
                        </span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
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

                    <ConceptDialog {...lifContent} />
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex overflow-hidden p-8 gap-8">
                {/* Sidebar */}
                <aside className="w-80 shrink-0">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-8 shadow-sm">
                        {/* Equation */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">
                                    Governing Equation
                                </span>
                            </div>

                            <div className="bg-black/30 rounded-xl p-4 border border-zinc-800/30">
                                <div className="text-sm font-mono tracking-tighter">
                                    <span className="text-zinc-500">τ</span>
                                    <span className="text-zinc-300">
                                        V&apos; = −(V −
                                    </span>
                                    <span
                                        className={cn(
                                            hoveredTerm === 'E_L'
                                                ? 'text-cyan-400'
                                                : 'text-cyan-600'
                                        )}
                                    >
                                        E_L
                                    </span>
                                    <span className="text-zinc-300">) + </span>
                                    <span
                                        className={cn(
                                            hoveredTerm === 'R'
                                                ? 'text-emerald-400'
                                                : 'text-emerald-600'
                                        )}
                                    >
                                        R
                                    </span>
                                    <span className="text-zinc-300">· I(t)</span>
                                </div>

                                <div className="mt-2 text-[9px] font-mono text-amber-500/80 uppercase">
                                    {renderInputMath()}
                                </div>
                            </div>
                        </div>

                        <ForceBalance />
                    </div>
                </aside>

                {/* Oscilloscope */}
                <section className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                            <XAxis dataKey="time" type="number" hide />
                            <YAxis domain={[-90, -30]} hide />

                            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />

                            <ReferenceLine
                                y={params.thresh}
                                stroke="#dc2626"
                                strokeDasharray="3 3"
                            />
                            <ReferenceLine
                                y={params.E_L}
                                stroke="#0ea5e9"
                                strokeDasharray="3 3"
                            />

                            {ghostTrace && (
                                <Line
                                    data={ghostTrace}
                                    dataKey="voltage"
                                    stroke="#3f3f46"
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            )}

                            <Line
                                dataKey="voltage"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </section>
            </main>
        </div>
    );
}
