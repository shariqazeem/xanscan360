'use client';

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { XandeumNode } from '@/types/node';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-cyan-400 animate-pulse">Initializing Globe...</div>
    </div>
  ),
});

interface HeroGlobeProps {
  nodes: XandeumNode[];
  focusNodes?: XandeumNode[];
  isLoading?: boolean;
  isSleepMode?: boolean;
  viewMode?: 'satellite' | 'density';
}

interface GlobePoint {
  lat: number;
  lng: number;
  size: number;
  color: string;
  node: XandeumNode;
  isHighlighted: boolean;
}

export interface HeroGlobeRef {
  focusOnNodes: (nodes: XandeumNode[]) => void;
}

export const HeroGlobe = forwardRef<HeroGlobeRef, HeroGlobeProps>(function HeroGlobe(
  { nodes, focusNodes, isLoading, isSleepMode = false, viewMode = 'satellite' },
  ref
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const [globeReady, setGlobeReady] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<XandeumNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Create a set of focused node IDs for quick lookup
  const focusedNodeIds = new Set(focusNodes?.map(n => n.id) || []);
  const hasFilter = focusNodes && focusNodes.length > 0;

  // Transform nodes to globe points with highlighting
  const pointsData: GlobePoint[] = nodes.map((node) => {
    const isHighlighted = hasFilter ? focusedNodeIds.has(node.id) : true;
    return {
      lat: node.location.lat,
      lng: node.location.lng,
      size: isHighlighted
        ? (node.status === 'active' ? 0.6 : 0.5)
        : 0.15,
      color: isHighlighted
        ? (node.status === 'active' ? '#00ff88' : '#ff4444')
        : 'rgba(100, 100, 100, 0.3)',
      node,
      isHighlighted,
    };
  });

  // Function to focus globe on specific nodes
  const focusOnNodes = useCallback((targetNodes: XandeumNode[]) => {
    if (!globeRef.current || !globeReady || targetNodes.length === 0) return;

    // Calculate centroid of target nodes
    const avgLat = targetNodes.reduce((sum, n) => sum + n.location.lat, 0) / targetNodes.length;
    const avgLng = targetNodes.reduce((sum, n) => sum + n.location.lng, 0) / targetNodes.length;

    // Calculate appropriate altitude based on spread
    const latSpread = Math.max(...targetNodes.map(n => n.location.lat)) - Math.min(...targetNodes.map(n => n.location.lat));
    const lngSpread = Math.max(...targetNodes.map(n => n.location.lng)) - Math.min(...targetNodes.map(n => n.location.lng));
    const maxSpread = Math.max(latSpread, lngSpread);

    // Altitude based on spread (more spread = higher altitude)
    const altitude = Math.min(3.5, Math.max(1.5, maxSpread / 40 + 1.5));

    // Stop auto-rotate temporarily for better focus
    globeRef.current.controls().autoRotate = false;

    // Animate to the centroid
    globeRef.current.pointOfView({ lat: avgLat, lng: avgLng, altitude }, 1500);

    // Resume auto-rotate after 5 seconds
    setTimeout(() => {
      if (globeRef.current) {
        globeRef.current.controls().autoRotate = true;
        globeRef.current.controls().autoRotateSpeed = 0.3;
      }
    }, 5000);
  }, [globeReady]);

  // Expose focus function via ref
  useImperativeHandle(ref, () => ({
    focusOnNodes,
  }), [focusOnNodes]);

  // Auto-focus when focusNodes changes
  useEffect(() => {
    if (focusNodes && focusNodes.length > 0 && globeReady) {
      focusOnNodes(focusNodes);
    }
  }, [focusNodes, focusOnNodes, globeReady]);

  // Auto-rotate globe
  useEffect(() => {
    if (globeRef.current && globeReady) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.controls().enableZoom = true;
      globeRef.current.controls().minDistance = 200;
      globeRef.current.controls().maxDistance = 500;

      // Set initial camera position
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
    }
  }, [globeReady]);

  // Sleep mode effect - zoom in and rotate faster
  useEffect(() => {
    if (!globeRef.current || !globeReady) return;

    if (isSleepMode) {
      // Dramatic zoom and fast rotation for screensaver
      globeRef.current.controls().autoRotateSpeed = 1.5;
      globeRef.current.pointOfView({ lat: 30, lng: 0, altitude: 1.8 }, 2000);
    } else {
      // Normal mode
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1500);
    }
  }, [isSleepMode, globeReady]);

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle point hover
  const handlePointHover = useCallback((point: GlobePoint | null) => {
    if (point) {
      setHoveredNode(point.node);
    } else {
      setHoveredNode(null);
    }
  }, []);

  // State for ping rings animation
  const [ringsData, setRingsData] = useState<Array<{
    lat: number;
    lng: number;
    maxR: number;
    propagationSpeed: number;
    repeatPeriod: number;
    color: string;
  }>>([]);

  // Generate ping rings periodically to simulate network activity
  useEffect(() => {
    if (nodes.length === 0) return;

    const activeNodes = nodes.filter(n => n.status === 'active');
    if (activeNodes.length === 0) return;

    // Initial rings
    const initialRings = activeNodes.slice(0, 3).map(node => ({
      lat: node.location.lat,
      lng: node.location.lng,
      maxR: 3 + Math.random() * 2,
      propagationSpeed: 2 + Math.random(),
      repeatPeriod: 1500 + Math.random() * 1000,
      color: 'rgba(0, 255, 255, 0.6)',
    }));
    setRingsData(initialRings);

    // Add new rings periodically
    const interval = setInterval(() => {
      const randomNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
      const colors = [
        'rgba(0, 255, 255, 0.6)',   // Cyan
        'rgba(139, 92, 246, 0.5)',  // Purple
        'rgba(34, 197, 94, 0.5)',   // Green
        'rgba(236, 72, 153, 0.4)',  // Pink
      ];

      setRingsData(prev => {
        const newRing = {
          lat: randomNode.location.lat,
          lng: randomNode.location.lng,
          maxR: 2 + Math.random() * 3,
          propagationSpeed: 1.5 + Math.random() * 2,
          repeatPeriod: 1200 + Math.random() * 800,
          color: colors[Math.floor(Math.random() * colors.length)],
        };

        // Keep only last 8 rings for performance
        const updated = [...prev, newRing].slice(-8);
        return updated;
      });
    }, 1500 + Math.random() * 1500);

    return () => clearInterval(interval);
  }, [nodes]);

  // Generate hex density data for density mode (shown as elevated points)
  const densityPointsData = useMemo(() => {
    if (viewMode !== 'density' || nodes.length === 0) return [];

    // Group nodes by approximate hex bins
    const binSize = 12;
    const bins: Map<string, { lat: number; lng: number; count: number }> = new Map();

    nodes.forEach(node => {
      const binLat = Math.floor(node.location.lat / binSize) * binSize + binSize / 2;
      const binLng = Math.floor(node.location.lng / binSize) * binSize + binSize / 2;
      const key = `${binLat},${binLng}`;

      if (!bins.has(key)) {
        bins.set(key, { lat: binLat, lng: binLng, count: 0 });
      }
      bins.get(key)!.count++;
    });

    const maxCount = Math.max(...Array.from(bins.values()).map(b => b.count));

    return Array.from(bins.values()).map(bin => ({
      lat: bin.lat,
      lng: bin.lng,
      size: 0.3 + (bin.count / maxCount) * 1.5, // Size based on density
      altitude: 0.01 + (bin.count / maxCount) * 0.15, // Elevation based on density
      color: bin.count > maxCount * 0.7
        ? '#00ffff'   // Cyan for high density
        : bin.count > maxCount * 0.4
        ? '#8b5cf6'   // Purple for medium
        : '#22c55e',  // Green for low
      count: bin.count,
    }));
  }, [nodes, viewMode]);

  // Memoize arcs data to prevent flickering - create network mesh effect
  const arcsData = useMemo(() => {
    if (nodes.length < 3) return [];

    const arcs: Array<{
      id: string;
      order?: number;
      startLat: number;
      startLng: number;
      endLat: number;
      endLng: number;
      color: string[];
    }> = [];

    // Use active nodes primarily for the gossip visualization
    const activeNodes = nodes.filter(n => n.status === 'active');
    const sourceNodes = activeNodes.length >= 5 ? activeNodes : nodes;

    // Cyberpunk gradient colors for the arcs
    const arcColors = [
      ['rgba(0, 255, 255, 0.8)', 'rgba(139, 92, 246, 0.5)'],   // Cyan to Purple
      ['rgba(0, 255, 136, 0.8)', 'rgba(0, 255, 255, 0.5)'],    // Green to Cyan
      ['rgba(236, 72, 153, 0.7)', 'rgba(139, 92, 246, 0.5)'],  // Pink to Purple
      ['rgba(0, 255, 255, 0.8)', 'rgba(34, 197, 94, 0.5)'],    // Cyan to Green
    ];

    // Create a dynamic mesh network with multiple connections per node
    const numNodes = Math.min(sourceNodes.length, 25);

    for (let i = 0; i < numNodes; i++) {
      const node = sourceNodes[i];

      // Connect each node to 2-4 other nodes (simulating gossip protocol)
      const numConnections = 2 + Math.floor(Math.random() * 3);
      const usedTargets = new Set<number>();

      for (let c = 0; c < numConnections; c++) {
        // Create varied connections across the network
        const offset = [2, 4, 7, 11, 13][c % 5];
        const targetIdx = (i + offset + c * 3) % numNodes;

        if (targetIdx !== i && !usedTargets.has(targetIdx) && targetIdx < sourceNodes.length) {
          usedTargets.add(targetIdx);
          const targetNode = sourceNodes[targetIdx];
          const colorIdx = (i + c) % arcColors.length;

          arcs.push({
            id: `arc-${node.id}-${targetNode.id}-${c}`,
            order: i * numConnections + c, // For staggered animation
            startLat: node.location.lat,
            startLng: node.location.lng,
            endLat: targetNode.location.lat,
            endLng: targetNode.location.lng,
            color: arcColors[colorIdx],
          });
        }
      }
    }

    return arcs;
  }, [nodes]);

  return (
    <div className="relative w-full h-[600px] lg:h-[700px] overflow-hidden">
      {/* Cyberpunk grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Multi-layer holographic atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(0, 255, 255, 0.15) 0%, rgba(139, 92, 246, 0.05) 30%, transparent 60%)',
        }}
      />

      {/* Outer glow halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none animate-pulse-slow" style={{ background: 'radial-gradient(circle, rgba(0, 255, 255, 0.08) 0%, transparent 70%)', animationDuration: '4s' }} />

      {/* Inner glow halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none mix-blend-screen" />

      {/* Purple accent halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[60px] pointer-events-none" />

      {/* Globe container */}
      <div className="relative w-full h-full">
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={viewMode === 'density' ? densityPointsData : pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude={viewMode === 'density' ? 'altitude' : 0.01}
          pointsMerge={false}
          onPointHover={handlePointHover as (point: object | null, prevPoint: object | null) => void}
          atmosphereColor="#00ffff"
          atmosphereAltitude={0.3}
          onGlobeReady={() => setGlobeReady(true)}
          animateIn={true}
          arcsData={arcsData}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashInitialGap={(d: { order?: number }) => (d.order ?? 0) * 1}
          arcDashAnimateTime={2000}
          arcStroke={0.5}
          arcAltitude={0.15}
          arcsTransitionDuration={0}
          ringsData={ringsData}
          ringColor="color"
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
        />
      </div>

      {/* Hover Tooltip - Holographic HUD style */}
      {hoveredNode && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPos.x + 20,
            top: tooltipPos.y - 15,
          }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-cyan-500/20 rounded-xl blur-md" />

            <div className="relative px-5 py-4 rounded-xl border backdrop-blur-xl bg-slate-900/95 border-cyan-500/40 shadow-[0_0_30px_rgba(0,255,255,0.15)]">
              {/* Top accent line */}
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500 rounded-tl" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500 rounded-br" />

              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div
                    className={`w-3 h-3 rounded-full ${hoveredNode.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}
                    style={{ boxShadow: hoveredNode.status === 'active' ? '0 0 10px rgba(74, 222, 128, 0.8)' : '0 0 10px rgba(248, 113, 113, 0.8)' }}
                  />
                  {hoveredNode.status === 'active' && (
                    <div className="absolute inset-0 rounded-full bg-green-400/50 animate-ping" />
                  )}
                </div>
                <span className="text-xs font-mono font-bold tracking-wider text-slate-300">
                  {hoveredNode.status.toUpperCase()}
                </span>
              </div>

              <div className="text-sm font-mono text-cyan-400 mb-2 font-bold" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
                {hoveredNode.id.slice(0, 18)}...
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block mb-0.5">LATENCY</span>
                  <span className={`font-bold ${hoveredNode.latency < 100 ? 'text-green-400' :
                    hoveredNode.latency < 200 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{hoveredNode.latency}ms</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">REGION</span>
                  <span className="text-white">{hoveredNode.location.city || hoveredNode.location.country}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6">
            {/* Spinning rings */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
              <div className="absolute inset-2 border-2 border-transparent border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-4 border border-cyan-500/30 rounded-full" />
            </div>
            <div className="text-center">
              <span className="text-cyan-400 font-mono text-sm tracking-[0.3em] font-bold" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>SYNCING NETWORK</span>
              <div className="mt-2 flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
});
