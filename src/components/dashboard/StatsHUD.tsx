'use client';

import { motion } from 'framer-motion';
import { Activity, Database, Shield, Zap, Server, Globe } from 'lucide-react';
import { NodeStats } from '@/types/node';
import { DataSource } from '@/hooks/useXandeumNodes';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface StatsHUDProps {
  stats: NodeStats;
  dataSource: DataSource;
  lastUpdated: Date | null;
  networkInfo?: {
    epoch?: number;
    slot?: number;
    version?: string;
  } | null;
}

function formatStorage(gb: number): string {
  if (gb >= 1000) {
    return `${(gb / 1000).toFixed(1)} TB`;
  }
  return `${gb} GB`;
}

function calculateNetworkHealth(stats: NodeStats): number {
  if (stats.totalNodes === 0) return 0;
  return Math.round((stats.activeNodes / stats.totalNodes) * 100);
}

export function StatsHUD({ stats, dataSource, lastUpdated, networkInfo }: StatsHUDProps) {
  const networkHealth = calculateNetworkHealth(stats);
  const { play } = useSoundEffects();

  const healthColor =
    networkHealth >= 90 ? 'text-green-400' :
      networkHealth >= 70 ? 'text-yellow-400' :
        'text-red-400';

  const healthGlow =
    networkHealth >= 90 ? 'shadow-green-500/50' :
      networkHealth >= 70 ? 'shadow-yellow-500/50' :
        'shadow-red-500/50';

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
      <div className="container mx-auto px-6 pt-24 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          {/* Left HUD Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="pointer-events-auto"
            onMouseEnter={() => play('hover')}
          >
            <div className="glass-card p-6 shadow-lg shadow-cyan-500/10 relative overflow-hidden group">
              {/* Scanline overlay */}
              <div className="scanlines opacity-20" />

              {/* Corner decorations */}
              <div className="cyber-corners absolute inset-0 opacity-50" />

              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                  <Server className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Active Nodes</div>
                  <motion.div
                    key={stats.activeNodes}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-bold text-white font-mono tracking-tighter text-glow-cyan"
                  >
                    {stats.activeNodes}
                    <span className="text-lg text-slate-500">/{stats.totalNodes}</span>
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono relative z-10">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-cyan-200">{stats.activeNodes} online</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-red-200">{stats.offlineNodes} offline</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center HUD - Network Health */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pointer-events-auto"
            onMouseEnter={() => play('hover')}
          >
            <div className="glass-strong p-6 shadow-lg shadow-cyan-500/10 text-center relative rounded-xl overflow-hidden min-w-[300px]">
              <div className="scanlines opacity-10" />
              {/* Animated ring */}
              <div className="absolute -inset-1 rounded-xl opacity-30">
                <div
                  className={`absolute inset-0 rounded-xl ${healthGlow} shadow-lg animate-pulse`}
                  style={{ animationDuration: '2s' }}
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className={`w-5 h-5 ${healthColor}`} />
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Network Health</span>
                </div>

                <div className="relative">
                  <motion.div
                    key={networkHealth}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-5xl font-bold font-mono ${healthColor} tracking-tighter`}
                    style={{ textShadow: `0 0 20px ${networkHealth >= 90 ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)'}` }}
                  >
                    {networkHealth}
                    <span className="text-2xl text-slate-500">%</span>
                  </motion.div>
                </div>

                {/* Health bar */}
                <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${networkHealth}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full ${networkHealth >= 90 ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]' :
                      networkHealth >= 70 ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}
                  />
                </div>

                {/* Data source indicator */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${dataSource === 'live' ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,1)]' :
                    dataSource === 'mock' ? 'bg-yellow-400' :
                      'bg-orange-400'
                    }`} />
                  <span className="text-xs text-slate-400 uppercase font-mono tracking-widest">
                    {dataSource === 'live' ? 'LIVE FEED' : dataSource === 'mock' ? 'SIMULATION' : 'FALLBACK'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right HUD Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="pointer-events-auto"
            onMouseEnter={() => play('hover')}
          >
            <div className="glass-card p-6 shadow-lg shadow-cyan-500/10 relative overflow-hidden">
              <div className="scanlines opacity-20" />
              {/* Corner decorations */}
              <div className="cyber-corners absolute inset-0 opacity-50" />

              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Database className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Total Storage</div>
                  <motion.div
                    key={stats.totalStorage}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-bold text-white font-mono tracking-tighter text-glow-purple"
                  >
                    {formatStorage(stats.totalStorage)}
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono relative z-10">
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-200">{stats.countriesCount} regions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-200">{stats.averageLatency}ms avg</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom status bar */}
        {networkInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-4 flex justify-center pointer-events-auto"
          >
            <div className="inline-flex items-center gap-6 px-6 py-2 rounded-full glass border border-cyan-500/20 text-xs font-mono uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                <span className="text-slate-400">Epoch</span>
                <span className="text-cyan-300">{networkInfo.epoch}</span>
              </div>
              <div className="w-px h-4 bg-slate-600" />
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Slot</span>
                <span className="text-cyan-300">{networkInfo.slot?.toLocaleString()}</span>
              </div>
              <div className="w-px h-4 bg-slate-600" />
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sys</span>
                <span className="text-cyan-300">v{networkInfo.version}</span>
              </div>
              {lastUpdated && (
                <>
                  <div className="w-px h-4 bg-slate-600" />
                  <div className="text-slate-500">
                    UPDATED <span className="text-cyan-500">{lastUpdated.toLocaleTimeString()}</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
