// Biological Constants and Defaults

export const BIOPHYSICS = {
    // Default neuron properties
    NEURON: {
        C: 1.0,       // nF (1e-9 F)
        gL: 0.1,      // uS (1e-6 S) => R = 10 MOhms
        El: -70.0,    // mV
        Vth: -55.0,   // mV
        Vreset: -80.0 // mV
    },

    // Simulation defaults
    SIMULATION: {
        dt: 0.1,      // ms
        duration: 1000 // ms (Window size)
    },

    // Units for display
    UNITS: {
        VOLTAGE: 'mV',
        CURRENT: 'nA',
        CONDUCTANCE: 'uS',
        TIME: 'ms',
        CAPACITANCE: 'nF'
    }
} as const;
