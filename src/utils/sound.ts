// Audio Synthesizer using Web Audio API for RemindFlow Alarm

let audioCtx: AudioContext | null = null;
let alarmIntervalId: NodeJS.Timeout | null = null;
let isAlarmPlaying = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }

  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

/**
 * Play a single chime / tone at specified frequency and duration
 */
function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = "sine",
  gainLevel = 0.3
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Smooth attack and release envelope
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Play a two-tone high-low alarm beep sequence
 */
function playChimeSequence() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Tone 1 (High chime)
  playTone(ctx, 880, now, 0.15, "triangle", 0.4);
  playTone(ctx, 1760, now + 0.05, 0.1, "sine", 0.2);

  // Tone 2 (Higher chime)
  playTone(ctx, 1174.66, now + 0.2, 0.2, "triangle", 0.45);
  playTone(ctx, 2349.32, now + 0.25, 0.15, "sine", 0.2);

  // Tone 3 (Slight pause then finish chord)
  playTone(ctx, 1318.51, now + 0.45, 0.25, "triangle", 0.4);
}

/**
 * Start repeating alarm sound
 */
export function startAlarmSound(): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (isAlarmPlaying) return true;
  isAlarmPlaying = true;

  // Play immediately
  playChimeSequence();

  // Loop alarm chime every 1.5 seconds
  if (alarmIntervalId) clearInterval(alarmIntervalId);
  alarmIntervalId = setInterval(() => {
    playChimeSequence();
  }, 1200);

  return true;
}

/**
 * Stop repeating alarm sound
 */
export function stopAlarmSound() {
  isAlarmPlaying = false;
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
}

/**
 * Play a short 0.5s preview test tone
 */
export function playTestSound(): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;

  playChimeSequence();
  return true;
}

/**
 * Check if alarm is currently ringing
 */
export function getIsAlarmPlaying(): boolean {
  return isAlarmPlaying;
}
