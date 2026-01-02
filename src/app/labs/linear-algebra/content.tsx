import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

type Mode = 'math' | 'neuron';

export const getLinearContent = (mode: Mode) => {
    switch (mode) {
        case 'neuron':
            return {
                title: "Synaptic Integration",
                subtitle: "The Dendritic Tree",
                sections: [
                    {
                        title: "Spatial Summation",
                        color: "emerald",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>
                                    A neuron receives thousands of inputs. It computes a <strong>Weighted Sum</strong> of all these signals to decide whether to spike.
                                </p>
                                <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li>
                                        <strong className="text-blue-400">Firing Rate (<InlineMath math="x_i" />):</strong> How active the presynaptic neuron is.
                                    </li>
                                    <li>
                                        <strong className="text-amber-400">Synaptic Weight (<InlineMath math="w_i" />):</strong> The strength (and sign) of the connection.
                                    </li>
                                </ul>
                                <BlockMath>{"I_{soma} = \\sum w_i \\cdot x_i"}</BlockMath>
                            </div>
                        )
                    },
                    {
                        title: "E/I Balance",
                        color: "rose",
                        content: (
                            <div className="text-sm text-zinc-300">
                                <p>
                                    <strong>Inhibition</strong> is crucial. GABAergic neurons have <strong>negative weights</strong>.
                                </p>
                                <p className="mt-1">
                                    Without this negative feedback (subtraction), the brain would explode into a seizure.
                                </p>
                            </div>
                        )
                    }
                ]
            };

        default: // 'math' - The Synaptic Mixer
            return {
                title: "Linear Combination",
                subtitle: "The Dot Product",
                sections: [
                    {
                        title: "Mixing Inputs",
                        color: "emerald",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>
                                    This is the fundamental operation of Neural Networks: The <strong>Dot Product</strong>.
                                </p>
                                <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li>
                                        <strong className="text-blue-400">Vector (<InlineMath math="\vec{x}" />):</strong> The list of input values.
                                    </li>
                                    <li>
                                        <strong className="text-amber-400">Weights (<InlineMath math="\vec{w}" />):</strong> How much each input matters.
                                    </li>
                                </ul>
                                <BlockMath>{"y = \\vec{w} \\cdot \\vec{x} = \\sum w_i x_i"}</BlockMath>
                            </div>
                        )
                    },
                    {
                        title: "Geometry",
                        color: "rose",
                        content: (
                            <div className="text-sm text-zinc-300">
                                <p>
                                    Geometrically, this measures <strong>similarity</strong>.
                                </p>
                                <p className="mt-1">
                                    If <InlineMath>{"\\vec{w}"}</InlineMath> and <InlineMath>{"\\vec{x}"}</InlineMath> point in the same direction, the result is large. If they are perpendicular, the result is zero.
                                </p>
                            </div>
                        )
                    }
                ]
            };
    }
};
