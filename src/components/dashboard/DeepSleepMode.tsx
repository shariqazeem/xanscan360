'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Radio } from 'lucide-react';

interface DeepSleepModeProps {
  idleTimeout?: number; // milliseconds
  onSleepChange?: (isSleeping: boolean) => void;
}

export function DeepSleepMode({ idleTimeout = 30000, onSleepChange }: DeepSleepModeProps) {
  const [isSleeping, setIsSleeping] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  // Handle idle detection
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetTimer = () => {
      if (isSleeping) {
        setIsSleeping(false);
        onSleepChange?.(false);
      }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsSleeping(true);
        onSleepChange?.(true);
      }, idleTimeout);
    };

    // Events that reset the timer
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Initial timer
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [idleTimeout, isSleeping, onSleepChange]);

  // Update clock every second when sleeping
  useEffect(() => {
    if (!isSleeping) return;

    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
      setUptimeSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [isSleeping]);

  // Format uptime
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isSleeping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 z-[100] pointer-events-none"
        >
          {/* Dark overlay that fades in */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

          {/* Scanning line effect */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Main content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Status indicator */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="relative">
                <Shield className="w-6 h-6 text-cyan-400" />
                <motion.div
                  className="absolute inset-0 rounded-full bg-cyan-500/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-sm font-mono text-cyan-400 tracking-[0.3em] uppercase">
                System Monitoring
              </span>
              <div className="relative">
                <Activity className="w-5 h-5 text-green-400" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Large clock */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 blur-3xl bg-cyan-500/20 rounded-full scale-150" />

              <div className="relative text-center">
                <div className="text-8xl md:text-9xl font-mono font-bold text-white tracking-wider"
                  style={{ textShadow: '0 0 60px rgba(0, 255, 255, 0.5), 0 0 120px rgba(0, 255, 255, 0.3)' }}>
                  {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                </div>
                <div className="text-xl font-mono text-slate-400 mt-4 tracking-[0.5em]">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-8 mt-12 text-xs font-mono"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700/50 bg-slate-900/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-slate-400">NETWORK</span>
                <span className="text-green-400">ONLINE</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700/50 bg-slate-900/50">
                <Radio className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-400">UPTIME</span>
                <span className="text-cyan-400">{formatUptime(uptimeSeconds)}</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700/50 bg-slate-900/50">
                <span className="text-slate-400">STATUS</span>
                <span className="text-purple-400">WATCHING</span>
              </div>
            </motion.div>

            {/* Corner decorations */}
            <div className="absolute top-8 left-8 w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
              <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-cyan-500/50 to-transparent" />
            </div>
            <div className="absolute top-8 right-8 w-16 h-16">
              <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-cyan-500/50 to-transparent" />
              <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-cyan-500/50 to-transparent" />
            </div>
            <div className="absolute bottom-8 left-8 w-16 h-16">
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
              <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-cyan-500/50 to-transparent" />
            </div>
            <div className="absolute bottom-8 right-8 w-16 h-16">
              <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-cyan-500/50 to-transparent" />
              <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-cyan-500/50 to-transparent" />
            </div>

            {/* Wake hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ delay: 2, duration: 2, repeat: Infinity }}
              className="absolute bottom-16 text-xs font-mono text-slate-600 tracking-wider"
            >
              MOVE MOUSE TO RESUME
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
