// Synth voices. Each instrument schedules one note into `output` and returns the time
// its sound has fully died away. Envelopes use setTargetAtTime so nothing clicks.

export function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * "keys": soft electric-piano-like. A sine carrier with a sine modulator whose depth
 * falls quickly, giving a bright attack that settles into a round tone. Short decay.
 */
function keys(ctx, output, { midi, when, duration, velocity }) {
  const frequency = midiToFrequency(midi);
  const off = when + Math.max(duration, 0.05);
  const peak = 0.3 * velocity;
  const release = 0.12;

  const carrier = ctx.createOscillator();
  carrier.frequency.value = frequency;

  const modulator = ctx.createOscillator();
  modulator.frequency.value = frequency;
  const depth = ctx.createGain();
  depth.gain.setValueAtTime(frequency * 1.6 * velocity, when);
  depth.gain.setTargetAtTime(frequency * 0.25, when, 0.08);
  modulator.connect(depth).connect(carrier.frequency);

  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0, when);
  amp.gain.linearRampToValueAtTime(peak, when + 0.005);
  amp.gain.setTargetAtTime(peak * 0.25, when + 0.005, 0.4);
  amp.gain.setTargetAtTime(0, off, release);

  carrier.connect(amp).connect(output);
  return start([carrier, modulator], when, off + release * 7);
}

/** "pad": two detuned saws through a low-pass filter, slow attack and long release. */
function pad(ctx, output, { midi, when, duration, velocity }) {
  const frequency = midiToFrequency(midi);
  const off = when + Math.max(duration, 0.05);
  const peak = 0.12 * velocity;
  const attack = 0.15; // time constant: ~95% after 0.45 s
  const release = 0.35;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = Math.min(4000, Math.max(600, frequency * 4));
  filter.Q.value = 0.5;

  const oscillators = [-8, 8].map((cents) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = frequency;
    osc.detune.value = cents;
    osc.connect(filter);
    return osc;
  });

  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0, when);
  amp.gain.setTargetAtTime(peak, when, attack);
  amp.gain.setTargetAtTime(0, off, release);

  filter.connect(amp).connect(output);
  return start(oscillators, when, off + release * 7);
}

function start(oscillators, when, end) {
  for (const osc of oscillators) {
    osc.start(when);
    osc.stop(end);
  }
  return end;
}

export const instruments = { keys, pad };
export const DEFAULT_INSTRUMENT = 'keys';
