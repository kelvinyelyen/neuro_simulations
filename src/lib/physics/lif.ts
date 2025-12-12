export type InputMode = 'constant' | 'pulse' | 'noise' | 'sine';

export interface PulseConfig {
    interval: number; // ms between pulses
    width: number;    // ms duration of pulse
    amplitude: number;// nA height
}

export interface NoiseConfig {
    mean: number;  // nA mean input
    sigma: number; // nA standard deviation
}

export interface SineConfig {
    frequency: number; // Hz
    amplitude: number; // nA peak-to-peak amplitude (0 to A) or centered? User said A*sin. Let's assume centered on 0 or centered on an offset? 
    // Formula: I(t) = A * sin(2*pi*f*t). This oscillates positive and negative. 
    // User likely wants to probe resonance, so +/- is good.
}

export interface LifParams {
    C: number;    // Capacitance (uF)
    R: number;    // Resistance (MOhm)
    E_L: number;  // Leak Reversal Potential (mV)
    I: number;    // Base Input Current (nA) - Used for 'constant' and 'mean' of noise
    dt: number;   // Time step (ms)
    thresh: number; // Spike threshold (mV)
    reset: number;  // Reset potential (mV)

    // Input Model Logic
    inputMode: InputMode;
    pulseConfig: PulseConfig;
    noiseConfig: NoiseConfig;
    sineConfig: SineConfig;
}

export interface ForceVectors {
    drive: number; // R * I(t)
    leak: number;  // -(V - E_L)
    net: number;   // drive + leak
}

export interface SimulationStepResult {
    voltage: number;
    time: number;
    spiked: boolean;
    forces: ForceVectors;
    currentI: number; // The actual I(t) used this step
}

/**
 * Box-Muller transform for Gaussian noise
 */
function randn_bm(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function calculateLifStep(
    voltage: number,
    time: number,
    params: LifParams
): SimulationStepResult {
    const { C, R, E_L, dt, thresh, reset, inputMode } = params;
    const tau = R * C; // Time constant (ms)

    // Calculate I(t) based on mode
    let currentI = 0;

    switch (inputMode) {
        case 'pulse': {
            // Simple pulse train: if time % interval < width
            // We need to be careful with floating point modulo.
            const { interval, width, amplitude } = params.pulseConfig;
            const cycleTime = time % interval;
            if (cycleTime < width) {
                currentI = amplitude;
            } else {
                currentI = 0;
            }
            break;
        }
        case 'noise': {
            const { mean, sigma } = params.noiseConfig;
            // It(t) = Mean + sigma * N(0,1)
            // Note: In discrete time, noise scaling often depends on sqrt(dt) for correct Wiener process scaling, 
            // but for "White Noise Current" metaphor, simple additive gaussian per step is usually sufficient for edu.
            // However, mathematically correct stochastic DE: dV = ... + (sigma/C)*dW. 
            // User asked for: I(t) = I_mean + sigma * Random().
            // We will stick to the user's explicit formula: I = mean + sigma * randn
            currentI = mean + sigma * randn_bm();
            break;
        }
        case 'sine': {
            const { frequency, amplitude } = params.sineConfig;
            // I(t) = A * sin(2 * pi * f * t)
            // time is in ms, frequency in Hz (1/s). So we need t/1000.
            currentI = amplitude * Math.sin(2 * Math.PI * frequency * (time / 1000));
            break;
        }
        case 'constant':
        default:
            currentI = params.I;
            break;
    }

    // Forces
    const leakForce = -(voltage - E_L);
    const driveForce = R * currentI;
    const netForce = leakForce + driveForce;

    // dV = (netForce / tau) * dt
    const dV = (netForce / tau) * dt;

    let newVoltage = voltage + dV;
    let spiked = false;

    if (newVoltage >= thresh) {
        newVoltage = reset;
        spiked = true;
    }

    return {
        voltage: newVoltage,
        time: time + dt,
        spiked,
        forces: {
            drive: driveForce,
            leak: leakForce,
            net: netForce,
        },
        currentI
    };
}
