/**
 * Programmatically synthesize a pleasant notification chime using Web Audio API.
 * Prevents issues with loading static resources in iframe environments.
 */
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // High Note (Chime 1)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);

    // Harmonizer Note (Chime 2) - offset by 150ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12); // A5
    
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
    gain2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.62);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.62);
  } catch (err) {
    console.debug('AudioContext not allowed or not supported in this frame', err);
  }
}
