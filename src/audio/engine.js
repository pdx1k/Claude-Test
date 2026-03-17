import * as Tone from 'tone';

// Master effects chain
let filter, delay, reverb, panner, compressor, crusher, analyser;
let masterGain;
let isInitialized = false;

export function getAnalyser() { return analyser; }
export function getFilter() { return filter; }
export function getReverb() { return reverb; }
export function getPanner() { return panner; }
export function getCrusher() { return crusher; }

export async function initAudioEngine() {
  if (isInitialized) return;
  await Tone.start();

  // Effects chain
  filter = new Tone.Filter({ frequency: 4000, type: 'lowpass', rolloff: -24 });
  delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.2, wet: 0.15 });
  reverb = new Tone.Reverb({ decay: 2.5, wet: 0.2, preDelay: 0.01 });
  panner = new Tone.Panner(0);
  crusher = new Tone.BitCrusher({ bits: 16, wet: 0 });
  compressor = new Tone.Compressor({ threshold: -20, ratio: 4 });
  masterGain = new Tone.Gain(0.75);
  analyser = new Tone.Analyser({ type: 'waveform', size: 1024 });

  // Chain: filter → crusher → delay → reverb → panner → compressor → gain → analyser → out
  filter.chain(crusher, delay, reverb, panner, compressor, masterGain, analyser, Tone.getDestination());

  await reverb.ready;
  isInitialized = true;
}

export function getInputNode() {
  return filter;
}

export function setVolume(value) {
  // value: 0-1
  if (masterGain) {
    masterGain.gain.rampTo(value, 0.05);
  }
}

export function setFilterFrequency(freq) {
  if (filter) filter.frequency.rampTo(freq, 0.08);
}

export function setReverbWet(wet) {
  if (reverb) reverb.wet.rampTo(wet, 0.08);
}

export function setPan(pan) {
  if (panner) panner.pan.rampTo(pan, 0.08);
}

export function setCrusherWet(wet) {
  if (crusher) {
    crusher.wet.rampTo(wet, 0.05);
    if (wet > 0.1) {
      crusher.bits.value = 4;
    } else {
      crusher.bits.value = 16;
    }
  }
}

export function getTransport() {
  return Tone.getTransport();
}
