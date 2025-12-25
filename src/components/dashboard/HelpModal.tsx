'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Keyboard, Moon, BarChart3, Sparkles, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const controls = [
    {
      icon: Mic,
      title: 'Voice Control',
      shortcut: 'Click Mic Icon',
      description: '"Show me active nodes in Europe"',
      color: 'cyan',
    },
    {
      icon: Keyboard,
      title: 'Matrix Mode',
      shortcut: 'Ctrl + M',
      description: 'Easter egg - transforms the UI',
      color: 'green',
    },
    {
      icon: Moon,
      title: 'Deep Sleep Protocol',
      shortcut: 'Idle 30s',
      description: 'Cinematic screensaver activates',
      color: 'purple',
    },
    {
      icon: BarChart3,
      title: 'Density Mode',
      shortcut: 'Toggle Button',
      description: 'Switch between satellite & density views',
      color: 'pink',
    },
    {
      icon: Sparkles,
      title: 'Winner Celebration',
      shortcut: 'Search "xandeum"',
      description: 'Type magic words for confetti',
      color: 'yellow',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { text: string; bg: string; border: string; glow: string }> = {
      cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' },
      green: { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', glow: 'shadow-green-500/20' },
      purple: { text: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' },
      pink: { text: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/30', glow: 'shadow-pink-500/20' },
      yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20' },
    };
    return colors[color] || colors.cyan;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-lg"
          >
            <div className="relative mx-4">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />

              <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden">
                {/* Header accent line */}
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                      <HelpCircle className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold font-mono tracking-wider text-white">
                        SYSTEM CONTROLS
                      </h2>
                      <p className="text-xs text-slate-500 font-mono">Hidden features & shortcuts</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  {controls.map((control, index) => {
                    const colors = getColorClasses(control.color);
                    const Icon = control.icon;

                    return (
                      <motion.div
                        key={control.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border ${colors.border} ${colors.bg} hover:shadow-lg ${colors.glow} transition-all`}
                      >
                        <div className={`p-2.5 rounded-lg ${colors.bg} border ${colors.border}`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-white font-mono">{control.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${colors.bg} ${colors.text} border ${colors.border}`}>
                              {control.shortcut}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono truncate">{control.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-950/50">
                  <p className="text-center text-xs text-slate-500 font-mono">
                    Press <span className="text-cyan-400">?</span> anytime to show this menu
                  </p>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to manage help modal state with first-visit auto-show
export function useHelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen help before
    const seen = localStorage.getItem('xanscan360-help-seen');
    if (!seen) {
      // Show help modal on first visit after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('xanscan360-help-seen', 'true');
      }, 2000); // Show 2 seconds after page loads
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for ? key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
}
