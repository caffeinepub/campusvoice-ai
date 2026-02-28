// Web Audio API service for emergency sounds

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

export function playConfirmationBeep(): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Silently fail if audio is blocked
  }
}

export function playEmergencySiren(durationSeconds = 5): void {
  try {
    const ctx = getAudioContext();
    const totalDuration = durationSeconds;
    const whoopDuration = 0.6;
    const whoops = Math.floor(totalDuration / whoopDuration);

    for (let i = 0; i < whoops; i++) {
      const startTime = ctx.currentTime + i * whoopDuration;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(400, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, startTime + whoopDuration * 0.5);
      oscillator.frequency.exponentialRampToValueAtTime(400, startTime + whoopDuration);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
      gainNode.gain.setValueAtTime(0.4, startTime + whoopDuration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + whoopDuration);

      oscillator.start(startTime);
      oscillator.stop(startTime + whoopDuration);
    }
  } catch {
    // Silently fail if audio is blocked
  }
}

export function stopAllAudio(): void {
  try {
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  } catch {
    // Silently fail
  }
}
