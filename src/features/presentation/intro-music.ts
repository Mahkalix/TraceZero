// Original procedural score for Trace//Zero. No recordings or third-party samples.
export function createSiteMusic() {
  const context = new AudioContext();
  const master = context.createGain();
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2400;
  master.gain.setValueAtTime(0, context.currentTime);
  filter.connect(master).connect(context.destination);
  let step = 0;
  let next = context.currentTime + .05;
  const beat = 60 / 108 / 2;
  const roots = [41.203, 41.203, 32.703, 36.708];
  const arp = [0, 7, 12, 15, 12, 7, 19, 7];
  function tone(frequency: number, at: number, duration: number, volume: number, type: OscillatorType) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(volume, at + .008);
    envelope.gain.exponentialRampToValueAtTime(.001, at + duration);
    oscillator.connect(envelope).connect(filter);
    oscillator.start(at);
    oscillator.stop(at + duration + .02);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    return oscillator;
  }
  const schedule = () => {
    if (context.state !== "running") return;
    next = Math.max(next, context.currentTime);
    while (next < context.currentTime + .2) {
      const root = roots[Math.floor(step / 16) % roots.length];
      tone(root, next, .23, .42, "sawtooth");
      tone(root * 4 * 2 ** (arp[step % 8] / 12), next, .35, .12, "triangle");
      if (step % 2 === 0) {
        const kick = tone(130, next, .22, .8, "sine");
        kick.frequency.exponentialRampToValueAtTime(42, next + .16);
      }
      if (step % 4 === 2) tone(180, next, .08, .16, "triangle");
      tone(6500, next, .025, .035, "square");
      next += beat;
      step++;
    }
  };
  schedule();
  const timer = window.setInterval(schedule, 50);
  return {
    resume: () => context.resume(),
    setVolume: (volume: number) => {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)) * .4, context.currentTime, .06);
    },
    stop: () => {
    window.clearInterval(timer);
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(0, context.currentTime, .04);
    window.setTimeout(() => { void context.close(); }, 180);
    },
  };
}
