import * as Tone from 'tone';
import { playDrum, getDrumNames } from './instruments.js';
import { getTransport } from './engine.js';

const STEPS = 16;
let grid = {}; // { kick: [0,0,1,...], snare: [...], ... }
let sequenceLoop = null;
let currentStep = -1;
let isPlaying = false;
let onStepCallback = null;

export function getGrid() { return grid; }
export function getCurrentStep() { return currentStep; }
export function isSequencerPlaying() { return isPlaying; }
export function setOnStep(cb) { onStepCallback = cb; }

export function initGrid() {
  const names = getDrumNames();
  names.forEach(name => {
    grid[name] = new Array(STEPS).fill(0);
  });
}

export function toggleStep(name, step) {
  if (grid[name]) {
    grid[name][step] = grid[name][step] ? 0 : 1;
  }
}

export function setStep(name, step, value) {
  if (grid[name]) {
    grid[name][step] = value;
  }
}

export function clearRow(name) {
  if (grid[name]) {
    grid[name].fill(0);
  }
}

// Björklund/Euclidean algorithm
export function euclidean(pulses, steps) {
  if (pulses >= steps) return new Array(steps).fill(1);
  if (pulses <= 0) return new Array(steps).fill(0);

  let pattern = Array.from({ length: steps }, (_, i) => [i < pulses ? 1 : 0]);

  while (true) {
    const first = pattern[0];
    let headCount = 0;
    let tailCount = 0;
    for (const p of pattern) {
      if (p.length === first.length) headCount++;
      else tailCount++;
    }
    if (tailCount <= 1) break;

    const min = Math.min(headCount, tailCount);
    const newPattern = [];
    for (let i = 0; i < min; i++) {
      newPattern.push([...pattern[i], ...pattern[pattern.length - 1 - i]]);
    }
    const remainder = pattern.slice(min, pattern.length - min);
    pattern = [...newPattern, ...remainder];
  }

  return pattern.flat();
}

export function applyEuclidean(name, pulses) {
  if (!grid[name]) return;
  const result = euclidean(pulses, STEPS);
  grid[name] = result;
}

export function startSequencer() {
  const transport = getTransport();
  if (sequenceLoop) {
    sequenceLoop.dispose();
  }

  currentStep = -1;
  const names = getDrumNames();

  sequenceLoop = new Tone.Sequence(
    (time, step) => {
      currentStep = step;
      names.forEach(name => {
        if (grid[name] && grid[name][step]) {
          playDrum(name);
        }
      });
      if (onStepCallback) onStepCallback(step);
    },
    Array.from({ length: STEPS }, (_, i) => i),
    '16n'
  );

  sequenceLoop.start(0);
  transport.start();
  isPlaying = true;
}

export function stopSequencer() {
  const transport = getTransport();
  if (sequenceLoop) {
    sequenceLoop.stop();
    sequenceLoop.dispose();
    sequenceLoop = null;
  }
  transport.stop();
  currentStep = -1;
  isPlaying = false;
  if (onStepCallback) onStepCallback(-1);
}

export function setTempo(bpm) {
  Tone.getTransport().bpm.value = bpm;
}

// Preset patterns
export function loadPreset(name) {
  initGrid();
  const names = getDrumNames();

  switch (name) {
    case 'basic':
      grid.kick = [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0];
      grid.snare = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];
      grid.hihat = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0];
      break;
    case 'euclidean':
      grid.kick = euclidean(4, STEPS);
      grid.snare = euclidean(3, STEPS);
      grid.hihat = euclidean(7, STEPS);
      grid.clap = euclidean(2, STEPS);
      grid.tom = euclidean(5, STEPS);
      break;
    case 'polyrhythm':
      grid.kick = euclidean(3, STEPS);
      grid.snare = euclidean(5, STEPS);
      grid.hihat = euclidean(9, STEPS);
      grid.clap = euclidean(7, STEPS);
      grid.tom = euclidean(4, STEPS);
      break;
  }
}
