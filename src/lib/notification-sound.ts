let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Plays a subtle notification chime using the Web Audio API.
 * Two-tone ascending beep (~200ms total).
 */
export function playNotificationSound(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    // First tone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.connect(gain);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Second tone (higher)
    const gain2 = ctx.createGain();
    gain2.connect(ctx.destination);
    gain2.gain.setValueAtTime(0.12, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.12); // D6
    osc2.connect(gain2);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.3);
  } catch {
    // Audio not available — silently skip
  }
}
