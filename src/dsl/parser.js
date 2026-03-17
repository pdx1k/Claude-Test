import { playDrum, getDrumNames } from '../audio/instruments.js';
import { euclidean } from '../audio/sequencer.js';
import { getMotion } from '../motion/controller.js';

// Mini-notation DSL parser
// Syntax:
//   "bd sd _ hh"     — sequence of sounds (_ = rest)
//   .speed(n)        — multiply playback rate
//   .reverse()       — reverse the pattern
//   .euclidean(p, s) — redistribute using Euclidean algorithm
//   .every(n, fn)    — apply transform every n cycles
//   motion.x, motion.y, motion.shake — live values

// Sound aliases
const SOUND_MAP = {
  'bd': 'kick', 'kick': 'kick', 'kk': 'kick',
  'sd': 'snare', 'snare': 'snare', 'sn': 'snare',
  'hh': 'hihat', 'hihat': 'hihat', 'hat': 'hihat',
  'cp': 'clap', 'clap': 'clap',
  'tm': 'tom', 'tom': 'tom',
  '_': null, '~': null, '.': null, 'rest': null,
};

export class Pattern {
  constructor(events) {
    this.events = events; // Array of sound names (or null for rests)
    this.speedMultiplier = 1;
    this.cycleCount = 0;
  }

  speed(n) {
    const p = new Pattern([...this.events]);
    p.speedMultiplier = n;
    return p;
  }

  reverse() {
    const p = new Pattern([...this.events].reverse());
    p.speedMultiplier = this.speedMultiplier;
    return p;
  }

  euclidean(pulses, steps) {
    const euc = euclidean(pulses, steps);
    // Map euclidean pattern onto the sound events
    const sounds = this.events.filter(e => e !== null);
    if (sounds.length === 0) return this;

    const newEvents = euc.map((hit, i) => {
      if (hit) return sounds[i % sounds.length];
      return null;
    });
    const p = new Pattern(newEvents);
    p.speedMultiplier = this.speedMultiplier;
    return p;
  }

  // Get the current event for a given step position (normalized 0-1)
  getEvent(position) {
    if (this.events.length === 0) return null;
    const idx = Math.floor(position * this.events.length) % this.events.length;
    return this.events[idx];
  }
}

// Parse a mini-notation string into a Pattern
function parseSequence(str) {
  const tokens = str.trim().split(/\s+/);
  const events = tokens.map(token => {
    const lower = token.toLowerCase();
    if (lower in SOUND_MAP) return SOUND_MAP[lower];
    return null;
  });
  return new Pattern(events);
}

// Parse and evaluate a complete expression
export function parseExpression(code) {
  // Replace motion references with actual values
  const m = getMotion();

  // Simple expression parser
  // Expected format: "sound1 sound2 _ sound3".method(args).method(args)
  try {
    // Extract the quoted string part
    const stringMatch = code.match(/^["'`]([^"'`]+)["'`]/);
    if (!stringMatch) {
      return { error: 'Pattern must start with a quoted string, e.g. "bd sd _ hh"' };
    }

    let pattern = parseSequence(stringMatch[1]);

    // Parse chained method calls
    let remaining = code.slice(stringMatch[0].length).trim();

    while (remaining.startsWith('.')) {
      // Match .methodName(args)
      const methodMatch = remaining.match(/^\.(\w+)\(([^)]*)\)/);
      if (!methodMatch) {
        const simpleMatch = remaining.match(/^\.(\w+)\(\)/);
        if (simpleMatch) {
          const method = simpleMatch[1];
          if (method === 'reverse') {
            pattern = pattern.reverse();
          } else {
            return { error: `Unknown method: ${method}` };
          }
          remaining = remaining.slice(simpleMatch[0].length).trim();
          continue;
        }
        break;
      }

      const method = methodMatch[1];
      const argsStr = methodMatch[2].trim();

      // Resolve motion values in args
      const resolvedArgs = argsStr
        .replace(/motion\.x/g, m.x.toFixed(3))
        .replace(/motion\.y/g, m.y.toFixed(3))
        .replace(/motion\.shake/g, m.shake.toFixed(3));

      const args = resolvedArgs.split(',').map(a => {
        const n = parseFloat(a.trim());
        return isNaN(n) ? a.trim() : n;
      });

      switch (method) {
        case 'speed':
          pattern = pattern.speed(args[0] || 1);
          break;
        case 'reverse':
          pattern = pattern.reverse();
          break;
        case 'euclidean':
          pattern = pattern.euclidean(args[0] || 3, args[1] || 8);
          break;
        default:
          return { error: `Unknown method: ${method}` };
      }

      remaining = remaining.slice(methodMatch[0].length).trim();
    }

    return { pattern, error: null };
  } catch (e) {
    return { error: e.message };
  }
}

// Multi-line: parse each line as a separate pattern
export function parseCode(code) {
  const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
  const patterns = [];
  const errors = [];

  for (const line of lines) {
    const result = parseExpression(line.trim());
    if (result.error) {
      errors.push(result.error);
    } else if (result.pattern) {
      patterns.push(result.pattern);
    }
  }

  return { patterns, errors };
}

// Code presets
export const CODE_PRESETS = {
  minimal: `"bd _ sd _".speed(1)\n"_ hh _ hh".speed(1)`,
  techno: `"bd _ _ bd _ _ bd _".speed(1)\n"_ _ sd _ _ _ sd _".speed(1)\n"hh hh hh hh hh hh hh hh".speed(2)`,
  ambient: `"bd _ _ _ _ _ _ _".speed(0.5)\n"_ _ _ sd _ _ _ _".speed(0.5)`,
  motion: `"bd sd hh cp".speed(motion.x)\n"tm _ bd _".euclidean(3, 8)`,
};
