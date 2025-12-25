'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, ChevronDown, Loader2, Zap } from 'lucide-react';
import { parseNaturalQuery, filterNodes, describeQuery, getExampleQueries, ParsedQuery } from '@/lib/nl-parser';
import { XandeumNode } from '@/types/node';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const examples = getExampleQueries();

  // Cycle through placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % examples.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [examples.length]);

  const processQuery = useCallback((queryText: string) => {
    if (!queryText.trim()) {
      onFilteredNodes(nodes, null);
      setActiveQuery(null);
      setResultDescription('');
      return;
    }

    setIsProcessing(true);

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
    }, 300);
  }, [nodes, onFilteredNodes, onFocusNodes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery(query);
    setShowExamples(false);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setShowExamples(false);
    processQuery(example);
  };

  const handleClear = () => {
    setQuery('');
    setActiveQuery(null);
    setResultDescription('');
    onFilteredNodes(nodes, null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
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
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity" />

        {/* Search bar container */}
        <form
          onSubmit={handleSubmit}
          className="relative backdrop-blur-xl bg-slate-900/90 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/10"
        >
          {/* Header label */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700/50 bg-slate-800/50">
            <div className="relative">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="w-4 h-4 text-cyan-400 opacity-50" />
              </div>
            </div>
            <span className="text-xs font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider">
              AI Node Selector
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Examples
              <ChevronDown className={`w-3 h-3 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Zap className="w-5 h-5 text-purple-400 flex-shrink-0" />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowExamples(true)}
              placeholder={examples[placeholderIndex]}
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none font-mono"
              disabled={isProcessing}
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

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isProcessing || !query.trim()}
              className={`relative p-2.5 rounded-xl transition-all ${
                query.trim()
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-700/50 text-slate-500'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
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
                className="border-t border-slate-700/50 bg-slate-800/30"
              >
                <div className="px-4 py-2 flex flex-wrap items-center gap-2">
                  {/* Result description */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm text-slate-300">{resultDescription}</span>
                  </div>

                  <div className="flex-1" />

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

                  {/* Clear all button */}
                  <button
                    onClick={handleClear}
                    className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    Clear
                  </button>
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
              className="absolute top-full left-0 right-0 mt-2 z-50"
            >
              <div className="backdrop-blur-xl bg-slate-900/95 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-3 border-b border-slate-700/50">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">
                    Try these examples
                  </span>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  {examples.map((example, i) => (
                    <motion.button
                      key={example}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors font-mono"
                    >
                      <span className="text-cyan-400">&gt;</span> {example}
                    </motion.button>
                  ))}
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
    </div>
  );
}

// Filter chip component
function FilterChip({ label, color }: { label: string; color: string }) {
  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color] || colorClasses.cyan}`}>
      {label}
    </span>
  );
}
