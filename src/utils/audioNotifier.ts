/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * High-quality audio notifications manager for AI Legal Planner.
 * Combines Web Audio API synthesizer for clean chime tones and SpeechSynthesis for Arabic text-to-speech.
 */

// Helper to check if audio notifications are currently enabled in application settings
export function isAudioEnabled(): boolean {
  try {
    const status = localStorage.getItem("watihi_audio_notifications");
    // Enabled by default (null or undefined or "true"), disable only if explicitly set to "false"
    return status !== "false";
  } catch {
    return true;
  }
}

// Play a pleasant high-end system notification chime
export function playNotificationChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (!isAudioEnabled()) {
        resolve();
        return;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        resolve();
        return;
      }
      
      const audioCtx = new AudioContextClass();
      
      // Tone 1: Medium High (660Hz - E5)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime); 
      gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.35);

      // Tone 2: Very High, sweet (880Hz - A5) starting slightly later
      setTimeout(() => {
        try {
          if (audioCtx.state !== "closed") {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
            gain2.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.45);
          }
        } catch (e) {
          console.error("Delayed audio failure:", e);
        } finally {
          resolve();
        }
      }, 120);

    } catch (error) {
      console.warn("Web Audio API not supported or user gesture needed context:", error);
      resolve();
    }
  });
}

// Speak text using native browser text-to-speech
export function speakArabicText(text: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (!isAudioEnabled()) {
        resolve();
        return;
      }

      if (!window.speechSynthesis) {
        console.warn("Speech Synthesis not supported in this browser.");
        resolve();
        return;
      }

      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA"; // Saudi Arabia Arabic or general Arabic
      utterance.rate = 1.0; // Normal rate
      utterance.pitch = 1.05; // Slightly pleasant high quality pitch
      
      // Try to find an Arabic voice if available
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(voice => voice.lang.startsWith("ar"));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn("Speech Synthesis warning (non-fatal):", e);
        resolve();
      };

      window.speechSynthesis.speak(utterance);

      // Webkit bug fix: resume if it pauses automatically
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

    } catch (err) {
      console.warn("Speech Synthesis error:", err);
      resolve();
    }
  });
}

/**
 * Play standard warning / error buzzer
 */
export function playAlertBuzzer(): void {
  try {
    if (!isAudioEnabled()) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Smooth square/sawtooth style tone
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, audioCtx.currentTime); // Low A3 alert pitch
    
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    console.warn("Buzzer play failed:", e);
  }
}

/**
 * Trigger combined alert with chime sound followed by Arabic voice speech
 */
export async function triggerVoiceNotification(text: string): Promise<void> {
  if (!isAudioEnabled()) return;
  await playNotificationChime();
  // Delay slightly for chime to fade before speaking
  await new Promise((r) => setTimeout(r, 400));
  await speakArabicText(text);
}
