// AudioContext and master chain: input → (dry + reverb) → compressor → volume → speakers.
// Browsers only let audio start after a user gesture, so the context is created lazily.

const REVERB_SECONDS = 2;
const REVERB_WET = 0.18;
const FADE_TIME_CONSTANT = 0.015; // ~70 ms to silence, fast but click-free

let ctx = null;
let input = null;
let volume = null;
let volumeLevel = 0.8;

/**
 * Creates (on first call) and resumes the AudioContext. Call it from a user gesture
 * handler; everything that plays sound goes through here.
 */
export function init() {
  if (!ctx) {
    ctx = new AudioContext({ latencyHint: 'interactive' });
    buildMasterChain();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Initializes audio on the first pointer or key press anywhere in `target`. */
export function unlockOnGesture(target = document) {
  const events = ['pointerdown', 'keydown'];
  const unlock = () => {
    init();
    events.forEach((type) => target.removeEventListener(type, unlock, true));
  };
  events.forEach((type) => target.addEventListener(type, unlock, true));
}

export function isReady() {
  return ctx !== null && ctx.state === 'running';
}

/** Master input that instruments connect to. */
export function masterInput() {
  init();
  return input;
}

/** Output volume 0–1, on a squared curve so the slider feels even. */
export function setVolume(level) {
  volumeLevel = Math.min(1, Math.max(0, level));
  if (volume) volume.gain.setTargetAtTime(volumeLevel ** 2, ctx.currentTime, 0.02);
}

export function getVolume() {
  return volumeLevel;
}

/** Seconds between a scheduled time and the moment it's heard. */
export function outputLatency() {
  return ctx ? (ctx.outputLatency || ctx.baseLatency || 0) : 0;
}

/** A gain node in front of the master input, so a group of voices can be faded out together. */
export function createBus() {
  const bus = init().createGain();
  bus.connect(masterInput());
  return bus;
}

/** Fades a bus to silence and disconnects it afterwards. */
export function fadeOutBus(bus) {
  const now = ctx.currentTime;
  bus.gain.cancelScheduledValues(now);
  bus.gain.setTargetAtTime(0, now, FADE_TIME_CONSTANT);
  setTimeout(() => bus.disconnect(), FADE_TIME_CONSTANT * 10 * 1000);
}

function buildMasterChain() {
  input = ctx.createGain();

  const reverb = ctx.createConvolver();
  reverb.buffer = impulseResponse(REVERB_SECONDS);
  const wet = ctx.createGain();
  wet.gain.value = REVERB_WET;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 12;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.005;
  compressor.release.value = 0.2;

  volume = ctx.createGain();
  volume.gain.value = volumeLevel ** 2;

  input.connect(compressor);
  input.connect(reverb).connect(wet).connect(compressor);
  compressor.connect(volume).connect(ctx.destination);
}

// Stereo noise with an exponential decay: a small, neutral room.
function impulseResponse(seconds) {
  const length = Math.round(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    }
  }
  return buffer;
}
