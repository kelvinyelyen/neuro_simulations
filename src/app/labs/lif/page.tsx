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
import { Play, Pause, RotateCcw, Activity, FunctionSquare, Info, Timer, Zap } from 'lucide-react';
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

// 1. Custom Tooltip Component (Preserved)
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

  // 2. Animation Loop Logic (Preserved)
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

  // 3. Helper to render math formula (Updated to return LaTeX string for the UI)
  const getInputLatex = () => {
    switch (params.inputMode) {
      case 'pulse': return "I(t) = A \\cdot \\delta(t - t_{spike})";
      case 'noise': return "I(t) = \\mu + \\sigma \\cdot \\xi(t)";
      case 'sine': return "I(t) = A \\cdot \\sin(2\\pi f t)";
      case 'constant': default: return "I(t) = I_{const}";
    }
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-200 font-mono flex flex-col overflow-hidden select-none font-sans">
      
      {/* 4. MOBILE GUARD (Preserved from original) */}
      <div className="flex md:hidden flex-col items-center justify-center h-full p-8 text-center space-y-6 bg-zinc-950 z-50 fixed inset-0">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
          <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white mb-2">Scientific Workstation</h1>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
            Please access this simulation on a <span className="text-zinc-300">Desktop</span> or <span className="text-zinc-300">Tablet</span> for the full experience.
          </p>
        </div>
      </div>

      {/* 5. DESKTOP CONTENT */}
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

        <main className="flex-1 flex overflow-hidden p-8 gap-8">
          
          {/* Left Panel: Sidebar (Fixed w-96, No Scrollbars) */}
          <aside className="w-96 flex flex-col shrink-0 overflow-hidden">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex flex-col h-full shadow-sm">
              
              {/* TOP: Equation & Visualizer */}
              <div className="space-y-6 shrink-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Governing Equation</span>
                  </div>
                  
                  {/* Interactive Equation Box */}
                  <div className="bg-black/30 rounded-xl p-4 flex flex-col items-center justify-center border border-zinc-800/30 min-h-[90px] relative">
                    <div className="text-xl font-bold font-serif text-zinc-300">
                      <span className="opacity-50 italic mr-1">τ</span>
                      <span className="opacity-50">V&apos;</span>
                      <span className="mx-2 text-zinc-600">=</span>
                      <span className="text-zinc-500 mr-1">-</span>
                      <span>(V - </span>
                      <span 
                        className={cn("cursor-help transition-all duration-200", hoveredTerm === 'E_L' ? "text-cyan-400 scale-110 font-black" : "text-cyan-500")}
                        onMouseEnter={() => setHoveredTerm('E_L')} onMouseLeave={() => setHoveredTerm(null)}
                      >E_L</span>
                      <span>) + </span>
                      <span 
                        className={cn("cursor-help transition-all duration-200", hoveredTerm === 'R' ? "text-emerald-400 scale-110 font-black" : "text-emerald-500")}
                        onMouseEnter={() => setHoveredTerm('R')} onMouseLeave={() => setHoveredTerm(null)}
                      >R</span>
                      <span className="mx-1">·</span>
                      <span 
                        className={cn("cursor-help transition-all duration-200", hoveredTerm === 'I' ? "text-amber-400 scale-110 font-black" : "text-amber-500")}
                        onMouseEnter={() => setHoveredTerm('I')} onMouseLeave={() => setHoveredTerm(null)}
                      >I(t)</span>
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-2 pt-2 border-t border-zinc-800/30 w-full text-center font-mono">
                      <BlockMath math={getInputLatex()} />
                    </div>
                  </div>
                </div>

                {/* Force Balance Viz Component */}
                <div className="pt-1">
                   <ForceBalance />
                </div>
              </div>

              {/* MIDDLE: Controls (Scrollable internals, hidden scrollbar) */}
              <div className="mt-6 pt-6 border-t border-zinc-800/50 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden space-y-6">
                  
                  {/* 1. Membrane Group */}
                  <div className="space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Membrane Properties</span>
                      
                      <div 
                          className={cn("space-y-2 p-2 rounded border transition-colors duration-200", hoveredTerm === 'R' ? "bg-emerald-950/20 border-emerald-500/30" : "border-transparent hover:bg-zinc-900/50")}
                          onMouseEnter={() => setHoveredTerm('R')} onMouseLeave={() => setHoveredTerm(null)}
                      >
                          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                              <span>Resistance (R)</span>
                              <span className="text-emerald-400">{params.R} MΩ</span>
                          </div>
                          <Slider min={1} max={100} step={1} value={[params.R]} onValueChange={(val) => setParams({ R: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-emerald-500" />
                      </div>

                      <div 
                          className={cn("space-y-2 p-2 rounded border transition-colors duration-200", hoveredTerm === 'E_L' ? "bg-cyan-950/20 border-cyan-500/30" : "border-transparent hover:bg-zinc-900/50")}
                          onMouseEnter={() => setHoveredTerm('E_L')} onMouseLeave={() => setHoveredTerm(null)}
                      >
                          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                              <span>Leak Potential (E_L)</span>
                              <span className="text-cyan-400">{params.E_L} mV</span>
                          </div>
                          <Slider min={-100} max={-40} step={1} value={[params.E_L]} onValueChange={(val) => setParams({ E_L: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-cyan-500" />
                      </div>

                      <div className="space-y-2 p-2 rounded border border-transparent hover:bg-zinc-900/50">
                          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                              <span>Capacitance (C)</span>
                              <span>{params.C} μF</span>
                          </div>
                          <Slider min={0.1} max={5} step={0.1} value={[params.C]} onValueChange={(val) => setParams({ C: val[0] })} onPointerDown={onSliderChangeStart} />
                      </div>
                  </div>

                  {/* 2. Stimulus Group */}
                  <div 
                      className={cn("space-y-4 pt-2 rounded-xl transition-colors duration-300", hoveredTerm === 'I' ? "bg-amber-950/10 -m-2 p-2" : "")}
                      onMouseEnter={() => setHoveredTerm('I')} onMouseLeave={() => setHoveredTerm(null)}
                  >
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">Input Drive</span>
                          </div>
                          <Select value={params.inputMode} onValueChange={(val: InputMode) => setParams({ inputMode: val })}>
                              <SelectTrigger className="w-24 bg-zinc-950 border-zinc-800 h-6 text-[10px] focus:ring-0 outline-none">
                                  <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-zinc-800">
                                  <SelectItem value="constant">Constant</SelectItem>
                                  <SelectItem value="pulse">Pulse</SelectItem>
                                  <SelectItem value="noise">Noise</SelectItem>
                                  <SelectItem value="sine">Sine</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>

                      {/* Dynamic Sliders based on Input Mode - ALL ORIGINAL MODES PRESERVED */}
                      <div className="space-y-3 px-1">
                          {params.inputMode === 'constant' && (
                               <div className="space-y-2">
                                  <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                                      <span>Current (I)</span>
                                      <span className="text-amber-500">{params.I} nA</span>
                                  </div>
                                  <Slider min={0} max={20} step={0.1} value={[params.I]} onValueChange={(val) => setParams({ I: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-amber-500" />
                               </div>
                          )}
                          {params.inputMode === 'pulse' && (
                              <>
                                  <div className="space-y-2">
                                      <div className="flex justify-between text-[11px] font-mono text-zinc-400"><span>Amplitude</span><span className="text-amber-500">{params.pulseConfig.amplitude} nA</span></div>
                                      <Slider min={0} max={50} step={1} value={[params.pulseConfig.amplitude]} onValueChange={(val) => updateConfig('pulse', { amplitude: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-amber-500" />
                                  </div>
                                  <div className="space-y-2">
                                      <div className="flex justify-between text-[11px] font-mono text-zinc-400"><span>Interval</span><span>{params.pulseConfig.interval} ms</span></div>
                                      <Slider min={10} max={200} step={5} value={[params.pulseConfig.interval]} onValueChange={(val) => updateConfig('pulse', { interval: val[0] })} onPointerDown={onSliderChangeStart} />
                                  </div>
                                  <div className="space-y-2">
                                      <div className="flex justify-between text-[11px] font-mono text-zinc-400"><span>Width</span><span>{params.pulseConfig.width} ms</span></div>
                                      <Slider min={1} max={20} step={1} value={[params.pulseConfig.width]} onValueChange={(val) => updateConfig('pulse', { width: val[0] })} onPointerDown={onSliderChangeStart} />
                                  </div>
                              </>
                          )}
                          {params.inputMode === 'noise' && (
                              <>
                                  <div className="space-y-2">
                                      <div className="flex justify-between text-[11px] font-mono text-zinc-400"><span>Mean</span><span className="text-amber-500">{params.noiseConfig.mean} nA</span></div>
                                      <Slider min={0} max={20} step={0.5} value={[params.noiseConfig.mean]} onValueChange={(val) => updateConfig('noise', { mean: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-amber-500" />
                                  </div>
                                  <div className="space-y-2">
                                      <div className="flex justify-between text-[11px] font-mono text-zinc-400"><span>Sigma (σ)</span><span>{params.noiseConfig.sigma}</span></div>
                                      <Slider min={0} max={10} step={0.1} value={[params.noiseConfig.sigma]} onValueChange={(val) => updateConfig('noise', { sigma: val[0] })} onPointerDown={onSliderChangeStart} />
                                  </div>
                              </>
                          )}
                          {params.inputMode === 'sine' && (
                              <>
                                  <div className="space-y-2">
                                      <div className="flex justify-between text-[11px] font-mono text-zinc-400"><span>Amplitude</span><span className="text-amber-500">{params.sineConfig.amplitude} nA</span></div>
                                      <Slider min={0} max={30} step={1} value={[params.sineConfig.amplitude]} onValueChange={(val) => updateConfig('sine', { amplitude: val[0] })} onPointerDown={onSliderChangeStart} className="[&_[role=slider]]:bg-amber-500" />
                                  </div>
                                  <div className="space-y-2">
                                      <div className="flex justify-between text-[11px] font-mono text-zinc-400"><span>Frequency</span><span>{params.sineConfig.frequency} Hz</span></div>
                                      <Slider min={1} max={50} step={1} value={[params.sineConfig.frequency]} onValueChange={(val) => updateConfig('sine', { frequency: val[0] })} onPointerDown={onSliderChangeStart} />
                                  </div>
                              </>
                          )}
                      </div>
                  </div>
              </div>

              {/* BOTTOM: Status Footer */}
              <div className="mt-auto pt-6 border-t border-zinc-800/50 shrink-0">
                  <div className="flex items-center gap-2 mb-2 text-zinc-600">
                      <Info className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] font-mono">Workstation Status</span>
                  </div>
                  <div className={cn("p-3 rounded-lg border bg-zinc-950/50 border-zinc-800/50 transition-colors duration-300", isRunning ? "border-emerald-500/10" : "")}>
                      <p className="text-[11px] font-medium leading-tight text-zinc-400">
                          {isRunning 
                              ? "Simulation running. Real-time integration active." 
                              : "Simulation paused. Adjust parameters to inspect dynamics."}
                      </p>
                      {ghostTrace && (
                          <button 
                              onClick={clearGhostTrace} 
                              className="mt-2 w-full text-center text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900 py-1 rounded transition-colors uppercase font-bold tracking-widest"
                          >
                              Clear Comparison Trace
                          </button>
                      )}
                  </div>
              </div>

            </div>
          </aside>

          {/* Right Panel: Oscilloscope Visualization */}
          <section className="flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative shadow-inner">
            
            {/* Dashboard Overlay */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none select-none">
              <div className="flex flex-col">
                <span className="text-4xl font-black text-emerald-500/10 font-mono tracking-tighter uppercase">
                  {params.inputMode}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Timer className="w-3 h-3 text-zinc-600" />
                  <span className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-bold">
                    T: {useSimulationStore.getState().currentTime.toFixed(0)}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Live Indicators */}
            <div className="absolute top-6 right-6 z-10 flex gap-3 pointer-events-none">
              <div className="flex items-center gap-2 bg-zinc-950/80 px-3 py-1.5 rounded-full border border-zinc-800 shadow-xl backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] text-zinc-300 font-bold font-mono uppercase tracking-widest">Live V_m</span>
              </div>
              {ghostTrace && (
                  <div className="flex items-center gap-2 bg-zinc-950/80 px-3 py-1.5 rounded-full border border-zinc-800 shadow-xl opacity-60 backdrop-blur-md">
                      <div className="w-2 h-2 rounded-full bg-zinc-500" />
                      <span className="text-[10px] text-zinc-300 font-bold font-mono uppercase tracking-widest">Ghost</span>
                  </div>
              )}
            </div>

            {/* Recharts Graph */}
            <div className="flex-1 w-full h-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} hide />
                  <YAxis domain={[-90, -30]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <ReferenceLine 
                      y={params.thresh} 
                      stroke="#ef4444" 
                      strokeDasharray="4 4" 
                      strokeOpacity={0.6} 
                      label={{ position: 'insideRight', value: 'THRESHOLD', fill: '#ef4444', fontSize: 10, opacity: 0.5, fontFamily: 'monospace' }} 
                  />
                  <ReferenceLine 
                      y={params.E_L} 
                      stroke="#0ea5e9" 
                      strokeDasharray="4 4" 
                      strokeOpacity={0.3} 
                      label={{ position: 'insideRight', value: 'REST', fill: '#0ea5e9', fontSize: 10, opacity: 0.5, fontFamily: 'monospace' }} 
                  />

                  {ghostTrace && (
                    <Line data={ghostTrace} type="monotone" dataKey="voltage" stroke="#3f3f46" strokeWidth={1.5} dot={false} isAnimationActive={false} strokeOpacity={0.5} />
                  )}

                  <Line type="monotone" dataKey="voltage" stroke="#10b981" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
