'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useXandeumNodes, useNetworkInfo } from '@/hooks/useXandeumNodes';
import { HeroGlobe, StatsHUD, NodeGrid, AINodeSelector, CinematicIntro, LiveGossipLog } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Cpu, Menu, X, Github, Shield, Download } from 'lucide-react';
import { XandeumNode } from '@/types/node';
import { ParsedQuery } from '@/lib/nl-parser';
import { useSoundEffects } from '@/hooks/useSoundEffects';

// Calculate network health based on active nodes and latency
function getNetworkHealth(stats: { activeNodes: number; totalNodes: number; averageLatency: number }) {
  const activePercent = stats.totalNodes > 0 ? (stats.activeNodes / stats.totalNodes) * 100 : 0;
  const latencyScore = stats.averageLatency < 100 ? 100 : stats.averageLatency < 200 ? 70 : 40;
  const healthScore = (activePercent * 0.7 + latencyScore * 0.3);

  if (healthScore >= 80) return { status: 'OPTIMAL', color: 'text-green-400', bg: 'bg-green-500', glow: 'shadow-green-500/50' };
  if (healthScore >= 50) return { status: 'DEGRADED', color: 'text-yellow-400', bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50' };
  return { status: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500', glow: 'shadow-red-500/50' };
}

// Export nodes to CSV
function exportToCSV(nodes: XandeumNode[]) {
  const headers = ['ID', 'IP', 'Status', 'Version', 'Latency (ms)', 'CPU %', 'RAM %', 'Storage (GB)', 'Country', 'City', 'Uptime', 'Last Seen'];
  const rows = nodes.map(node => [
    node.id,
    node.ip,
    node.status,
    node.version,
    node.latency,
    node.cpuPercent?.toFixed(1) || 'N/A',
    node.ramUsed && node.ramTotal ? ((node.ramUsed / node.ramTotal) * 100).toFixed(1) : 'N/A',
    node.storage,
    node.location.country,
    node.location.city || 'N/A',
    node.uptime ? `${Math.floor(node.uptime / 86400)}d` : 'N/A',
    node.lastSeen || 'N/A'
  ]);

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `xanscan360-nodes-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function CommandCenter() {
  const [forceMock, setForceMock] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filteredNodes, setFilteredNodes] = useState<XandeumNode[] | null>(null);
  const [focusNodes, setFocusNodes] = useState<XandeumNode[]>([]);
  const [activeQuery, setActiveQuery] = useState<ParsedQuery | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const { play, startAmbient } = useSoundEffects();

  const { nodes, stats, isLoading, error, refetch, lastUpdated, dataSource } = useXandeumNodes({
    forceMock,
  });
  const { info: networkInfo } = useNetworkInfo();

  // Handle AI selector filtered nodes
  const handleFilteredNodes = useCallback((filtered: XandeumNode[], query: ParsedQuery | null) => {
    setFilteredNodes(query ? filtered : null);
    setActiveQuery(query);
  }, []);

  // Handle focus on nodes (for globe)
  const handleFocusNodes = useCallback((nodesToFocus: XandeumNode[]) => {
    setFocusNodes(nodesToFocus);
  }, []);

  // Use filtered nodes if available, otherwise all nodes
  const displayNodes = filteredNodes || nodes;

  // Ctrl+M Matrix Mode Easter Egg
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        document.documentElement.classList.toggle('matrix-mode');
        play('glitch');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [play]);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden font-sans selection:bg-cyan-500/30">

      <AnimatePresence>
        {showIntro && (
          <CinematicIntro onComplete={() => {
            setShowIntro(false);
            startAmbient(); // Start ambient hum after intro
          }} />
        )}
      </AnimatePresence>

      {/* Main Content - Only visible after intro or if intro is skipped/done */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen"
      >
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
          {/* Radial gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
            }}
          />
          {/* Scanlines */}
          <div className="scanlines opacity-[0.15]" />
        </div>

        {/* Navigation - Cinematic Command Bar */}
        <nav className="fixed top-0 left-0 right-0 z-40">
          {/* Top accent line */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60" />

          <div className="bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,255,255,0.1)]">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <div
                  className="flex items-center gap-4 cursor-pointer group"
                  onClick={() => play('click')}
                >
                  {/* Animated Logo Container */}
                  <div className="relative">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 p-[2px] group-hover:scale-110 transition-all duration-300">
                      <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                        <Database className="h-5 w-5 text-cyan-400" />
                      </div>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 blur-xl opacity-40 group-hover:opacity-80 transition-opacity" />
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-xl border border-cyan-500/50 animate-ping opacity-0 group-hover:opacity-30" style={{ animationDuration: '2s' }} />
                  </div>

                  <div>
                    <h1 className="text-xl font-bold font-mono tracking-tight flex items-center gap-1">
                      <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                        XANSCAN
                      </span>
                      <span className="text-white/80">360</span>
                    </h1>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${dataSource === 'live' ? 'bg-green-400' :
                            dataSource === 'mock' ? 'bg-yellow-400' : 'bg-orange-400'
                          }`} style={{ boxShadow: dataSource === 'live' ? '0 0 10px rgba(74,222,128,0.8)' : 'none' }} />
                        {dataSource === 'live' && (
                          <div className="absolute inset-0 rounded-full bg-green-400/50 animate-ping" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-mono">
                        {dataSource === 'live' ? 'NETWORK ONLINE' : dataSource === 'mock' ? 'SIMULATION' : 'STANDBY'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center - System Status with Health Indicator */}
                <div className="hidden lg:flex items-center gap-4 px-5 py-2 rounded-full border border-slate-700/50 bg-slate-900/50">
                  {/* Network Health Badge */}
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getNetworkHealth(stats).bg}/20 border-current ${getNetworkHealth(stats).color}`}>
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold font-mono tracking-wider">{getNetworkHealth(stats).status}</span>
                    <div className={`w-2 h-2 rounded-full ${getNetworkHealth(stats).bg} animate-pulse shadow-lg ${getNetworkHealth(stats).glow}`} />
                  </div>
                  <div className="w-px h-4 bg-slate-700" />
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-slate-500">NODES</span>
                    <span className="text-cyan-400 font-bold">{stats.activeNodes}/{stats.totalNodes}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-700" />
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-500">LATENCY</span>
                    <span className={`font-bold ${stats.averageLatency < 100 ? 'text-green-400' : stats.averageLatency < 200 ? 'text-yellow-400' : 'text-red-400'}`}>{stats.averageLatency}ms</span>
                  </div>
                  <div className="w-px h-4 bg-slate-700" />
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-500">REGIONS</span>
                    <span className="text-purple-400 font-bold">{stats.countriesCount}</span>
                  </div>
                </div>

                {/* Desktop menu */}
                <div className="hidden md:flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      exportToCSV(displayNodes);
                      play('success');
                    }}
                    className="text-slate-400 hover:text-green-400 hover:bg-green-500/10 font-mono text-xs uppercase tracking-wider border border-transparent hover:border-green-500/30 transition-all"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setForceMock(!forceMock);
                      play('click');
                    }}
                    className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs uppercase tracking-wider border border-transparent hover:border-cyan-500/30 transition-all"
                  >
                    <Cpu className="w-4 h-4 mr-2" />
                    {forceMock ? 'Live' : 'Demo'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      refetch();
                      play('scan');
                    }}
                    disabled={isLoading}
                    className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs uppercase tracking-wider border border-transparent hover:border-cyan-500/30 transition-all"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>

                  <div className="w-px h-6 bg-slate-700 mx-1" />

                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-600"
                    onMouseEnter={() => play('hover')}
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 overflow-hidden"
              >
                <div className="container mx-auto px-6 py-4 space-y-2">
                  <button
                    onClick={() => { exportToCSV(displayNodes); play('success'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-slate-400 hover:text-green-400 hover:bg-slate-800 font-mono text-sm"
                  >
                    <Download className="w-4 h-4" />
                    EXPORT CSV
                  </button>
                  <button
                    onClick={() => { setForceMock(!forceMock); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 font-mono text-sm"
                  >
                    <Cpu className="w-4 h-4" />
                    {forceMock ? 'SWITCH TO LIVE' : 'SWITCH TO DEMO'}
                  </button>
                  <button
                    onClick={() => { refetch(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 font-mono text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    REFRESH DATA
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section with Globe */}
        <section className="relative pt-16">
          <HeroGlobe nodes={nodes} focusNodes={focusNodes} isLoading={isLoading} />
          {/* Overlay gradient for smooth transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

          <StatsHUD
            stats={stats}
            dataSource={dataSource}
            lastUpdated={lastUpdated}
            networkInfo={networkInfo}
          />
        </section>

        {/* AI Node Selector */}
        <section className="relative z-20 container mx-auto px-6 -mt-24 mb-12">
          <AINodeSelector
            nodes={nodes}
            onFilteredNodes={handleFilteredNodes}
            onFocusNodes={handleFocusNodes}
          />
        </section>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-6 mb-8"
            >
              <div className="relative overflow-hidden rounded-xl border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse" />
                <div className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
                    </div>
                    <div>
                      <p className="text-orange-400 font-bold font-mono uppercase tracking-wider">Connection Warning</p>
                      <p className="text-xs text-slate-400 font-mono">
                        {error.message}. FALLBACK PROTOCOLS ACTIVE.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter indicator */}
        <AnimatePresence>
          {activeQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="container mx-auto px-6 mb-4"
            >
              <div className="flex items-center gap-2 text-sm text-slate-400 font-mono bg-slate-900/50 inline-block px-4 py-2 rounded-full border border-cyan-500/20">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                <span>
                  QUERY RESULTS: <span className="text-cyan-400 font-bold">{displayNodes.length}</span> / <span className="text-slate-500">{nodes.length}</span> TARGETS ACQUIRED
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Node Grid Section */}
        <section className="relative z-10 container mx-auto px-6 py-12">
          <NodeGrid nodes={displayNodes} isLoading={isLoading} />
        </section>

        {/* Live Gossip Log - only show after intro */}
        {!showIntro && <LiveGossipLog nodes={nodes} />}

        {/* Footer */}
        <footer className="relative z-10 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                  <Database className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                  XanScan 360 // SYSTEM VERSION 2.0.45
                </span>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono text-slate-500 uppercase tracking-wider">
                <a href="https://xandeum.network" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors hover:glow-text-cyan">
                  Xandeum
                </a>
                <a href="https://docs.xandeum.network" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                  Docs
                </a>
                <a href="https://discord.gg/uqRSmmM5m" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                  Discord
                </a>
              </div>

              <div className="text-[10px] text-slate-600 font-mono">
                SECURE CONNECTION ESTABLISHED
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
