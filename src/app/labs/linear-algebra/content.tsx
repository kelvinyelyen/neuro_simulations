import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

export type Mode = 'math' | 'neuron' | 'circuit' | 'stability' | 'economy' | 'memory';

export const getLinearContent = (mode: Mode) => {
    switch (mode) {
        case 'neuron':
            return {
                title: "The Formal Neuron",
                subtitle: "Vectors in Space",
                sections: [
                    {
                        title: "Spatial Summation",
                        color: "purple",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>A neuron computes a <strong>Weighted Sum</strong> to decide whether to spike. </p>
                                <BlockMath math="I_{\text{sum}} = \vec{w} \cdot \vec{x}" />
                            </div>
                        )
                    }
                ]
            };
        case 'circuit':
            return {
                title: "Voltage Dividers",
                subtitle: "Ohm's Law Integration",
                sections: [
                    {
                        title: "Parallel Conductance",
                        color: "blue",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>In a circuit, inputs are currents. The "weights" are the <strong>conductances</strong> of the channels. </p>
                                <BlockMath math="V_{out} = \frac{\sum g_i V_i}{\sum g_i}" />
                            </div>
                        )
                    }
                ]
            };
        case 'stability':
            return {
                title: "E/I Balance",
                subtitle: "Inhibitory Subtraction",
                sections: [
                    {
                        title: "The Role of Negative Weights",
                        color: "rose",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>Stability requires subtraction. Negative weights (Inhibition) prevent runaway excitation (seizures).</p>
                                <p className="text-rose-400 font-mono text-xs">If Σw_i > Threshold → Runaway</p>
                            </div>
                        )
                    }
                ]
            };
        case 'economy':
            return {
                title: "Neural Economy",
                subtitle: "Sparse Coding",
                sections: [
                    {
                        title: "Metabolic Cost",
                        color: "amber",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>Action potentials are expensive. The brain uses linear algebra to represent information using the <strong>fewest vectors possible</strong>.</p>
                            </div>
                        )
                    }
                ]
            };
        case 'memory':
            return {
                title: "Synaptic Memory",
                subtitle: "Weight Plasticity",
                sections: [
                    {
                        title: "Storing Information",
                        color: "emerald",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>Learning is the process of changing the <strong>Weight Vector</strong> (<InlineMath math="\vec{w}" />). </p>
                                <p className="mt-1">When you remember a face, you are recalling a specific linear combination of inputs.</p>
                            </div>
                        )
                    }
                ]
            };
        default: // 'math'
            return {
                title: "Linear Combination",
                subtitle: "The Dot Product",
                sections: [
                    {
                        title: "Geometric Similarity",
                        color: "emerald",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>The dot product measures how much one vector "overlaps" another. </p>
                                <BlockMath math="y = \sum w_i x_i" />
                            </div>
                        )
                    }
                ]
            };
    }
};
