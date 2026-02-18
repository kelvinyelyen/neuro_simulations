import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

type Mode = 'math' | 'biol';

export const getLinearContent = (mode: Mode) => {
    if (mode === 'math') {
        return {
            title: "Vector Operations",
            subtitle: "Linear Algebra Fundamentals",
            sections: [
                {
                    title: "Vectors",
                    color: "blue",
                    content: (
                        <div className="space-y-2 text-sm text-zinc-300">
                            <p>
                                A <strong>vector</strong> is an ordered list of numbers (like <InlineMath math="\vec{x} = [x_1, x_2, \dots]" />) that represents a point or an arrow in space.
                            </p>
                            <p>
                                In this lab, we visualize vectors as <strong>bar charts</strong>, where the height of each bar corresponds to the value of a component.
                            </p>
                        </div>
                    )
                },
                {
                    title: "The Dot Product",
                    color: "emerald",
                    content: (
                        <div className="space-y-2 text-sm text-zinc-300">
                            <p>
                                The <strong>dot product</strong> measures how much two vectors points in the &quot;same direction&quot;.
                            </p>
                            <BlockMath>{"\\vec{a} \\cdot \\vec{b} = \\sum a_i b_i"}</BlockMath>
                            <p className="text-xs text-zinc-500 italic">
                                It is fundamental to many operations, from neural networks (similarity) to physics (work) and graphics (lighting).
                            </p>
                        </div>
                    )
                }
            ]
        };
    }

    return {
        title: "Visual Processing",
        subtitle: mode === 'biol' ? "Retina to LGN" : "Linear Integration",
        sections: [
            {
                title: "The Receptive Field",
                color: "emerald",
                content: (
                    <div className="space-y-2 text-sm text-zinc-300">
                        <p>
                            Neurons in the visual system (like the LGN) don&apos;t just &quot;see&quot; light. They look for specific <strong>patterns</strong> in space.
                        </p>
                        <p>
                            This preference is defined by their <strong>synaptic weights</strong> (<InlineMath math="\vec{w}" />).
                        </p>
                        <ul className="list-disc list-inside ml-2 space-y-1 mt-2">
                            <li>
                                <strong className="text-emerald-400">Excitatory (+):</strong> Light here makes the neuron fire.
                            </li>
                            <li>
                                <strong className="text-rose-400">Inhibitory (-):</strong> Light here silences the neuron.
                            </li>
                        </ul>
                    </div>
                )
            },
            {
                title: "Center-Surround Antagonism",
                color: "amber",
                content: (
                    <div className="space-y-2 text-sm text-zinc-300">
                        <p>
                            This structure creates a <strong>contrast detector</strong>. It ignores uniform light because the positive center and negative surround cancel each other out (<InlineMath math="\sum \approx 0" />).
                        </p>
                        <p>
                            The neuron only fires strongly when there is a <strong>difference</strong> in light intensity between the center and the surround (an edge or a spot).
                        </p>
                    </div>
                )
            },
            {
                title: "Mathematical Model",
                color: "blue",
                content: (
                    <div className="space-y-2 text-sm text-zinc-300">
                        <p>
                            We model the neuron&apos;s response as a <strong>Dot Product</strong> between the input image (<InlineMath math="\vec{r}" />) and the weight matrix (<InlineMath math="\vec{w}" />).
                        </p>
                        <BlockMath>{"LGN_{response} = \\vec{w} \\cdot \\vec{r} = \\sum w_i r_i"}</BlockMath>
                        <p className="text-xs text-zinc-500 italic">
                            If the input image matches the weight pattern (e.g., center light, surround dark), the dot product is maximized. If they are opposites, it&apos;s minimized.
                        </p>
                    </div>
                )
            }
        ]
    };
};
