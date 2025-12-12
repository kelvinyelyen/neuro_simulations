'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export function ConceptDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900/50 transition-colors duration-200"
                >
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="text-xs font-mono tracking-wide">Concept Map</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-200 max-h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b border-zinc-900 bg-zinc-950 shrink-0">
                    <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span className="text-emerald-500">I.S.C.N.</span> Concept Map
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs">
                        Interactive Reference Guide
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 [&::-webkit-scrollbar]:hidden scrollbar-hide">
                    {/* Section 0: Big Picture */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-500/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <h3 className="text-sm font-bold text-emerald-400 font-mono uppercase tracking-wider">0. The Big Picture</h3>
                        </div>
                        <div className="p-4 bg-zinc-900/40 rounded-lg border border-zinc-800/50 text-sm leading-relaxed text-zinc-300 shadow-inner">
                            <p>
                                We are simulating a single <strong>Neuron</strong> (brain cell). Think of it like a tiny biological battery that charges up and then &quot;fires&quot; a signal.
                            </p>
                            <p className="mt-3 text-zinc-400">
                                Everything you see in the dashboard is calculating three things:
                                <br />
                                1. How it charges (Input)
                                <br />
                                2. How it leaks energy (Rest)
                                <br />
                                3. When it reaches the limit and zaps (Spike on the chart).
                            </p>
                        </div>
                    </section>

                    {/* Section 1: Biology (Analogy) */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-500/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <h3 className="text-sm font-bold text-blue-400 font-mono uppercase tracking-wider">1. The &apos;Leaky Bucket&apos; Analogy</h3>
                        </div>
                        <div className="p-4 bg-zinc-900/40 rounded-lg border border-zinc-800/50 text-sm leading-relaxed text-zinc-300 shadow-inner">
                            <p className="mb-3">
                                Imagine a bucket with a hole in the bottom:
                            </p>
                            <ul className="space-y-2 ml-1">
                                <li className="flex items-start gap-2">
                                    <div className="mt-1.5 w-1 h-1 bg-emerald-500 rounded-full shrink-0" />
                                    <span><strong className="text-emerald-400">Water Hose (Input):</strong> Pours water IN. This is the stimulation from the sliders.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1.5 w-1 h-1 bg-cyan-500 rounded-full shrink-0" />
                                    <span><strong className="text-cyan-400">The Hole (Leak):</strong> Lets water OUT. It constantly tries to empty the bucket to a resting level.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1.5 w-1 h-1 bg-white rounded-full shrink-0" />
                                    <span><strong className="text-zinc-100">Water Level (Voltage):</strong> The height of the water (or line on the chart).</span>
                                </li>
                            </ul>
                            <p className="mt-3 text-zinc-400 italic border-l-2 border-zinc-800 pl-3">
                                If you pour water fast enough, the bucket overflows. In a neuron, this overflow is a <strong>Spike</strong>!
                            </p>
                        </div>
                    </section>

                    {/* Section 2: Key Terms */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-500/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <h3 className="text-sm font-bold text-amber-400 font-mono uppercase tracking-wider">2. Key Terms</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded hover:border-zinc-700 transition-colors">
                                <strong className="text-zinc-200 text-xs uppercase block mb-1">Membrane Potential (V)</strong>
                                <p className="text-xs text-zinc-400">The &quot;Charge&quot; of the cell. Measured in millivolts (mV). Watch the Green Line.</p>
                            </div>
                            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded hover:border-zinc-700 transition-colors">
                                <strong className="text-zinc-200 text-xs uppercase block mb-1">Resting Potential (E_L)</strong>
                                <p className="text-xs text-zinc-400">The cell&apos;s &quot;Comfort Zone&quot;. Where it sits when idle (usually -70mV).</p>
                            </div>
                            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded hover:border-zinc-700 transition-colors">
                                <strong className="text-zinc-200 text-xs uppercase block mb-1">Threshold</strong>
                                <p className="text-xs text-zinc-400">The &quot;Limit&quot;. If Voltage crosses this red line, the cell fires!</p>
                            </div>
                            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded hover:border-zinc-700 transition-colors">
                                <strong className="text-zinc-200 text-xs uppercase block mb-1">Tau (τ)</strong>
                                <p className="text-xs text-zinc-400">&quot;Sluggishness&quot;. High Tau = Heavy bucket (changes slowly). Low Tau = Light bucket.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: The Circuit (Advanced) */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-500/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <h3 className="text-sm font-bold text-indigo-400 font-mono uppercase tracking-wider">3. The Circuit (Advanced)</h3>
                        </div>
                        <div className="p-4 bg-zinc-900/40 rounded-lg border border-zinc-800/50 text-sm leading-relaxed text-zinc-300 shadow-inner">
                            <p>
                                For the engineers: We model this as an RC Circuit.
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                                <li><strong className="text-zinc-300">Capacitor (C):</strong> The membrane itself. It holds the charge (Voltage).</li>
                                <li><strong className="text-zinc-300">Resistor (R):</strong> The ion channels. A high resistance means channels are closed (hard to leak). Low resistance means they are open.</li>
                                <li><strong className="text-zinc-300">Battery (E_L):</strong> The stable Resting Potential defined by the ion gradient.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3: Math */}
                    <section className="space-y-2">
                        <h3 className="text-lg font-medium text-indigo-400 font-mono">3. The Equation (Math)</h3>
                        <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50 text-sm leading-relaxed text-zinc-400">
                            <p className="font-mono bg-black/50 p-2 rounded text-center text-zinc-200 mb-2">
                                τ · (dV / dt) = -(V - E_L) + R · I
                            </p>
                            <p>
                                Think of this as a <strong>Tug of War</strong>:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                                <li><strong className="text-emerald-400">Drive (R · I):</strong> The input current pushing voltage UP.</li>
                                <li><strong className="text-rose-400">Leak -(V - E_L):</strong> The restorative force pulling voltage DOWN towards rest.</li>
                                <li><strong className="text-zinc-300">Tau (τ):</strong> The &quot;Time Constant&quot;. It&apos;s the inertia of the system. Larger τ means voltage changes slower.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4: Code */}
                    <section className="space-y-2">
                        <h3 className="text-lg font-medium text-amber-400 font-mono">4. The Code (Simulation)</h3>
                        <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50 text-sm leading-relaxed text-zinc-400">
                            <p>
                                Computers can&apos;t do &quot;continuous&quot; math perfectly, so we use the <strong>Forward Euler</strong> method.
                            </p>
                            <p className="mt-2">
                                We chop time into tiny steps (dt). At every single frame, we:
                            </p>
                            <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                                <li>Calculate the Net Force (Leak + Drive).</li>
                                <li>Determine how much Voltage changes (dV) over that tiny time step.</li>
                                <li>Add that change to the current Voltage.</li>
                                <li>Repeat!</li>
                            </ol>
                        </div>
                    </section>

                </div>
            </DialogContent>
        </Dialog>
    );
}
