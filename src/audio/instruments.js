import * as Tone from 'tone';
import { getInputNode } from './engine.js';

let instruments = {};
let connected = false;

// Color palette for each pad (used by visualizer)
const PAD_COLORS = [
  '#6c5ce7', '#a29bfe', '#00cec9', '#81ecec',
  '#fd79a8', '#fab1a0', '#fdcb6e', '#ffeaa7',
  '#00b894', '#55efc4', '#e17055', '#ff7675',
  '#0984e3', '#74b9ff', '#d63031', '#e84393',
];

// Note mapping for melodic pads (C minor pentatonic across 2 octaves)
const PAD_NOTES = [
  'C5', 'Eb5', 'F5', 'G5',
  'Bb4', 'C5', 'Eb4', 'F4',
  'G4', 'Bb4', 'C4', 'Eb4',
  'F3', 'G3', 'Bb3', 'C4',
];

// Labels for pads
const PAD_LABELS = [
  'C5', 'Eb5', 'F5', 'G5',
  'Bb4', 'C5', 'Eb4', 'F4',
  'G4', 'Bb4', 'C4', 'Eb4',
  'F3', 'G3', 'Bb3', 'C4',
];

// Drum sound names for sequencer
const DRUM_NAMES = ['kick', 'snare', 'hihat', 'clap', 'tom'];

export function getInstruments() { return instruments; }
export function getPadColors() { return PAD_COLORS; }
export function getPadNotes() { return PAD_NOTES; }
export function getPadLabels() { return PAD_LABELS; }
export function getDrumNames() { return DRUM_NAMES; }

export function createInstruments() {
  const input = getInputNode();

  instruments.melodic = new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 8,
    voice: Tone.Synth,
    options: {
      oscillator: { type: 'triangle8' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.8 },
      volume: -6,
    },
  }).connect(input);

  instruments.fm = new Tone.PolySynth(Tone.FMSynth, {
    maxPolyphony: 6,
    options: {
      modulationIndex: 3,
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 },
      volume: -10,
    },
  }).connect(input);

  instruments.kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
    volume: -4,
  }).connect(input);

  instruments.snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
    volume: -8,
  }).connect(input);

  instruments.hihat = new Tone.MetalSynth({
    frequency: 400,
    envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
    volume: -12,
  }).connect(input);

  instruments.clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.003, decay: 0.12, sustain: 0, release: 0.08 },
    volume: -10,
  }).connect(input);

  instruments.tom = new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.2 },
    volume: -6,
  }).connect(input);

  connected = true;
}

// Play a pad by index (0-15)
export function playPad(index) {
  if (!connected) return;
  const note = PAD_NOTES[index];
  instruments.melodic.triggerAttackRelease(note, '8n');
}

// Play a drum by name
export function playDrum(name) {
  if (!connected || !instruments[name]) return;
  const inst = instruments[name];
  if (name === 'kick' || name === 'tom') {
    inst.triggerAttackRelease(name === 'kick' ? 'C1' : 'G1', '8n');
  } else if (name === 'hihat') {
    inst.triggerAttackRelease('C4', '32n');
  } else {
    inst.triggerAttackRelease('8n');
  }
}

// Release all melodic voices
export function releaseAll() {
  if (instruments.melodic) instruments.melodic.releaseAll();
  if (instruments.fm) instruments.fm.releaseAll();
}
