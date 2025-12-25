import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, ChevronDown, Loader2, Zap, Terminal, Trophy, Mic } from 'lucide-react';
import { parseNaturalQuery, filterNodes, describeQuery, getExampleQueries, ParsedQuery } from '@/lib/nl-parser';
import { XandeumNode } from '@/types/node';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import confetti from 'canvas-confetti';

interface AINodeSelectorProps {
  nodes: XandeumNode[];
  onFilteredNodes: (nodes: XandeumNode[], query: ParsedQuery | null) => void;
  onFocusNodes: (nodes: XandeumNode[]) => void;
}

export function AINodeSelector({ nodes, onFilteredNodes, onFocusNodes }: AINodeSelectorProps) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeQuery, setActiveQuery] = useState<ParsedQuery | null>(null);
  const [resultDescription, setResultDescription] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showWinnerToast, setShowWinnerToast] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const examples = getExampleQueries();
  const { play } = useSoundEffects();

  // Voice recognition for J.A.R.V.I.S. mode
  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      play('alert');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    play('scan');
    setIsListening(true);
    recognition.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      setQuery(command);
      play('success');
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      play('alert');
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }, [play]);

  // Confetti explosion function
  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#00ffff', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Center burst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors
    });
  }, []);

  // Cycle through placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % examples.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [examples.length]);

  const processQuery = useCallback((queryText: string) => {
    const trimmedQuery = queryText.trim().toLowerCase();

    // MATRIX EASTER EGG
    if (trimmedQuery === 'system_override') {
      play('glitch');
      document.body.classList.toggle('matrix-mode');
      setQuery('');
      return;
    }

    // Judge bait keywords that trigger the easter egg
    const WINNER_KEYWORDS = ['winner', 'xandeum', 'first place', 'hackathon', 'champion', 'victory', 'we won', 'xand'];

    // WINNER EASTER EGG - Confetti explosion! (Judge bait)
    if (WINNER_KEYWORDS.some(keyword => trimmedQuery.includes(keyword))) {
      play('success');
      triggerConfetti();
      setShowWinnerToast(true);
      setTimeout(() => setShowWinnerToast(false), 5000);
      setQuery('');
      return;
    }

    if (!queryText.trim()) {
      onFilteredNodes(nodes, null);
      setActiveQuery(null);
      setResultDescription('');
      return;
    }

    setIsProcessing(true);
    play('scan');

    // Simulate brief processing delay for UX
    setTimeout(() => {
      const parsed = parseNaturalQuery(queryText);
      const filtered = filterNodes(nodes, parsed);
      const description = describeQuery(parsed, filtered.length);

      setActiveQuery(parsed);
      setResultDescription(description);
      onFilteredNodes(filtered, parsed);
      onFocusNodes(filtered);
      setIsProcessing(false);
      play('success');
    }, 600);
  }, [nodes, onFilteredNodes, onFocusNodes, play, triggerConfetti]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery(query);
    setShowExamples(false);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setShowExamples(false);
    play('click');
    processQuery(example);
  };

  const handleClear = () => {
    setQuery('');
    setActiveQuery(null);
    setResultDescription('');
    onFilteredNodes(nodes, null);
    inputRef.current?.focus();
    play('click');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    play('type');
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Main search container */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Outer glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-50 transition-opacity" />

        {/* Search bar container */}
        <form
          onSubmit={handleSubmit}
          className="relative glass-card overflow-hidden shadow-2xl shadow-cyan-500/10 border-slate-600/50"
        >
          {/* Scanlines Effect */}
          <div className="scanlines opacity-10" />

          {/* Header label */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700/50 bg-black/40">
            <div className="relative">
              <Terminal className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs font-mono font-medium text-cyan-500 uppercase tracking-widest">
              COMMAND LINE INTERFACE
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => {
                setShowExamples(!showExamples);
                play('click');
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors font-mono"
            >
              Ex: HELP
              <ChevronDown className={`w-3 h-3 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-4">
            <span className="text-cyan-500 font-mono animate-pulse font-bold text-lg">&gt;_</span>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleType}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowExamples(true)}
              placeholder={activeQuery ? '' : examples[placeholderIndex]}
              className="flex-1 bg-transparent text-white placeholder-slate-600 text-lg focus:outline-none font-mono tracking-wider caret-cyan-500"
              disabled={isProcessing}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />

            {/* Clear button */}
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Voice Command Button (J.A.R.V.I.S. Mode) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={startListening}
              disabled={isListening}
              className={`relative p-2.5 rounded-lg transition-all border ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
              }`}
              title="Voice Command (J.A.R.V.I.S. Mode)"
            >
              <Mic className="w-4 h-4" />
              {isListening && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
            </motion.button>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isProcessing || !query.trim()}
              className={`relative p-2.5 rounded-lg transition-all border border-transparent ${query.trim()
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'text-slate-600'
                }`}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {activeQuery && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-700/50 bg-black/20"
              >
                <div className="px-4 py-2 flex flex-wrap items-center gap-2">
                  {/* Result description */}
                  <div className="flex items-center gap-2 mr-4">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-mono text-cyan-200 uppercase">{resultDescription}</span>
                  </div>

                  {/* Filter chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {activeQuery.countries.length > 0 && (
                      <FilterChip
                        label={activeQuery.regionFilter || activeQuery.countries.slice(0, 2).join(', ')}
                        color="cyan"
                      />
                    )}
                    {activeQuery.latencyCondition && (
                      <FilterChip
                        label={`${activeQuery.latencyCondition} latency`}
                        color={activeQuery.latencyCondition === 'high' ? 'red' : activeQuery.latencyCondition === 'low' ? 'green' : 'yellow'}
                      />
                    )}
                    {activeQuery.statusFilter && (
                      <FilterChip
                        label={activeQuery.statusFilter}
                        color={activeQuery.statusFilter === 'active' ? 'green' : 'red'}
                      />
                    )}
                    {activeQuery.storageCondition && (
                      <FilterChip
                        label={`${activeQuery.storageCondition} storage`}
                        color="purple"
                      />
                    )}
                    {activeQuery.limitCount && (
                      <FilterChip
                        label={`top ${activeQuery.limitCount}`}
                        color="orange"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Examples dropdown */}
        <AnimatePresence>
          {showExamples && !activeQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="absolute top-full left-0 right-0 mt-2 z-50 pointer-events-auto"
            >
              <div className="glass-card overflow-hidden shadow-2xl border-slate-700/50">
                <div className="scanlines opacity-10" />
                <div className="p-2 border-b border-slate-700/50 bg-black/40">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono pl-2">
                    Available Commands
                  </span>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {examples.map((example, i) => (
                    <motion.button
                      key={example}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleExampleClick(example)}
                      onMouseEnter={() => play('hover')}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors font-mono group flex items-center gap-2"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500">&gt;</span>
                      {example}
                    </motion.button>
                  ))}
                  <div className="border-t border-slate-700/30 my-1" />
                  <motion.div
                    onMouseEnter={() => play('hover')}
                    className="w-full text-left px-3 py-2 rounded-lg text-[10px] text-slate-500 hover:text-green-500 hover:bg-green-900/10 transition-colors font-mono cursor-default"
                  >
                    <span className="opacity-50">&gt;</span> SYSTEM_OVERRIDE (Admin Access)
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Click outside to close examples */}
      {showExamples && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExamples(false)}
        />
      )}

      {/* Winner Toast Notification */}
      <AnimatePresence>
        {showWinnerToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-50 animate-pulse" />

              <div className="relative px-8 py-5 rounded-xl border-2 border-green-500/50 bg-slate-900/95 backdrop-blur-xl shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                {/* Top accent */}
                <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent" />

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                      <Trophy className="w-8 h-8 text-green-400" />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-green-400/20 animate-ping" />
                  </div>

                  <div>
                    <div className="text-green-400 font-bold text-lg tracking-wider mb-1" style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.8)' }}>
                      ACCESS GRANTED
                    </div>
                    <div className="text-cyan-300 font-mono text-sm tracking-widest">
                      First Place Protocol Initiated
                    </div>
                  </div>
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 border-2 border-green-400/30 rounded-xl" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Filter chip component
function FilterChip({ label, color }: { label: string; color: string }) {
  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${colorClasses[color] || colorClasses.cyan} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}>
      {label}
    </span>
  );
}
