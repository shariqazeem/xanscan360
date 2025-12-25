'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Wifi, AlertTriangle, CheckCircle, Radio, X, Maximize2, Minimize2 } from 'lucide-react';
import { XandeumNode } from '@/types/node';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'gossip' | 'sync' | 'heartbeat' | 'alert' | 'connect' | 'disconnect';
  message: string;
  nodeId?: string;
  data?: Record<string, unknown>;
}

interface LiveGossipLogProps {
  nodes: XandeumNode[];
}

// Generate realistic gossip events based on nodes
function generateGossipEvent(nodes: XandeumNode[]): LogEntry {
  const eventTypes: LogEntry['type'][] = ['gossip', 'sync', 'heartbeat', 'connect', 'gossip', 'gossip', 'heartbeat'];
  const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

  const activeNodes = nodes.filter(n => n.status === 'active');
  const node = activeNodes[Math.floor(Math.random() * activeNodes.length)] || nodes[0];

  const messages: Record<LogEntry['type'], string[]> = {
    gossip: [
      `GOSSIP_RECV from ${node?.ip || '0.0.0.0'}:8001 [${node?.version || 'v0.4'}]`,
      `GOSSIP_PUSH to peer ${node?.ip || '0.0.0.0'} | pages: ${Math.floor(Math.random() * 1000)}`,
      `CRDS_UPDATE origin=${node?.id?.slice(0, 12) || 'unknown'}... slots: ${Math.floor(Math.random() * 100)}`,
      `PULL_REQ from ${node?.location?.city || 'Unknown'} | bloom_size: ${Math.floor(Math.random() * 500)}`,
    ],
    sync: [
      `BLOCK_SYNC slot=${Math.floor(Math.random() * 1000000)} hash=0x${Math.random().toString(16).slice(2, 10)}`,
      `SNAPSHOT_RECV bytes=${(Math.random() * 100).toFixed(2)}MB from ${node?.ip || '0.0.0.0'}`,
      `LEDGER_VERIFY height=${Math.floor(Math.random() * 500000)} status=OK`,
    ],
    heartbeat: [
      `HEARTBEAT ${node?.ip || '0.0.0.0'} | latency=${node?.latency || 50}ms | cpu=${node?.cpuPercent?.toFixed(1) || '15'}%`,
      `PING_ACK from ${node?.location?.country || 'Unknown'} node | rtt=${Math.floor(Math.random() * 100)}ms`,
      `HEALTH_CHECK node=${node?.id?.slice(0, 8) || 'unknown'}... status=HEALTHY`,
    ],
    alert: [
      `WARN: High latency detected on ${node?.ip || '0.0.0.0'} (${Math.floor(Math.random() * 300 + 200)}ms)`,
      `NOTICE: Peer ${node?.id?.slice(0, 12) || 'unknown'}... reconnecting...`,
    ],
    connect: [
      `PEER_CONNECT ${node?.ip || '0.0.0.0'}:${6000 + Math.floor(Math.random() * 100)} established`,
      `NEW_PEER discovered: ${node?.location?.city || 'Unknown'}, ${node?.location?.country || 'Unknown'}`,
    ],
    disconnect: [
      `PEER_TIMEOUT ${node?.ip || '0.0.0.0'} after 30s`,
      `CONN_CLOSE graceful from ${node?.id?.slice(0, 12) || 'unknown'}...`,
    ],
  };

  const messageList = messages[type];
  const message = messageList[Math.floor(Math.random() * messageList.length)];

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date(),
    type,
    message,
    nodeId: node?.id,
  };
}

export function LiveGossipLog({ nodes }: LiveGossipLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const maxLogs = 50;

  // Generate initial logs
  useEffect(() => {
    if (nodes.length === 0) return;

    const initialLogs: LogEntry[] = [];
    for (let i = 0; i < 8; i++) {
      initialLogs.push(generateGossipEvent(nodes));
    }
    setLogs(initialLogs);
  }, [nodes.length > 0]);

  // Stream new logs
  useEffect(() => {
    if (isPaused || nodes.length === 0) return;

    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = generateGossipEvent(nodes);
        const updated = [...prev, newLog];
        return updated.slice(-maxLogs);
      });
    }, 800 + Math.random() * 1200); // Random interval 0.8-2s

    return () => clearInterval(interval);
  }, [isPaused, nodes]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'gossip': return <Radio className="w-3 h-3" />;
      case 'sync': return <Wifi className="w-3 h-3" />;
      case 'heartbeat': return <CheckCircle className="w-3 h-3" />;
      case 'alert': return <AlertTriangle className="w-3 h-3" />;
      case 'connect': return <CheckCircle className="w-3 h-3" />;
      case 'disconnect': return <AlertTriangle className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'gossip': return 'text-cyan-400';
      case 'sync': return 'text-purple-400';
      case 'heartbeat': return 'text-green-400';
      case 'alert': return 'text-yellow-400';
      case 'connect': return 'text-green-400';
      case 'disconnect': return 'text-orange-400';
    }
  };

  // Memoize event counts
  const eventCounts = useMemo(() => {
    const counts = { gossip: 0, sync: 0, heartbeat: 0, alert: 0, connect: 0, disconnect: 0 };
    logs.forEach(log => counts[log.type]++);
    return counts;
  }, [logs]);

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 left-4 z-40"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl hover:border-cyan-500/50 transition-all group"
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-slate-400 group-hover:text-white">GOSSIP LOG</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-cyan-400">{logs.length}</span>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`fixed z-40 transition-all duration-300 ${
        isExpanded
          ? 'bottom-4 left-4 right-4 md:right-auto md:w-[600px]'
          : 'bottom-4 left-4 w-80 md:w-96'
      }`}
    >
      <div className="relative rounded-xl border border-cyan-500/30 bg-slate-950/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-cyan-500/10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-white tracking-wider">LIVE GOSSIP</span>
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
          </div>

          <div className="flex items-center gap-1">
            {/* Event counters */}
            <div className="hidden md:flex items-center gap-2 mr-2 text-[10px] font-mono">
              <span className="text-cyan-400">{eventCounts.gossip}g</span>
              <span className="text-purple-400">{eventCounts.sync}s</span>
              <span className="text-green-400">{eventCounts.heartbeat}h</span>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-1.5 rounded text-xs font-mono ${isPaused ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Log content */}
        <div
          ref={scrollRef}
          className={`overflow-y-auto font-mono text-[11px] leading-relaxed ${isExpanded ? 'h-64' : 'h-48'}`}
          style={{ scrollBehavior: 'smooth' }}
        >
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="px-3 py-1 hover:bg-slate-800/50 border-l-2 border-transparent hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-slate-600 shrink-0">
                    {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                  <span className={`shrink-0 ${getTypeColor(log.type)}`}>
                    {getTypeIcon(log.type)}
                  </span>
                  <span className={`uppercase text-[10px] font-bold shrink-0 w-16 ${getTypeColor(log.type)}`}>
                    [{log.type.slice(0, 4)}]
                  </span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-slate-700/50 bg-slate-900/30 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">
            {logs.length} events | {isPaused ? 'PAUSED' : 'STREAMING'}
          </span>
          <span className="text-[10px] font-mono text-cyan-400/50">
            XANDEUM GOSSIP PROTOCOL v0.4
          </span>
        </div>

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
        </div>
      </div>
    </motion.div>
  );
}
