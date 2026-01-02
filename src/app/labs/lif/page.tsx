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
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip
} from 'recharts';
import { cn } from '@/lib/utils';
import { InputMode } from '@/lib/physics/lif';

// Custom Tooltip for Recharts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-2 rounded shadow-xl text-xs font-mono z-50 backdrop-blur-md bg-opacity-90">
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
    params,
    setParams,
    updateConfig,
    history,
    ghostTrace,
    captureGhostTrace,
    clearGhostTrace,
    isRunning,
    setIsRunning,
    resetSimulation,
    step,
    hoveredTerm,
    setHoveredTerm
  } = useSimulationStore();

  // Animation Loop
  const requestRef = useRef<number>();

  const animate = useCallback(() => {
    if (isRunning) {
      // Speed up: 2 steps per frame for fluid but not too fast
      step();
      step();
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [isRunning, step]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  const onSliderChangeStart = () => {
    if (!ghostTrace && history.length > 10) {
      captureGhostTrace();
    }
  };

  // Helper to render math formula based on mode
  const renderInputMath = () => {
    switch (params.inputMode) {
      case 'pulse':
        return <span className="text-amber-400">I(t) = A · δ(t - t_spike)</span>;
      case 'noise':
        return <span className="text-amber-400">I(t) = I_mean + σ · Random()</span>;
      case 'sine':
        return <span className="text-amber-400">I(t) = A · sin(2πft)</span>;
      case 'constant':
      default:
        return <span className="text-amber-400">I</span>;
    }
  };

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
        {/* Compact Header */}
        <header className="h-12 border-b border-zinc-900 flex items-center justify-between px-4 bg-zinc-950/80 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <h1 className="text-lg font-bold tracking-tight text-white">
              <Link href="/" className="hover:text-emerald-400 transition-colors">
                ISCN
              </Link>{' '}
              <span className="text-zinc-400 font-normal text-base">| LIF Synthesis</span>
            </h1>
          </div>
          <ConceptDialog {...lifContent} />
        </header>

        <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden h-full">
          {/* LEFT COLUMN: Controls (Scrollable but hidden scrollbar) */}
          <div className="col-span-4 lg:col-span-3 flex flex-col border-r border-zinc-900 bg-zinc-925 relative">
            <div className="absolute inset-0 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-hide p-6 space-y-6">
              {/* 1. Equation Block */}
              <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-lg shadow-sm">
                <h2 className="text-xs text-zinc-400 uppercase tracking-widest mb-4 text-center font-semibold">
                  Governing Equation
                </h2>
                <div className="flex flex-wrap justify-center items-center text-xl font-bold font-mono">
                  <span className="text-zinc-400 mr-2">τ·</span>
                  <span className="text-zinc-300">V&apos;</span>
                  <span className="mx-3 text-zinc-600">=</span>
                  <span className="text-zinc-400 mr-1">-</span>
                  <span className="text-zinc-300">(V-</span>
                  <span
                    className={cn(
                      'cursor-help transition-colors duration-200',
                      hoveredTerm === 'E_L'
                        ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                        : 'text-cyan-400'
                    )}
                    onMouseEnter={() => setHoveredTerm('E_L')}
                    onMouseLeave={() => setHoveredTerm(null)}
                  >
                    E_L
                  </span>
                  <span className="text-zinc-300">)</span>
                  <span className="mx-3 text-zinc-600">+</span>
                  <span
                    className={cn(
                      'cursor-help transition-colors duration-200',
                      hoveredTerm === 'R'
                        ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                        : 'text-emerald-400'
                    )}
                    onMouseEnter={() => setHoveredTerm('R')}
                    onMouseLeave={() => setHoveredTerm(null)}
                  >
                    R
                  </span>
                  <span className="mx-1 text-zinc-600">·</span>
                  <span
                    className={cn(
                      'cursor-help transition-colors duration-200',
                      hoveredTerm === 'I' || hoveredTerm === 'Drive'
                        ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : 'text-amber-400'
                    )}
                    onMouseEnter={() => setHoveredTerm('I')}
                    onMouseLeave={() => setHoveredTerm(null)}
                  >
                    {params.inputMode === 'constant' ? 'I' : 'I(t)'}
                  </span>
                </div>
                {/* Input Formula */}
                <div className="mt-4 text-center text-sm font-mono border-t border-zinc-800/50 pt-3 opacity-90">
                  {renderInputMath()}
                </div>
              </div>

              {/* 2. Force Balance */}
              <ForceBalance />

              {/* 3. Controls */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase text-zinc-400 tracking-widest">Global Params</h3>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6 border-zinc-800 bg-zinc-900"
                      onClick={() => setIsRunning(!isRunning)}
                    >
                      {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6 border-zinc-800 bg-zinc-900"
                      onClick={resetSimulation}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Global Sliders Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Resistance */}
                  <div
                    className={cn(
                      'col-span-1 space-y-2 p-2 rounded border border-zinc-800/50 bg-zinc-900/30',
                      hoveredTerm === 'R' ? 'border-emerald-500/30 bg-emerald-950/10' : ''
                    )}
                    onMouseEnter={() => setHoveredTerm('R')}
                    onMouseLeave={() => setHoveredTerm(null)}
                  >
                    <label className="flex justify-between text-[10px] text-zinc-400 uppercase">
                      <span>Resistance</span>
                      <span className={cn(hoveredTerm === 'R' ? 'text-emerald-400' : 'text-zinc-400')}>
                        {params.R} MΩ
                      </span>
                    </label>
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      value={[params.R]}
                      onValueChange={(val) => setParams({ R: val[0] })}
                      onPointerDown={onSliderChangeStart}
                    />
                  </div>
                  {/* Leak Potential */}
                  <div
                    className={cn(
                      'col-span-1 space-y-2 p-2 rounded border border-zinc-800/50 bg-zinc-900/30',
                      hoveredTerm === 'E_L' ? 'border-cyan-500/30 bg-cyan-950/10' : ''
                    )}
                    onMouseEnter={() => setHoveredTerm('E_L')}
                    onMouseLeave={() => setHoveredTerm(null)}
                  >
                    <label className="flex justify-between text-[10px] text-zinc-400 uppercase">
                      <span>Leak Pot.</span>
                      <span className={cn(hoveredTerm === 'E_L' ? 'text-cyan-400' : 'text-zinc-400')}>
                        {params.E_L} mV
                      </span>
                    </label>
                    <Slider
                      min={-100}
                      max={-40}
                      step={1}
                      value={[params.E_L]}
                      onValueChange={(val) => setParams({ E_L: val[0] })}
                      onPointerDown={onSliderChangeStart}
                    />
                  </div>
                  {/* Capacitance */}
                  <div className="col-span-2 space-y-2 p-2 rounded border border-zinc-800/50 bg-zinc-900/30">
                    <label className="flex justify-between text-[10px] text-zinc-400 uppercase">
                      <span>Capacitance (C)</span>
                      <span>{params.C} μF</span>
                    </label>
                    <Slider
                      min={0.1}
                      max={5}
                      step={0.1}
                      value={[params.C]}
                      onValueChange={(val) => setParams({ C: val[0] })}
                      onPointerDown={onSliderChangeStart}
                    />
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-900" />

                {/* Input Controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                      Input Stimulus
                    </label>
                    <Select
                      value={params.inputMode}
                      onValueChange={(val: InputMode) => setParams({ inputMode: val })}
                    >
                      <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800 h-6 text-[10px] focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Mode" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <SelectItem value="constant">Constant</SelectItem>
                        <SelectItem value="pulse">Pulse</SelectItem>
                        <SelectItem value="noise">Noise</SelectItem>
                        <SelectItem value="sine">Sine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* DYNAMIC INPUT SLIDERS */}
                  <div
                    className={cn(
                      'space-y-3 p-3 rounded border border-zinc-800/50 bg-zinc-900/30 transition-colors duration-300',
                      hoveredTerm === 'I' || hoveredTerm === 'Drive'
                        ? 'border-amber-500/30 bg-amber-950/10'
                        : ''
                    )}
                    onMouseEnter={() => setHoveredTerm('I')}
                    onMouseLeave={() => setHoveredTerm(null)}
                  >
                    {/* CONSTANT */}
                    {params.inputMode === 'constant' && (
                      <div className="space-y-2">
                        <label className="flex justify-between text-[10px] text-amber-500 font-bold uppercase">
                          <span>Current (I)</span>
                          <span>{params.I} nA</span>
                        </label>
                        <Slider
                          min={0}
                          max={20}
                          step={0.1}
                          value={[params.I]}
                          onValueChange={(val) => setParams({ I: val[0] })}
                          onPointerDown={onSliderChangeStart}
                        />
                      </div>
                    )}

                    {/* PULSE MODE */}
                    {params.inputMode === 'pulse' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-2">
                          <label className="flex justify-between text-[10px] text-amber-500 font-bold uppercase">
                            <span>Amplitude</span>
                            <span>{params.pulseConfig.amplitude} nA</span>
                          </label>
                          <Slider
                            min={0}
                            max={50}
                            step={1}
                            value={[params.pulseConfig.amplitude]}
                            onValueChange={(val) => updateConfig('pulse', { amplitude: val[0] })}
                            onPointerDown={onSliderChangeStart}
                          />
                        </div>
                        <div className="col-span-1 space-y-2">
                          <label className="flex justify-between text-[10px] text-zinc-400">
                            <span>Interval</span>
                            <span>{params.pulseConfig.interval}ms</span>
                          </label>
                          <Slider
                            min={10}
                            max={200}
                            step={5}
                            value={[params.pulseConfig.interval]}
                            onValueChange={(val) => updateConfig('pulse', { interval: val[0] })}
                            onPointerDown={onSliderChangeStart}
                          />
                        </div>
                        <div className="col-span-1 space-y-2">
                          <label className="flex justify-between text-[10px] text-zinc-400">
                            <span>Width</span>
                            <span>{params.pulseConfig.width}ms</span>
                          </label>
                          <Slider
                            min={1}
                            max={20}
                            step={1}
                            value={[params.pulseConfig.width]}
                            onValueChange={(val) => updateConfig('pulse', { width: val[0] })}
                            onPointerDown={onSliderChangeStart}
                          />
                        </div>
                      </div>
                    )}

                    {/* NOISE MODE */}
                    {params.inputMode === 'noise' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-1 space-y-2">
                          <label className="flex justify-between text-[10px] text-amber-500 font-bold uppercase">
                            <span>Mean</span>
                            <span>{params.noiseConfig.mean} nA</span>
                          </label>
                          <Slider
                            min={0}
                            max={20}
                            step={0.5}
                            value={[params.noiseConfig.mean]}
                            onValueChange={(val) => updateConfig('noise', { mean: val[0] })}
                            onPointerDown={onSliderChangeStart}
                          />
                        </div>
                        <div className="col-span-1 space-y-2">
                          <label className="flex justify-between text-[10px] text-zinc-400">
                            <span>Sigma</span>
                            <span>{params.noiseConfig.sigma}</span>
                          </label>
                          <Slider
                            min={0}
                            max={10}
                            step={0.1}
                            value={[params.noiseConfig.sigma]}
                            onValueChange={(val) => updateConfig('noise', { sigma: val[0] })}
                            onPointerDown={onSliderChangeStart}
                          />
                        </div>
                      </div>
                    )}

                    {/* SINE MODE */}
                    {params.inputMode === 'sine' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-1 space-y-2">
                          <label className="flex justify-between text-[10px] text-amber-500 font-bold uppercase">
                            <span>Amp</span>
                            <span>{params.sineConfig.amplitude} nA</span>
                          </label>
                          <Slider
                            min={0}
                            max={30}
                            step={1}
                            value={[params.sineConfig.amplitude]}
                            onValueChange={(val) => updateConfig('sine', { amplitude: val[0] })}
                            onPointerDown={onSliderChangeStart}
                          />
                        </div>
                        <div className="col-span-1 space-y-2">
                          <label className="flex justify-between text-[10px] text-zinc-400">
                            <span>Freq</span>
                            <span>{params.sineConfig.frequency} Hz</span>
                          </label>
                          <Slider
                            min={1}
                            max={50}
                            step={1}
                            value={[params.sineConfig.frequency]}
                            onValueChange={(val) => updateConfig('sine', { frequency: val[0] })}
                            onPointerDown={onSliderChangeStart}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer/Ghost Controls */}
              {ghostTrace && (
                <div className="pt-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearGhostTrace}
                    className="text-[10px] h-6 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
                  >
                    Clear Ghost Trace
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Oscilloscope */}
          <div className="col-span-8 lg:col-span-9 flex flex-col bg-zinc-950 relative overflow-hidden">
            {/* Chart Header */}
            <div className="absolute top-4 left-6 z-10 pointer-events-none select-none">
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-emerald-500/20 font-mono tracking-tighter">
                  {params.inputMode.toUpperCase()}
                </span>
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1 ml-1">
                  Live Simulation | T: {useSimulationStore.getState().currentTime.toFixed(0)}ms
                </span>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-4 pointer-events-none">
              <div className="flex items-center gap-2 bg-zinc-900/50 p-1 px-2 rounded border border-zinc-800/50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] text-zinc-400 font-mono">Live V_m</span>
              </div>
              {ghostTrace && (
                <div className="flex items-center gap-2 bg-zinc-900/50 p-1 px-2 rounded border border-zinc-800/50">
                  <div className="w-2 h-2 rounded-full bg-zinc-600" />
                  <span className="text-[10px] text-zinc-500 font-mono">Ghost</span>
                </div>
              )}
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} horizontal={true} />
                <XAxis
                  dataKey="time"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  hide={true}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[-90, -30]} hide={true} />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />

                <ReferenceLine
                  y={params.thresh}
                  stroke="#dc2626"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                  label={{
                    position: 'insideRight',
                    value: 'THRESHOLD',
                    fill: '#dc2626',
                    fontSize: 10,
                    opacity: 0.7
                  }}
                />
                <ReferenceLine
                  y={params.E_L}
                  stroke="#0ea5e9"
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                  label={{
                    position: 'insideRight',
                    value: 'REST',
                    fill: '#0ea5e9',
                    fontSize: 10,
                    opacity: 0.5
                  }}
                />

                {/* Ghost Trace */}
                {ghostTrace && (
                  <Line
                    data={ghostTrace}
                    type="monotone"
                    dataKey="voltage"
                    stroke="#52525b"
                    strokeWidth={2}
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
        </main>
      </div>
    </div>
  );
}
