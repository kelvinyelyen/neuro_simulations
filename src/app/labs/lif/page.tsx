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
import { Play, Pause, RotateCcw, Activity, FunctionSquare, Timer, Zap, Settings2 } from 'lucide-react';
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
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Custom Tooltip for Recharts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-2xl text-xs font-mono z-50 backdrop-blur-md bg-opacity-95">
        <div className="text-zinc-500 mb-2 border-b border-zinc-800 pb-1">{`T: ${data.time.toFixed(1)} ms`}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-zinc-400">Voltage:</span>
            <span className="text-emerald-400 text-right">{data.voltage.toFixed(2)} mV</span>
            
            {data.input !== undefined && (
                <>
                    <span className="text-zinc-400">Input:</span>
                    <span className="text-amber-400 text-right">{data.input.toFixed(2)} nA</span>
                </>
            )}
        </div>
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

  // Helper to render math formula based on mode
  const getInputLatex = () => {
    switch (params.inputMode) {
      case 'pulse': return "I(t) = A \\cdot \\delta(t - t_{spike})";
      case 'noise': return "I(t) = \\mu + \\sigma \\cdot \\xi(t)";
      case 'sine': return "I(t) = A \\cdot \\sin(2\\pi f t)";
      case 'constant': default: return "I(t) = I_{const}";
    }
  };

  // Helper for mode descriptions
  const getModeDescription = () => {
    switch (params.inputMode) {
        case 'constant': return "Steady DC current injection.";
        case 'pulse': return "Brief, high-amplitude current spikes.";
        case 'noise': return "Random synaptic fluctuations (White Noise).";
        case 'sine': return "Oscillating current to test resonance.";
        default: return "";
    }
  };

  // Detect Spike for Status
  const latestVoltage = history.length > 0 ? history[history.length - 1].voltage : params.E_L;
  const isSpiking = latestVoltage >= params.thresh;

  return (
    <div className="h-screen bg-zinc-950 text-zinc-200 font-mono flex flex-col overflow-hidden select-none font-sans">
      
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
            <Activity className="w-5 h-5 text-emerald-500" />
            <h1 className="text-lg font-semibold tracking-tight text-white">
              <Link href="/" className="hover:opacity-80 transition-opacity">ISCN</Link>
              <span className="mx-3 text-zinc-700">/</span>
              <span className="text-zinc-400 font-medium">Phase 1: LIF Synthesis</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1 mr-2">
              <Button size="icon" variant="outline" className="h-8 w-8 border-zinc-800 bg-zinc-900 hover:bg-zinc-800" onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 text-emerald-500" />}
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 border-zinc-800 bg-zinc-900 hover:bg-zinc-800" onClick={resetSimulation}>
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
            <ConceptDialog {...lifContent} />
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Left Panel: Sidebar - Increased width to 400px */}
          <aside className="w-[400px] flex flex-col shrink-0 overflow-hidden bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-sm">
            
            {/* Scrollable Container with Hidden Scrollbar */}
            <div className="h-full flex flex-col p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              
              {/* 1. Equation & Visualizer */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Governing Equation</span>
                  </div>
                  
                  {/* LaTeX Equation Box - Compact */}
                  <div className="bg-black/30 rounded-xl p-4 flex flex-col items-center justify-center border border-zinc-800/30 min-h-[90px] text-zinc-200">
                    <BlockMath math="\tau \frac{dV}{dt} = -(V - E_L) + R \cdot I(t)" />
                    <div className="text-[10px] text-zinc-600 mt-2 pt-2 border-t border-zinc-800/30 w-full text-center font-mono">
                      <BlockMath math={getInputLatex()} />
                    </div>
                  </div>
                </div>
                
                {/* Force Balance Viz */}
                <div className="pt-1">
                   <ForceBalance />
                </div>
              </div>

              {/* 2. Membrane Group - Compact Grid */}
              <div className="space-y-4 pt-6 mt-6 border-t border-zinc-800/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Membrane Properties</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-tight">
                        Passive constants that determine how the cell integrates charge over time.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Resistance */}
                    <div 
                        className={cn("space-y-2 p-2 rounded border transition-colors duration-200", hoveredTerm === 'R' ? "bg-emerald-950/20 border-emerald-500/30" : "border-zinc-800/30 bg-zinc-900/30")}
                        onMouseEnter={() => setHoveredTerm('R')} onMouseLeave={() => setHoveredTerm(null)}
                    >
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                            <span>Resist (R)</span>
                            <span className="text-emerald-400">{params.R}</span>
                        </div>
                        <Slider min={1} max={100} step={1} value={[params.R]} onValueChange={(val) => setParams({ R: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-emerald-500" />
                    </div>

                    {/* Leak */}
                    <div 
                        className={cn("space-y-2 p-2 rounded border transition-colors duration-200", hoveredTerm === 'E_L' ? "bg-cyan-950/20 border-cyan-500/30" : "border-zinc-800/30 bg-zinc-900/30")}
                        onMouseEnter={() => setHoveredTerm('E_L')} onMouseLeave={() => setHoveredTerm(null)}
                    >
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                            <span>Leak (E_L)</span>
                            <span className="text-cyan-400">{params.E_L}</span>
                        </div>
                        <Slider min={-100} max={-40} step={1} value={[params.E_L]} onValueChange={(val) => setParams({ E_L: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-cyan-500" />
                    </div>

                    {/* Capacitance */}
                    <div className="col-span-2 space-y-2 p-2 rounded border border-zinc-800/30 bg-zinc-900/30">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                            <span>Capacitance (C)</span>
                            <span>{params.C} μF</span>
                        </div>
                        <Slider min={0.1} max={5} step={0.1} value={[params.C]} onValueChange={(val) => setParams({ C: val[0] })} onPointerDown={onSliderChangeStart} />
                    </div>
                  </div>
              </div>

              {/* 3. Stimulus Group */}
              <div className="space-y-4 pt-6 border-t border-zinc-800/50">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white font-mono">Input Drive</span>
                        </div>
                        <Select value={params.inputMode} onValueChange={(val: InputMode) => setParams({ inputMode: val })}>
                            <SelectTrigger className="w-28 bg-zinc-950 border-zinc-800 h-6 text-[10px] text-white focus:ring-0 outline-none hover:bg-zinc-900 transition-colors">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="constant">Constant</SelectItem>
                                <SelectItem value="pulse">Pulse</SelectItem>
                                <SelectItem value="noise">Noise</SelectItem>
                                <SelectItem value="sine">Sine</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-tight italic">
                        {getModeDescription()}
                    </p>
                  </div>

                  <div className="pt-1">
                      {params.inputMode === 'constant' && (
                           <div className="space-y-2 p-2 rounded border border-amber-500/10 bg-amber-500/5">
                              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                                  <span>Current (I)</span>
                                  <span className="text-amber-500 font-bold">{params.I} nA</span>
                              </div>
                              <Slider min={0} max={20} step={0.1} value={[params.I]} onValueChange={(val) => setParams({ I: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-amber-500" />
                           </div>
                      )}
                      
                      {(params.inputMode === 'pulse' || params.inputMode === 'noise' || params.inputMode === 'sine') && (
                          <div className="grid grid-cols-2 gap-3">
                              {params.inputMode === 'pulse' && (
                                <>
                                    <div className="col-span-2 space-y-2">
                                        <div className="flex justify-between text-[10px] font-mono text-zinc-400"><span>Amplitude</span><span className="text-amber-500">{params.pulseConfig.amplitude} nA</span></div>
                                        <Slider min={0} max={50} step={1} value={[params.pulseConfig.amplitude]} onValueChange={(val) => updateConfig('pulse', { amplitude: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-amber-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-mono text-zinc-400"><span>Interval</span><span>{params.pulseConfig.interval}ms</span></div>
                                        <Slider min={10} max={200} step={5} value={[params.pulseConfig.interval]} onValueChange={(val) => updateConfig('pulse', { interval: val[0] })} onPointerDown={onSliderChangeStart} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-mono text-zinc-400"><span>Width</span><span>{params.pulseConfig.width}ms</span></div>
                                        <Slider min={1} max={20} step={1} value={[params.pulseConfig.width]} onValueChange={(val) => updateConfig('pulse', { width: val[0] })} onPointerDown={onSliderChangeStart} />
                                    </div>
                                </>
                              )}
                              {params.inputMode === 'noise' && (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-mono text-zinc-400"><span>Mean</span><span className="text-amber-500">{params.noiseConfig.mean} nA</span></div>
                                        <Slider min={0} max={20} step={0.5} value={[params.noiseConfig.mean]} onValueChange={(val) => updateConfig('noise', { mean: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-amber-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-mono text-zinc-400"><span>Sigma</span><span>{params.noiseConfig.sigma}</span></div>
                                        <Slider min={0} max={10} step={0.1} value={[params.noiseConfig.sigma]} onValueChange={(val) => updateConfig('noise', { sigma: val[0] })} onPointerDown={onSliderChangeStart} />
                                    </div>
                                </>
                              )}
                              {params.inputMode === 'sine' && (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-mono text-zinc-400"><span>Amp</span><span className="text-amber-500">{params.sineConfig.amplitude} nA</span></div>
                                        <Slider min={0} max={30} step={1} value={[params.sineConfig.amplitude]} onValueChange={(val) => updateConfig('sine', { amplitude: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-amber-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-mono text-zinc-400"><span>Freq</span><span>{params.sineConfig.frequency} Hz</span></div>
                                        <Slider min={1} max={50} step={1} value={[params.sineConfig.frequency]} onValueChange={(val) => updateConfig('sine', { frequency: val[0] })} onPointerDown={onSliderChangeStart} />
                                    </div>
                                </>
                              )}
                          </div>
                      )}
                  </div>
              </div>

              {/* Ghost Trace Controls (Moved here since footer is gone) */}
              {ghostTrace && (
                  <div className="pt-6 mt-auto">
                      <Button 
                          variant="outline"
                          onClick={clearGhostTrace} 
                          className="w-full text-[10px] border-zinc-800 bg-zinc-900 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 hover:border-rose-900 uppercase font-bold tracking-widest h-8"
                      >
                          Clear Ghost Trace
                      </Button>
                  </div>
              )}

            </div>
          </aside>

          {/* Right Panel: Oscilloscope Visualization */}
          <section className="flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative shadow-inner">
            
            {/* Dashboard Overlay */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none select-none">
              <div className="flex flex-col">
                <span className="text-5xl font-black text-zinc-800/50 font-mono tracking-tighter uppercase">
                  {params.inputMode}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <Timer className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-bold font-mono">
                    T: {useSimulationStore.getState().currentTime.toFixed(0)}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Live Indicators */}
            <div className="absolute top-6 right-6 z-10 flex gap-3 pointer-events-none">
              <div className={cn(
                  "flex items-center gap-3 bg-zinc-950/80 px-4 py-2 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300",
                  isSpiking ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "border-zinc-800"
              )}>
                <div className={cn("w-2 h-2 rounded-full transition-colors duration-100", isSpiking ? "bg-white shadow-[0_0_10px_white]" : "bg-emerald-500 animate-pulse")} />
                <span className={cn("text-xs font-bold font-mono uppercase tracking-widest", isSpiking ? "text-white" : "text-zinc-400")}>
                    {isSpiking ? "SPIKE" : "Live V_m"}
                </span>
              </div>
              {ghostTrace && (
                  <div className="flex items-center gap-3 bg-zinc-950/80 px-4 py-2 rounded-full border border-zinc-800 shadow-xl opacity-60 backdrop-blur-md">
                      <div className="w-2 h-2 rounded-full bg-zinc-500" />
                      <span className="text-xs text-zinc-400 font-bold font-mono uppercase tracking-widest">Ghost</span>
                  </div>
              )}
            </div>

            {/* Recharts Graph */}
            <div className="flex-1 w-full h-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f22" vertical={false} />
                  <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} hide />
                  <YAxis domain={[-90, -30]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <ReferenceLine 
                      y={params.thresh} 
                      stroke="#ef4444" 
                      strokeDasharray="4 4" 
                      strokeOpacity={0.5} 
                      label={{ position: 'insideRight', value: 'THRESHOLD', fill: '#ef4444', fontSize: 10, opacity: 0.6, fontFamily: 'monospace' }} 
                  />
                  <ReferenceLine 
                      y={params.E_L} 
                      stroke="#0ea5e9" 
                      strokeDasharray="4 4" 
                      strokeOpacity={0.3} 
                      label={{ position: 'insideRight', value: 'REST', fill: '#0ea5e9', fontSize: 10, opacity: 0.5, fontFamily: 'monospace' }} 
                  />

                  {ghostTrace && (
                    <Line data={ghostTrace} type="monotone" dataKey="voltage" stroke="#52525b" strokeWidth={2} dot={false} isAnimationActive={false} strokeOpacity={0.6} />
                  )}

                  <Line 
                    type="monotone" 
                    dataKey="voltage" 
                    stroke={isSpiking ? "#34d399" : "#10b981"} 
                    strokeWidth={3} 
                    dot={false} 
                    isAnimationActive={false} 
                    strokeDasharray={isSpiking ? "0" : "0"}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
