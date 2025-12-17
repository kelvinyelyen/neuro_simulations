import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

type Mode = 'coin' | 'poisson';

export const getProbabilityContent = (mode: Mode) => {
    switch (mode) {
        case 'coin':
            return {
                title: "Bernoulli Trials",
                subtitle: "The Probabilistic Neuron",
                sections: [
                    {
                        title: "Ion Channels as Coins",
                        color: "emerald",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>
                                    At the microscopic level, biology is noisy. An ion channel isn&apos;t a perfect valve; it&apos;s a probabilistic machine.
                                </p>
                                <p>
                                    It flips between <strong>Open (1)</strong> and <strong>Closed (0)</strong> states, much like a coin flip.
                                </p>
                            </div>
                        )
                    },
                    {
                        title: "The Law of Large Numbers",
                        color: "blue",
                        content: (
                            <div className="text-sm text-zinc-300">
                                <p>
                                    A single channel is unpredictable. But a neuron has <strong>thousands</strong> of channels.
                                </p>
                                <p>
                                    As you flip more coins (N), the average behavior becomes stable and predictable. This is how reliable signals emerge from noisy components.
                                </p>
                            </div>
                        )
                    }
                ]
            };
        case 'poisson':
            return {
                title: "Poisson Processes",
                subtitle: "The Language of Spikes",
                sections: [
                    {
                        title: "Random Arrival Times",
                        color: "purple",
                        content: (
                            <div className="space-y-2 text-sm text-zinc-300">
                                <p>
                                    Neurons don&apos;t fire like perfect metronomes. Their spike times are often highly irregular.
                                </p>
                                <p>
                                    We model this as a <strong>Poisson Process</strong>, where spikes occur randomly with a certain rate <InlineMath>\lambda</InlineMath>.
                                </p>
                            </div>
                        )
                    },
                    {
                        title: "Exponential Intervals",
                        color: "amber",
                        content: (
                            <div className="text-sm text-zinc-300">
                                <p>
                                    If spike <i>times</i> are random, the waiting time <i>between</i> spikes (ISI) follows an <strong>Exponential Distribution</strong>.
                                </p>
                                <BlockMath>{"P(t) = \\lambda e^{-\\lambda t}"}</BlockMath>
                                <p>
                                    Short intervals are common, long intervals are rare. This is the signature of randomness.
                                </p>
                            </div>
                        )
                    }
                ]
            };
    }
};
