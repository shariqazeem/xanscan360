import { useCallback, useEffect, useRef, useState } from 'react';

type SoundType = 'click' | 'hover' | 'success' | 'alert' | 'type' | 'glitch' | 'scan' | 'ambient';

export function useSoundEffects() {
  const [muted, setMuted] = useState(false);
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{ oscillators: OscillatorNode[], gains: GainNode[] } | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first user interaction or mount if allowed
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
    };

    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const play = useCallback((type: SoundType) => {
    if (muted || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        // High pitched short blip
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'hover':
        // Very short, subtle ticking sound
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.03);
        oscillator.start(now);
        oscillator.stop(now + 0.03);
        break;

      case 'type':
        // Mechanical keyboard-ish sound
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200 + Math.random() * 50, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;

      case 'success':
        // Ascending major arpeggio
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        frequencies.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.connect(g);
          g.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          const start = now + i * 0.05;
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(0.2, start + 0.05);
          g.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
          
          osc.start(start);
          osc.stop(start + 0.3);
        });
        break;

      case 'alert':
        // Warning buzz
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.linearRampToValueAtTime(100, now + 0.3);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;
        
      case 'glitch':
        // Random noise burst
        const bufferSize = ctx.sampleRate * 0.1; // 0.1 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        break;
        
      case 'scan':
         // Deep bass thrum with rising sweep
         oscillator.type = 'sine';
         oscillator.frequency.setValueAtTime(60, now);
         oscillator.frequency.exponentialRampToValueAtTime(120, now + 0.3);
         oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.8);
         gainNode.gain.setValueAtTime(0.25, now);
         gainNode.gain.linearRampToValueAtTime(0.1, now + 0.3);
         gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
         oscillator.start(now);
         oscillator.stop(now + 0.8);

         // Add a second oscillator for the "thrum" bass
         const bassOsc = ctx.createOscillator();
         const bassGain = ctx.createGain();
         bassOsc.connect(bassGain);
         bassGain.connect(ctx.destination);
         bassOsc.type = 'sine';
         bassOsc.frequency.setValueAtTime(40, now);
         bassGain.gain.setValueAtTime(0.3, now);
         bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
         bassOsc.start(now);
         bassOsc.stop(now + 0.5);
         break;

      case 'ambient':
        // This is handled by startAmbient function
        break;
    }

  }, [muted]);

  // Start ambient spaceship hum - low frequency drone at 5% volume
  const startAmbient = useCallback(() => {
    if (muted || ambientPlaying || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Base drone - very low frequency
    const drone1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    drone1.type = 'sine';
    drone1.frequency.value = 40; // Low hum
    gain1.gain.value = 0.02; // Very quiet
    drone1.connect(gain1);
    gain1.connect(ctx.destination);
    oscillators.push(drone1);
    gains.push(gain1);

    // Second harmonic
    const drone2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    drone2.type = 'sine';
    drone2.frequency.value = 80;
    gain2.gain.value = 0.015;
    drone2.connect(gain2);
    gain2.connect(ctx.destination);
    oscillators.push(drone2);
    gains.push(gain2);

    // Very subtle high harmonic
    const drone3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    drone3.type = 'sine';
    drone3.frequency.value = 160;
    gain3.gain.value = 0.005;
    drone3.connect(gain3);
    gain3.connect(ctx.destination);
    oscillators.push(drone3);
    gains.push(gain3);

    // Start all oscillators
    oscillators.forEach(osc => osc.start());

    ambientNodesRef.current = { oscillators, gains };
    setAmbientPlaying(true);
  }, [muted, ambientPlaying]);

  // Stop ambient sound
  const stopAmbient = useCallback(() => {
    if (ambientNodesRef.current) {
      const { oscillators, gains } = ambientNodesRef.current;

      // Fade out
      gains.forEach(gain => {
        gain.gain.linearRampToValueAtTime(0, audioContextRef.current?.currentTime ?? 0 + 0.5);
      });

      // Stop after fade
      setTimeout(() => {
        oscillators.forEach(osc => {
          try { osc.stop(); } catch { /* already stopped */ }
        });
      }, 500);

      ambientNodesRef.current = null;
      setAmbientPlaying(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ambientNodesRef.current) {
        ambientNodesRef.current.oscillators.forEach(osc => {
          try { osc.stop(); } catch { /* already stopped */ }
        });
      }
    };
  }, []);

  return { play, muted, setMuted, startAmbient, stopAmbient, ambientPlaying };
}
