'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useXandeumNodes, useNetworkInfo } from '@/hooks/useXandeumNodes';
import { HeroGlobe, StatsHUD, NodeGrid, AINodeSelector } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Cpu, Menu, X, Github } from 'lucide-react';
import { XandeumNode } from '@/types/node';
import { ParsedQuery } from '@/lib/nl-parser';

export default function CommandCenter() {
  const [forceMock, setForceMock] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filteredNodes, setFilteredNodes] = useState<XandeumNode[] | null>(null);
  const [focusNodes, setFocusNodes] = useState<XandeumNode[]>([]);
  const [activeQuery, setActiveQuery] = useState<ParsedQuery | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />
        {/* Radial gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 100, 150, 0.15) 0%, transparent 60%)',
          }}
        />
        {/* Bottom glow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(100, 0, 150, 0.1) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 blur-lg opacity-50" />
              </div>
              <div>
                <h1 className="text-lg font-bold">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    XanScan
                  </span>
                  <span className="text-white"> 360</span>
                </h1>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    dataSource === 'live' ? 'bg-green-400 animate-pulse' :
                    dataSource === 'mock' ? 'bg-yellow-400' : 'bg-orange-400'
                  }`} />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {dataSource === 'live' ? 'Live' : dataSource === 'mock' ? 'Demo' : 'Offline'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setForceMock(!forceMock)}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Cpu className="w-4 h-4 mr-2" />
                {forceMock ? 'Live Mode' : 'Demo Mode'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800"
          >
            <div className="container mx-auto px-6 py-4 space-y-2">
              <button
                onClick={() => { setForceMock(!forceMock); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Cpu className="w-4 h-4" />
                {forceMock ? 'Switch to Live Mode' : 'Switch to Demo Mode'}
              </button>
              <button
                onClick={() => { refetch(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section with Globe */}
      <section className="relative pt-16">
        <HeroGlobe nodes={nodes} focusNodes={focusNodes} isLoading={isLoading} />
        <StatsHUD
          stats={stats}
          dataSource={dataSource}
          lastUpdated={lastUpdated}
          networkInfo={networkInfo}
        />
      </section>

      {/* AI Node Selector */}
      <section className="relative z-20 container mx-auto px-6 -mt-16 mb-8">
        <AINodeSelector
          nodes={nodes}
          onFilteredNodes={handleFilteredNodes}
          onFocusNodes={handleFocusNodes}
        />
      </section>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-6 mb-8"
        >
          <div className="relative overflow-hidden rounded-xl border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <RefreshCw className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-orange-400 font-medium">Live data unavailable</p>
                  <p className="text-sm text-slate-400">
                    Displaying demo data. {error.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Active filter indicator */}
      {activeQuery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-6 mb-4"
        >
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              Showing <span className="text-cyan-400 font-medium">{displayNodes.length}</span> of{' '}
              <span className="text-white">{nodes.length}</span> nodes matching your query
            </span>
          </div>
        </motion.div>
      )}

      {/* Node Grid Section */}
      <section className="relative z-10 container mx-auto px-6 py-12">
        <NodeGrid nodes={displayNodes} isLoading={isLoading} />
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                <Database className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-slate-400">
                XanScan 360 - Xandeum Network Analytics
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="https://xandeum.network" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                Xandeum
              </a>
              <a href="https://docs.xandeum.network" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                Docs
              </a>
              <a href="https://discord.gg/uqRSmmM5m" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                Discord
              </a>
            </div>

            <div className="text-xs text-slate-500">
              Built for Xandeum Hackathon 2025
            </div>
          </div>
        </div>
      </footer>

      {/* Global styles for animations */}
      <style jsx global>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgb(15 23 42);
        }
        ::-webkit-scrollbar-thumb {
          background: rgb(51 65 85);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgb(71 85 105);
        }

        /* Glow text effect */
        .glow-text {
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }

        /* Glassmorphism card */
        .glass-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
