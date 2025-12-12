import { create } from 'zustand';
import { calculateLifStep, LifParams, ForceVectors } from '@/lib/physics/lif';

export interface TracePoint {
    time: number;
    voltage: number;
    spiked: boolean;
    input: number; // Store the input current too for debugging/viz if needed
}

interface SimulationState {
    // Params
    params: LifParams;
    setParams: (params: Partial<LifParams>) => void;
    updateConfig: (
        type: 'pulse' | 'noise' | 'sine',
        config: Partial<LifParams['pulseConfig'] | LifParams['noiseConfig'] | LifParams['sineConfig']>
    ) => void;

    // Simulation Status
    isRunning: boolean;
    setIsRunning: (isRunning: boolean) => void;
    resetSimulation: () => void;

    // Data
    currentTime: number;
    voltage: number;
    history: TracePoint[];
    maxHistoryPoints: number;

    // Forces for Monitor
    forces: ForceVectors;

    // Ghost Trace
    ghostTrace: TracePoint[] | null;
    captureGhostTrace: () => void;
    clearGhostTrace: () => void;

    // Interaction
    hoveredTerm: string | null; // For equation bi-directional highlighting
    setHoveredTerm: (term: string | null) => void;

    // Actions
    step: () => void;
}

const DEFAULT_PARAMS: LifParams = {
    C: 1,       // 1 uF
    R: 10,      // 10 MOhm
    E_L: -70,   // -70 mV
    I: 0,       // 0 nA (Base const)
    dt: 0.1,    // 0.1 ms step
    thresh: -50,// -50 mV
    reset: -80, // -80 mV

    inputMode: 'constant',
    pulseConfig: {
        interval: 50, // ms
        width: 5,     // ms
        amplitude: 15 // nA
    },
    noiseConfig: {
        mean: 2,
        sigma: 5
    },
    sineConfig: {
        frequency: 5, // Hz
        amplitude: 10 // nA
    }
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
    params: DEFAULT_PARAMS,
    setParams: (newParams) => {
        set((state) => ({ params: { ...state.params, ...newParams } }));
    },
    updateConfig: (type, config) => {
        set((state) => {
            const newParams = { ...state.params };
            if (type === 'pulse') {
                newParams.pulseConfig = { ...newParams.pulseConfig, ...(config as Partial<LifParams['pulseConfig']>) };
            } else if (type === 'noise') {
                newParams.noiseConfig = { ...newParams.noiseConfig, ...(config as Partial<LifParams['noiseConfig']>) };
            } else if (type === 'sine') {
                newParams.sineConfig = { ...newParams.sineConfig, ...(config as Partial<LifParams['sineConfig']>) };
            }
            return { params: newParams };
        });
    },

    isRunning: false,
    setIsRunning: (isRunning) => set({ isRunning }),
    resetSimulation: () => set({
        currentTime: 0,
        voltage: DEFAULT_PARAMS.E_L,
        history: [],
        forces: { drive: 0, leak: 0, net: 0 }
    }),

    currentTime: 0,
    voltage: DEFAULT_PARAMS.E_L,
    history: [],
    maxHistoryPoints: 500,

    forces: { drive: 0, leak: 0, net: 0 },

    ghostTrace: null,
    captureGhostTrace: () => {
        const { history } = get();
        set({ ghostTrace: [...history] });
    },
    clearGhostTrace: () => set({ ghostTrace: null }),

    hoveredTerm: null,
    setHoveredTerm: (term) => set({ hoveredTerm: term }),

    step: () => {
        const { voltage, currentTime, params, history, maxHistoryPoints } = get();

        // Run physics step
        const result = calculateLifStep(voltage, currentTime, params);

        // Update History
        const newPoint: TracePoint = {
            time: result.time,
            voltage: result.voltage,
            spiked: result.spiked,
            input: result.currentI
        };

        const newHistory = [...history, newPoint].slice(-maxHistoryPoints);

        set({
            voltage: result.voltage,
            currentTime: result.time,
            history: newHistory,
            forces: result.forces,
        });
    },
}));
