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
                                <BlockMath>{"\\dot{V} = -(V - I)"}</BlockMath>
                                <p>
                                    Without input, the system decays exponentially to zero. The "velocity" of change depends entirely on how far you are from the target.
                                </p>
                            </div>
                        )
                    }
                ]
            };

        case 'time-constant':
            return {
                title: "Time Constant (τ)",
                subtitle: "The Speed of Dynamics",
                sections: [
                    {
                        title: "Resistance to Change",
                        color: "blue",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>
                                    Not all neurons react at the same speed. The Time Constant (<InlineMath>\tau</InlineMath>) dictates how "sluggish" the system is.
                                </p>
                                <BlockMath>{"\\tau \\dot{V} = -(V - I)"}</BlockMath>
                            </div>
                        )
                    },
                    {
                        title: "Memory",
                        color: "indigo",
                        content: (
                            <div className="text-sm text-zinc-300">
                                <p>
                                    <strong className="text-blue-400">High <InlineMath>\tau</InlineMath>:</strong> The neuron integrates information over a long time (Integration).
                                </p>
                                <p className="mt-2">
                                    <strong className="text-rose-400">Low <InlineMath>\tau</InlineMath>:</strong> The neuron reacts instantly to coincidences (Coincidence Detection).
                                </p>
                            </div>
                        )
                    }
                ]
            };

        case 'fixed-points':
            return {
                title: "Fixed Points",
                subtitle: "Equilibrium & Stability",
                sections: [
                    {
                        title: "Zero Velocity",
                        color: "fuchsia",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>
                                    A fixed point is a state where the neuron stops changing. In the Phase Plane, this is where the flow vectors have zero length.
                                </p>
                                <BlockMath>{"\\dot{V} = 0"}</BlockMath>
                            </div>
                        )
                    },
                    {
                        title: "Attractors",
                        color: "lime",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>
                                    Most biological fixed points are <strong>Stable Nodes</strong> (Attractors). They pull all nearby trajectories into them, acting like a magnet for the voltage.
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
                                <p>The defining feature of a neuron: <strong>The Action Potential</strong>. </p>
                                <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li>
                                        <strong className="text-emerald-400">Fast Na+ (<InlineMath>V</InlineMath>):</strong> Explodes open when voltage rises (Positive Feedback).
                                    </li>
                                    <li>
                                        <strong className="text-amber-400">Slow K+ (<InlineMath>w</InlineMath>):</strong> Slowly opens to shut the system down (Recovery).
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
                                    If input <InlineMath>I</InlineMath> is high enough, the stable Fixed Point disappears.
                                </p>
                                <p className="mt-2">
                                    The system gets trapped in a loop called a <strong>Limit Cycle</strong>—repetitive firing. This is how neurons encode continuous intensity.
                                </p>
                            </div>
                        )
                    }
                ]
            };
    }
};
