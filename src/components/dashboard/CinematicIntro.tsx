'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
    const [phase, setPhase] = useState<'boot' | 'text' | 'scan' | 'glitch' | 'complete'>('boot');
    const [textIndex, setTextIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [glitchActive, setGlitchActive] = useState(false);
    const { play } = useSoundEffects();

    const lines = useMemo(() => [
        "ESTABLISHING SECURE HANDSHAKE...",
        "RESOLVING GOSSIP PROTOCOL...",
        "SYNCHRONIZING ORBITAL NODES...",
        "ACCESS GRANTED."
    ], []);

    // Random glitch effect during boot
    useEffect(() => {
        if (phase === 'boot' || phase === 'text') {
            const glitchInterval = setInterval(() => {
                if (Math.random() > 0.7) {
                    setGlitchActive(true);
                    setTimeout(() => setGlitchActive(false), 100 + Math.random() * 150);
                }
            }, 500);
            return () => clearInterval(glitchInterval);
        }
    }, [phase]);

    // Boot sequence
    useEffect(() => {
        const t = setTimeout(() => {
            setPhase('text');
            play('click');
        }, 800);
        return () => clearTimeout(t);
    }, [play]);

    // Typewriter effect
    useEffect(() => {
        if (phase !== 'text') return;

        if (textIndex >= lines.length) {
            setTimeout(() => {
                setPhase('scan');
                play('scan');
            }, 400);
            return;
        }

        const currentLine = lines[textIndex];
        let charIndex = 0;

        const typeInterval = setInterval(() => {
            if (charIndex <= currentLine.length) {
                setDisplayText(currentLine.slice(0, charIndex));
                if (charIndex % 2 === 0) play('type');
                charIndex++;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => {
                    setTextIndex(prev => prev + 1);
                    setDisplayText('');
                }, 400);
            }
        }, 25);

        return () => clearInterval(typeInterval);
    }, [phase, textIndex, play, lines]);

    // Scan phase -> Glitch transition -> Complete
    useEffect(() => {
        if (phase === 'scan') {
            setTimeout(() => {
                play('success');
                setPhase('glitch');
            }, 2000);
        }
        if (phase === 'glitch') {
            play('glitch');
            setTimeout(onComplete, 800);
        }
    }, [phase, play, onComplete]);

    return (
        <AnimatePresence>
            {phase !== 'complete' && (
                <motion.div
                    className={`fixed inset-0 z-[100] bg-black text-cyan-500 font-mono flex flex-col items-center justify-center overflow-hidden ${glitchActive ? 'crt-flicker' : ''}`}
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        scale: 1.1,
                        filter: 'brightness(2) saturate(0)'
                    }}
                    transition={{ duration: 0.3 }}
                >
                    {/* CRT Scanlines */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-30"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04))',
                            backgroundSize: '100% 2px, 3px 100%'
                        }}
                    />

                    {/* Vignette effect */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.8) 100%)'
                        }}
                    />

                    {/* Grid background */}
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Boot Phase - System starting */}
                    {phase === 'boot' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <div className="text-xs text-cyan-700 tracking-[0.5em] mb-4">XANSCAN 360</div>
                            <div className="flex items-center gap-2 justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full"
                                />
                                <span className="text-sm text-cyan-600">INITIALIZING SYSTEM...</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Text Phase - Typewriter messages */}
                    {phase === 'text' && (
                        <div className="space-y-4">
                            {/* Previous completed lines (faded) */}
                            {lines.slice(0, textIndex).map((line, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0.8 }}
                                    animate={{ opacity: 0.3 }}
                                    className="text-sm md:text-base tracking-wider text-cyan-700"
                                >
                                    <span className="text-green-500 mr-2">[OK]</span>
                                    {line}
                                </motion.div>
                            ))}

                            {/* Current typing line */}
                            <div className="text-lg md:text-xl tracking-widest relative">
                                <span className="text-cyan-400 mr-2 font-bold">&gt;_</span>
                                <span className={glitchActive ? 'text-red-500' : 'text-cyan-300'}>
                                    {displayText}
                                </span>
                                <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.5 }}
                                    className="inline-block w-3 h-6 bg-cyan-400 ml-1 align-middle shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Scan Phase - Biometric verification */}
                    {phase === 'scan' && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative flex flex-col items-center"
                        >
                            {/* Outer rings */}
                            <div className="relative w-72 h-72">
                                {/* Spinning outer ring */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-full"
                                />

                                {/* Counter-spinning middle ring */}
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-4 border border-cyan-500/30 rounded-full"
                                />

                                {/* Inner scanning circle */}
                                <div className="absolute inset-8 border-2 border-cyan-500/50 rounded-full flex items-center justify-center overflow-hidden">
                                    {/* Scanning beam */}
                                    <motion.div
                                        initial={{ top: '-100%' }}
                                        animate={{ top: '100%' }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(0,255,255,0.8)]"
                                    />

                                    {/* Fingerprint pattern */}
                                    <div className="relative w-32 h-32">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 0.4, scale: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="absolute border border-cyan-500/40 rounded-full"
                                                style={{
                                                    inset: `${i * 12}px`,
                                                }}
                                            />
                                        ))}

                                        {/* Center crosshairs */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-px bg-cyan-500/60" />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-full w-px bg-cyan-500/60" />
                                        </div>
                                    </div>
                                </div>

                                {/* Corner brackets */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500" />
                            </div>

                            {/* Status text */}
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="mt-8 text-center"
                            >
                                <div className="text-cyan-400 tracking-[0.4em] text-sm font-bold">
                                    SCANNING BIOMETRICS
                                </div>
                                <div className="text-cyan-700 text-xs mt-2 tracking-wider">
                                    IDENTITY VERIFICATION IN PROGRESS
                                </div>
                            </motion.div>

                            {/* Progress bar */}
                            <div className="mt-6 w-64 h-1 bg-cyan-900/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2, ease: 'linear' }}
                                    className="h-full bg-gradient-to-r from-cyan-500 to-green-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Glitch Phase - CRT turn on effect */}
                    {phase === 'glitch' && (
                        <motion.div
                            initial={{ scale: 1 }}
                            animate={{
                                scale: [1, 1.5, 0.8, 1.2],
                                filter: ['brightness(1)', 'brightness(3)', 'brightness(0.5)', 'brightness(5)']
                            }}
                            transition={{ duration: 0.4 }}
                            className="text-4xl md:text-6xl font-bold text-green-400 tracking-widest text-center"
                            style={{ textShadow: '0 0 30px rgba(0,255,0,0.8), 0 0 60px rgba(0,255,0,0.5)' }}
                        >
                            ACCESS GRANTED
                        </motion.div>
                    )}

                    {/* Bottom status bar */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                        <div className="flex items-center gap-6 text-xs text-cyan-700 font-mono tracking-wider">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_5px_rgba(0,255,255,0.8)]" />
                                <span>SECURE CHANNEL</span>
                            </div>
                            <div className="w-px h-4 bg-cyan-800" />
                            <span>NODE: 173.212.207.32</span>
                            <div className="w-px h-4 bg-cyan-800" />
                            <span>PROTOCOL: pRPC v0.8</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
