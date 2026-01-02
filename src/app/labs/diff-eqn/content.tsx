import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

type Mode = 'leak' | 'time-constant' | 'fixed-points' | 'spike';

export const getPhaseContent = (mode: Mode) => {
    switch (mode) {
        case 'leak':
            return {
                title: "Linear Leak",
                subtitle: "The Passive Membrane",
                sections: [
                    {
                        title: "The RC Circuit",
                        color: "purple",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>
                                    The simplest model of a neuron is just a leaky capacitor.
                                </p>
                                <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li>
                                        <strong className="text-emerald-400">Voltage (<InlineMath>V</InlineMath>):</strong> Uses energy to push ions across the membrane.
                                    </li>
                                    <li>
                                        <strong className="text-amber-400">Leak (<InlineMath>g_L</InlineMath>):</strong> Ions escape through channels, pulling Voltage back to rest (0).
                                    </li>
                                </ul>
                            </div>
                        )
                    },
                    {
                        title: "Exponential Decay",
                        color: "blue",
                        content: (
                            <div className="text-sm text-zinc-300">
                                <BlockMath>{"\\dot{V} = -V + I_{ext}"}</BlockMath>
                                <p>
                                    Without input (<InlineMath>I=0</InlineMath>), the system decays exponentially to zero. This is the &quot;forgetting&quot; mechanism of the brain.
                                </p>
                            </div>
                        )
                    }
                ]
            };

        case 'resonator':
            return {
                title: "The Resonator",
                subtitle: "Subthreshold Oscillations",
                sections: [
                    {
                        title: "Two Forces",
                        color: "cyan",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>
                                    Some neurons don&apos;t just decay; they bounce. This happens when you have two competing currents.
                                </p>
                                <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li>
                                        <strong className="text-blue-400">Restoring Force:</strong> Pushes voltage back to rest.
                                    </li>
                                    <li>
                                        <strong className="text-amber-400">Slow Negative Feedback:</strong> A delayed current (like <InlineMath>I_h</InlineMath>) that overshoots.
                                    </li>
                                </ul>
                            </div>
                        )
                    },
                    {
                        title: " damped Oscillations",
                        color: "amber",
                        content: (
                            <div className="text-sm text-zinc-300">
                                <BlockMath>{"\\dot{V} = w"}</BlockMath>
                                <BlockMath>{"\\dot{w} = -V - \\delta w"}</BlockMath>
                                <p>
                                    This creates a &quot;preferred frequency&quot; at which the neuron likes to vibrate (Resonance).
                                </p>
                            </div>
                        )
                    }
                ]
            };

        case 'spike':
            return {
                title: "The Spike",
                subtitle: "FitzHugh-Nagumo Model",
                sections: [
                    {
                        title: "Excitability",
                        color: "emerald",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>The defining feature of a neuron: <strong>The Action Potential</strong>.</p>
                                <p>It requires positive feedback to explode away from rest.</p>
                                <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li>
                                        <strong className="text-emerald-400">Fast Na+ (<InlineMath>V</InlineMath>):</strong> Explodes open when voltage rises.
                                    </li>
                                    <li>
                                        <strong className="text-amber-400">Slow K+ (<InlineMath>w</InlineMath>):</strong> Slowly opens to shut the system down (refractory period).
                                    </li>
                                </ul>
                            </div>
                        )
                    },
                    {
                        title: "Limit Cycles",
                        color: "rose",
                        content: (
                            <div className="text-sm text-zinc-300">
                                <p>
                                    If input <InlineMath>I</InlineMath> is high enough, the Fixed Point becomes unstable.
                                </p>
                                <p className="mt-2">
                                    The system enters a <strong>Limit Cycle</strong>—repetitive firing. This is how neurons encode strong signals.
                                </p>
                            </div>
                        )
                    }
                ]
            };

        default: // 'math'
            return {
                title: "The Phase Plane",
                subtitle: "A Map of All Possibilities",
                sections: [
                    {
                        title: "Geometric Thinking",
                        color: "blue",
                        content: (
                            <div className="text-sm text-zinc-300">
                                <p>
                                    Instead of simulating time (<InlineMath>t</InlineMath>), we look at Geometry.
                                </p>
                                <p className="mt-2">
                                    Every point on this screen is a possible state of the neuron. The arrows tell you where that state will move next.
                                </p>
                            </div>
                        )
                    },
                    {
                        title: "Nullclines",
                        color: "orange",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <div className="p-2 border border-emerald-500/30 rounded bg-emerald-500/10">
                                    <strong className="text-emerald-400">Green Line (<InlineMath>{"\\dot{V}=0"}</InlineMath>)</strong>
                                    <p>Where Voltage stops changing. (The Balance of Currents)</p>
                                </div>
                                <div className="p-2 border border-amber-500/30 rounded bg-amber-500/10">
                                    <strong className="text-amber-400">Orange Line (<InlineMath>{"\\dot{w}=0"}</InlineMath>)</strong>
                                    <p>Where Recovery stops changing. (The Steady State)</p>
                                </div>
                            </div>
                        )
                    }
                ]
            };
    }
};
