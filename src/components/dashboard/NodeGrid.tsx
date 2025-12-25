import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tilt } from 'react-tilt';
import { Copy, Check, Wifi, WifiOff, Zap, HardDrive, ChevronDown, Search } from 'lucide-react';
import { XandeumNode } from '@/types/node';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const tiltOptions = {
  reverse: false,
  max: 15,
  perspective: 1000,
  scale: 1.02,
  speed: 1000,
  transition: true,
  axis: null,
  reset: true,
  easing: "cubic-bezier(.03,.98,.52,.99)",
};

interface NodeGridProps {
  nodes: XandeumNode[];
  isLoading?: boolean;
}

// Mini sparkline component for latency visualization
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-8 overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
        className="drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]"
      />
      <polygon
        fill={`url(#gradient-${color})`}
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
}

// Generate random latency history for demo
function generateLatencyHistory(): number[] {
  const base = 20 + Math.random() * 80;
  return Array.from({ length: 20 }, () => base + (Math.random() - 0.5) * 40);
}

// Node card component
function NodeCard({ node, index }: { node: XandeumNode; index: number }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { play } = useSoundEffects();

  const latencyHistory = useMemo(() => generateLatencyHistory(), []);
  const uptime = useMemo(() => 95 + Math.random() * 5, []);

  const handleCopy = async () => {
    const rpcUrl = node.rpc || `http://${node.ip}:8899`;
    await navigator.clipboard.writeText(rpcUrl);
    setCopied(true);
    play('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExpand = () => {
    setExpanded(!expanded);
    play('click');
  };

  const latencyColor =
    node.latency < 100 ? '#00ff88' :
      node.latency < 200 ? '#ffcc00' :
        '#ff4444';

  return (
    <Tilt options={tiltOptions}>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: index * 0.05,
          type: 'spring',
          stiffness: 100,
        }}
        className="relative group"
        onMouseEnter={() => play('hover')}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Glow effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" />

        {/* Card content */}
        <div className="relative glass-card overflow-hidden group-hover:border-cyan-500/50 transition-colors duration-300" style={{ transform: 'translateZ(20px)' }}>
        <div className="scanlines opacity-5" />

        {/* Top accent line */}
        <div className={`h-1 ${node.status === 'active' ? 'bg-gradient-to-r from-green-500 to-cyan-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`} />

        <div className="p-5 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`relative p-2 rounded-lg ${node.status === 'active' ? 'bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-red-500/20'}`}>
                {node.status === 'active' ? (
                  <Wifi className="w-5 h-5 text-green-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
                {/* Pulse animation for active nodes */}
                {node.status === 'active' && (
                  <div className="absolute inset-0 rounded-lg bg-green-400/30 animate-ping" />
                )}
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-mono">Node ID</div>
                <div className="font-mono text-sm text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                  {node.id.slice(0, 16)}...
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className={`px-2 py-1 rounded text-xs font-bold uppercase font-mono ${node.status === 'active'
                ? 'bg-green-500/10 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
              {node.status}
              {node.status === 'active' && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 ml-2 animate-pulse" />
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
              <div className="text-xs text-slate-400 mb-1 font-mono">Version</div>
              <div className="text-sm font-mono text-cyan-400">{node.version}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
              <div className="text-xs text-slate-400 mb-1 font-mono">Uptime</div>
              <div className="text-sm font-mono text-green-400">{uptime.toFixed(1)}%</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
              <div className="text-xs text-slate-400 mb-1 font-mono">Latency</div>
              <div className="text-sm font-mono" style={{ color: latencyColor }}>{node.latency}ms</div>
            </div>
          </div>

          {/* Sparkline chart */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Zap className="w-3 h-3" /> Latency Trend
              </span>
              <span className="text-xs text-slate-500 font-mono">20s</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-700/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Sparkline data={latencyHistory} color={latencyColor} />
            </div>
          </div>

          {/* Location & Storage */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 font-mono">
            <div className="flex items-center gap-1">
              <span>{node.location.city || node.location.country}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              <span>{node.storage >= 1000 ? `${(node.storage / 1000).toFixed(1)} TB` : `${node.storage} GB`}</span>
            </div>
          </div>

          {/* Expand button */}
          <button
            onClick={handleExpand}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors font-mono uppercase tracking-widest border-t border-slate-700/30 mt-2"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'COLLAPSE' : 'EXPAND INFO'}
          </button>

          {/* Expanded content */}
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-slate-700/50"
            >
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">IP Address</span>
                  <span className="text-white">{node.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gossip Port</span>
                  <span className="text-white">{node.gossip || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TPU Port</span>
                  <span className="text-white">{node.tpu || 'N/A'}</span>
                </div>
                {node.pubkey && (
                  <div className="flex justify-between flex-col gap-1">
                    <span className="text-slate-400">Pubkey</span>
                    <span className="text-cyan-500 break-all text-[10px]">{node.pubkey}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Connect button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            disabled={!node.rpc && !node.ip}
            className={`mt-4 w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${copied
                ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                : 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border border-cyan-500/30 hover:from-cyan-500/30 hover:to-purple-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                COPIED
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                COPY RPC URL
              </>
            )}
          </motion.button>
        </div>

        {/* Scan line animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="scan-line" />
        </div>
        </div>
      </motion.div>
    </Tilt>
  );
}

export function NodeGrid({ nodes, isLoading }: NodeGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'offline'>('all');
  const [visibleCount, setVisibleCount] = useState(12);
  const { play } = useSoundEffects();

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchesSearch = searchTerm === '' ||
        node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.location.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.location.city?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || node.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [nodes, searchTerm, statusFilter]);

  const displayedNodes = filteredNodes.slice(0, visibleCount);

  return (
    <div className="relative">
      {/* Section header */}
      <div className="mb-8 pl-4 border-l-4 border-cyan-500">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white mb-2 tracking-tight text-glow-cyan"
        >
          NETWORK NODES
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 font-mono text-sm"
        >
          {'// ACTIVE STORAGE PROVIDERS'}
        </motion.p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center gap-4 mb-6 backdrop-blur-md bg-slate-900/40 p-4 rounded-xl border border-slate-700/30"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="SEARCH NODES..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              play('type');
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-sm"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 p-1 bg-slate-800/50 rounded-lg border border-slate-700/30">
          {(['all', 'active', 'offline'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                play('click');
              }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold font-mono uppercase transition-all ${statusFilter === status
                  ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="text-xs font-mono text-slate-400 border-l border-slate-700/50 pl-4">
          <span className="text-cyan-400 font-bold">{displayedNodes.length}</span> / {filteredNodes.length} NODES DETECTED
        </div>
      </motion.div>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-xl bg-slate-800/30 border border-slate-700/30 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedNodes.map((node, index) => (
              <NodeCard key={node.id} node={node} index={index} />
            ))}
          </div>

          {/* Load more */}
          {visibleCount < filteredNodes.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => {
                  setVisibleCount((prev) => prev + 12);
                  play('click');
                }}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border border-cyan-500/30 hover:from-cyan-500/20 hover:to-purple-500/20 font-bold font-mono uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-cyan-500/20"
              >
                Load More (+{filteredNodes.length - visibleCount})
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* CSS for scan animation */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: -100%; }
          100% { top: 200%; }
        }
        .perspective {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
