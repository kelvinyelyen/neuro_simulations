import React, { useState, useMemo } from "react";
import { FunctionSquare } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export const VectorMathLab = () => {
    // 3-Dimensional Vector Space
    const [inputs, setInputs] = useState<number[]>([0, 0, 0]);
    const [weights, setWeights] = useState<number[]>([0.5, -0.25, 0.75]);

    // Animate Inputs (Buckets filling/unfilling)
    React.useEffect(() => {
        let startTime = Date.now();
        let animationFrameId: number;

        const animate = () => {
            const now = Date.now();
            const elapsed = (now - startTime) / 1000; // seconds

            // Generate varying levels using sine waves with different speeds/phases
            const newInputs = [
                (Math.sin(elapsed * 1.5) + 1) / 2,       // 0 to 1
                (Math.sin(elapsed * 1.0 + 2) + 1) / 2,   // Different phase
                (Math.sin(elapsed * 2.0 + 4) + 1) / 2    // Faster
            ];

            setInputs(newInputs);
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const dotProduct = useMemo(() => {
        return inputs.reduce((acc, val, i) => acc + val * weights[i], 0);
    }, [inputs, weights]);

    return (
        <main className="flex-1 flex overflow-hidden p-8 gap-8">
            {/* Left Panel: Configuration */}
            <aside className="w-[420px] flex flex-col gap-6 shrink-0 overflow-hidden">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-8 flex flex-col shadow-sm h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">

                    {/* Intro/Formula */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <FunctionSquare className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">
                                Vector Operation
                            </span>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 flex items-center justify-center border border-zinc-800/30 text-white min-h-[60px]">
                            <BlockMath>
                                {"y = \\vec{w} \\cdot \\vec{x} = \\sum w_i x_i"}
                            </BlockMath>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                                Calculating the algebraic similarity between two vectors through element-wise multiplication.
                            </p>
                        </div>
                    </div>

                    {/* Input Vector Monitor */}
                    <div className="space-y-6 pt-4 border-t border-zinc-800/50">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">
                                Input Vector (<InlineMath math="\vec{x}" />)
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-blue-400 font-mono animate-pulse">
                                Live Signal
                            </span>
                        </div>

                        <div className="space-y-2">
                            {inputs.map((val, i) => (
                                <div key={i} className="flex justify-between items-center text-xs font-mono bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
                                    <span className="text-zinc-400">
                                        <InlineMath math={`x_${i}`} />
                                    </span>

                                    {/* Mini Bar Visualizer in Sidebar */}
                                    <div className="flex-1 mx-3 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500/50"
                                            style={{ width: `${val * 100}%` }}
                                        />
                                    </div>

                                    <span className="text-xs font-bold text-blue-400 w-12 text-right inline-block">
                                        {val.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weight Components Controls */}
                    <div className="space-y-6 pt-4 border-t border-zinc-800/50">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 font-mono">
                                Weight Vector (<InlineMath math="\vec{w}" />)
                            </span>
                        </div>

                        <div className="space-y-2">
                            {weights.map((w, i) => (
                                <div key={i} className="flex justify-between items-center text-xs font-mono bg-zinc-950/50 p-2 rounded border border-zinc-800/50 gap-3">
                                    <span className="text-zinc-400 w-6 shrink-0">
                                        <InlineMath math={`w_${i}`} />
                                    </span>

                                    <Slider
                                        min={-1} max={1} step={0.1}
                                        value={[w]}
                                        onValueChange={([val]) => {
                                            const newW = [...weights];
                                            newW[i] = val;
                                            setWeights(newW);
                                        }}
                                        className={cn(
                                            "flex-1 cursor-pointer",
                                            w < 0 ? "[&_[role=slider]]:bg-rose-500" : "[&_[role=slider]]:bg-emerald-500"
                                        )}
                                    />

                                    <span className={cn(
                                        "text-xs font-bold w-12 text-right tabular-nums",
                                        w < 0 ? "text-rose-400" : "text-emerald-400"
                                    )}>
                                        {w.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Result Description */}
                    <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                        <p className="text-[11px] font-medium leading-tight text-emerald-400/90">
                            {`Magnitude: `}
                            <span className="tabular-nums inline-block w-12 text-center font-bold">
                                {dotProduct.toFixed(2)}
                            </span>
                            {`. This represents the scale of the projection on the weight vector.`}
                        </p>
                    </div>

                </div>
            </aside>

            {/* Right Panel: Visualization Workstation */}
            <section className="flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative shadow-inner">
                <div className="flex-1 flex flex-col items-center justify-center p-6 gap-12 overflow-hidden">
                    <div className="flex items-end justify-center w-full gap-8 xl:gap-16">
                        {/* Input Vectors */}
                        <div className="flex gap-8 items-end">
                            {inputs.map((inVal, i) => (
                                <div key={i} className="flex flex-col items-center gap-4">
                                    <div className="w-14 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden relative h-48 md:h-64 shadow-xl group cursor-pointer">
                                        {[0.25, 0.5, 0.75].map((tick) => (
                                            <div key={tick} className="absolute w-full h-px bg-zinc-800/50" style={{ bottom: `${tick * 100}%` }} />
                                        ))}
                                        <div
                                            className="absolute bottom-0 w-full bg-blue-500/60 transition-all duration-100 ease-linear border-t border-blue-400 group-hover:bg-blue-400/60"
                                            style={{ height: `${Math.abs(inVal) * 100}%` }}
                                        />
                                        {/* Simple slider overlay/logic could be added here for inputs too, but keeping it simple as per image which showed weights sliders */}
                                    </div>
                                    <div className="text-[11px] font-mono text-zinc-500 font-bold text-center">
                                        <InlineMath math={`x_{${i}}`} /><br />
                                        <span className="text-zinc-400 w-12 inline-block text-center tabular-nums">{inVal.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="h-48 md:h-64 flex flex-col justify-center">
                            <span className="text-zinc-800 text-4xl font-light">→</span>
                        </div>

                        {/* Output Vector */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-48 md:h-64 bg-zinc-900 border-2 border-zinc-800 rounded-xl relative overflow-hidden shadow-2xl">
                                {[0.25, 0.5, 0.75].map((tick) => (
                                    <div key={tick} className="absolute w-full h-px bg-zinc-800" style={{ bottom: `${tick * 100}%` }} />
                                ))}
                                <div
                                    className={cn(
                                        "absolute bottom-0 w-full transition-all duration-300 ease-out border-t",
                                        dotProduct < 0 ? "bg-rose-500/50 border-rose-400" : "bg-emerald-500/50 border-emerald-400"
                                    )}
                                    style={{ height: `${Math.min(Math.abs(dotProduct) * 33, 100)}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest text-center">
                                <InlineMath math="y" />
                            </span>
                        </div>
                    </div>

                    {/* Readout Formula Bar */}
                    <div className="w-full max-w-4xl bg-zinc-950/50 border border-zinc-800 rounded-xl p-6 shadow-sm backdrop-blur-md">
                        <div className="flex flex-wrap items-center justify-center gap-x-3 font-mono text-sm xl:text-lg">
                            <span className="text-zinc-600 italic mr-2"><InlineMath math="y =" /></span>
                            {weights.map((w, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <span className="text-zinc-700">+</span>}
                                    <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800/50">
                                        <span className={cn("font-bold w-12 text-right tabular-nums inline-block", w < 0 ? "text-rose-400" : "text-emerald-400")}>{w.toFixed(2)}</span>
                                        <span className="text-zinc-700">·</span>
                                        <span className="text-blue-400 w-12 text-right tabular-nums inline-block">{inputs[i].toFixed(2)}</span>
                                    </div>
                                </React.Fragment>
                            ))}
                            <span className="text-zinc-700 mx-2">=</span>
                            <span className={cn("font-bold text-xl w-20 text-center tabular-nums inline-block", dotProduct < 0 ? "text-rose-400" : "text-emerald-400")}>{dotProduct.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};
