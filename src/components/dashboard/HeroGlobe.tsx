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
  { nodes, focusNodes, isLoading },
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

  // Memoize arcs data to prevent flickering - create network mesh effect
  const arcsData = useMemo(() => {
    if (nodes.length < 3) return [];

    const arcs: Array<{
      id: string;
      startLat: number;
      startLng: number;
      endLat: number;
      endLng: number;
      color: string[];
    }> = [];

    // Use active nodes primarily
    const activeNodes = nodes.filter(n => n.status === 'active');
    const sourceNodes = activeNodes.length >= 5 ? activeNodes : nodes;

    // Create multiple connections from each node to form a network mesh
    const numNodes = Math.min(sourceNodes.length, 20);

    for (let i = 0; i < numNodes; i++) {
      const node = sourceNodes[i];

      // Connect each node to 2-3 other nodes
      const connections = [
        (i + 2) % numNodes,
        (i + 5) % numNodes,
        (i + 8) % numNodes,
      ];

      connections.forEach((targetIdx, connIdx) => {
        if (targetIdx !== i && targetIdx < sourceNodes.length) {
          const targetNode = sourceNodes[targetIdx];
          arcs.push({
            id: `arc-${node.id}-${targetNode.id}-${connIdx}`,
            startLat: node.location.lat,
            startLng: node.location.lng,
            endLat: targetNode.location.lat,
            endLng: targetNode.location.lng,
            color: ['rgba(0, 255, 255, 0.7)', 'rgba(0, 255, 136, 0.5)'],
          });
        }
      });
    }

    return arcs;
  }, [nodes]);

  return (
    <div className="relative w-full h-[600px] lg:h-[700px] overflow-hidden">
      {/* Cyberpunk grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Radial glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 60%)',
        }}
      />

      {/* Globe container */}
      <div className="relative w-full h-full">
<Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude={0.01}
          pointsMerge={false}
          onPointHover={handlePointHover as (point: object | null, prevPoint: object | null) => void}
          atmosphereColor="#00ffff"
          atmosphereAltitude={0.25}
          onGlobeReady={() => setGlobeReady(true)}
          animateIn={true}
          arcsData={arcsData}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2000}
          arcStroke={0.5}
          arcAltitude={0.15}
          arcsTransitionDuration={0}
        />
      </div>

      {/* Hover Tooltip */}
      {hoveredNode && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
          }}
        >
          <div className="px-4 py-3 rounded-lg border backdrop-blur-xl bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  hoveredNode.status === 'active' ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'
                } shadow-lg`}
              />
              <span className="text-xs font-mono text-slate-400">
                {hoveredNode.status.toUpperCase()}
              </span>
            </div>
            <div className="text-sm font-mono text-cyan-400 mb-1">
              {hoveredNode.id.slice(0, 16)}...
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">
                Latency: <span className={`font-bold ${
                  hoveredNode.latency < 100 ? 'text-green-400' :
                  hoveredNode.latency < 200 ? 'text-yellow-400' : 'text-red-400'
                }`}>{hoveredNode.latency}ms</span>
              </span>
              <span className="text-slate-400">
                {hoveredNode.location.city || hoveredNode.location.country}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-cyan-400 font-mono">SYNCING NETWORK...</span>
          </div>
        </div>
      )}

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
});
