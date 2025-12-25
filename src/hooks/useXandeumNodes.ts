'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { XandeumNode, NodeStats } from '@/types/node';
import { getMockNodes } from '@/lib/mock-nodes';
import { PodInfo } from '@/lib/prpc-client';

// API endpoints
const PRPC_PROXY = '/api/prpc';
const RPC_PROXY = '/api/rpc';
const REFRESH_INTERVAL = 30000; // 30 seconds

export type DataSource = 'live' | 'mock' | 'fallback';

interface UseXandeumNodesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  forceMock?: boolean; // Force mock data (for development/testing)
}

interface UseXandeumNodesReturn {
  nodes: XandeumNode[];
  stats: NodeStats;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
  dataSource: DataSource;
}

// Known data center locations for IP geolocation approximation
const DATACENTER_LOCATIONS: Record<string, { lat: number; lng: number; country: string; city: string }> = {
  '173.212': { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt' },
  '95.217': { lat: 60.1699, lng: 24.9384, country: 'Finland', city: 'Helsinki' },
  '65.109': { lat: 60.1699, lng: 24.9384, country: 'Finland', city: 'Helsinki' },
  '135.181': { lat: 60.1699, lng: 24.9384, country: 'Finland', city: 'Helsinki' },
  '5.161': { lat: 39.0438, lng: -77.4874, country: 'United States', city: 'Ashburn' },
  '167.235': { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt' },
  '49.12': { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt' },
  '78.46': { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt' },
  '88.99': { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt' },
  '116.202': { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt' },
  '142.132': { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt' },
  '157.90': { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt' },
  '168.119': { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt' },
  '213.239': { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt' },
  '45.': { lat: 37.7749, lng: -122.4194, country: 'United States', city: 'San Francisco' },
  '192.': { lat: 40.7128, lng: -74.006, country: 'United States', city: 'New York' },
  '10.': { lat: 51.5074, lng: -0.1278, country: 'United Kingdom', city: 'London' },
};

// Approximate location from IP address prefix
function getLocationFromIP(ip: string): { lat: number; lng: number; country: string; city?: string } {
  // Try matching IP prefixes to known data centers
  for (const [prefix, location] of Object.entries(DATACENTER_LOCATIONS)) {
    if (ip.startsWith(prefix)) {
      return location;
    }
  }

  // Generate pseudo-random but consistent location based on IP
  const ipParts = ip.split('.').map(Number);
  const seed = ipParts.reduce((a, b) => a + b, 0);

  // Distribute around the world based on IP hash
  const lat = ((seed * 7) % 140) - 70; // -70 to 70
  const lng = ((seed * 13) % 360) - 180; // -180 to 180

  return {
    lat,
    lng,
    country: 'Unknown',
  };
}

// Transform pRPC pod info to our XandeumNode format
function transformPodToNode(pod: PodInfo, index: number): XandeumNode {
  const [ip] = pod.address.split(':');
  const location = getLocationFromIP(ip);

  // Calculate if node is active based on last_seen_timestamp
  const now = Date.now() / 1000;
  const lastSeen = pod.last_seen_timestamp;
  const isActive = now - lastSeen < 300; // Active if seen in last 5 minutes

  // Simulate latency based on distance (rough approximation)
  const baseLatency = 20 + Math.abs(location.lat) + Math.abs(location.lng) / 3;
  const latency = Math.round(baseLatency + Math.random() * 50);

  // Simulate storage (since we don't have this from get-pods)
  const storage = 100 + Math.floor(Math.random() * 900); // 100-1000 GB

  return {
    id: `pnode-${index}-${ip.replace(/\./g, '-')}`,
    ip,
    gossip: pod.address,
    version: pod.version,
    status: isActive ? 'active' : 'offline',
    latency,
    storage,
    location,
    tpu: null,
    rpc: `http://${ip}:6000/rpc`,
  };
}

// pRPC call via proxy
async function prpcCall<T>(method: string): Promise<T> {
  const response = await fetch(PRPC_PROXY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
    }),
  });

  if (!response.ok) {
    throw new Error(`pRPC request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'pRPC error');
  }

  return data.result;
}

// Fetch pNodes via pRPC get-pods
async function fetchPods(): Promise<{ pods: PodInfo[]; total_count: number }> {
  return prpcCall<{ pods: PodInfo[]; total_count: number }>('get-pods');
}

// Fetch pNode stats (exported for future use)
export async function fetchPNodeStats(): Promise<{
  metadata: { total_bytes: number; total_pages: number; last_updated: number };
  stats: { cpu_percent: number; ram_used: number; ram_total: number; uptime: number };
  file_size: number;
}> {
  return prpcCall('get-stats');
}

// RPC call via proxy (for Solana RPC methods)
async function rpcCall<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(RPC_PROXY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'RPC error');
  }

  return data.result;
}

// Fetch epoch info via proxy
async function fetchEpochInfo(): Promise<{
  epoch: number;
  absoluteSlot: number;
  blockHeight: number;
  slotIndex: number;
  slotsInEpoch: number;
}> {
  return rpcCall('getEpochInfo');
}

// Fetch version via proxy
async function fetchVersion(): Promise<{ 'solana-core': string; 'feature-set': number }> {
  return rpcCall('getVersion');
}

function calculateStats(nodes: XandeumNode[]): NodeStats {
  const activeNodes = nodes.filter((n) => n.status === 'active');
  const offlineNodes = nodes.filter((n) => n.status === 'offline');

  const totalLatency = activeNodes.reduce((sum, n) => sum + n.latency, 0);
  const averageLatency = activeNodes.length > 0 ? Math.round(totalLatency / activeNodes.length) : 0;

  const totalStorage = nodes.reduce((sum, n) => sum + n.storage, 0);

  const countries = new Set(nodes.map((n) => n.location.country));

  return {
    totalNodes: nodes.length,
    activeNodes: activeNodes.length,
    offlineNodes: offlineNodes.length,
    averageLatency,
    totalStorage,
    countriesCount: countries.size,
  };
}

// Fluctuate latency by a small random amount to simulate real-time updates
function fluctuateLatency(baseLatency: number): number {
  // Fluctuate by +/- 15% with some randomness
  const fluctuation = (Math.random() - 0.5) * 0.3 * baseLatency;
  const newLatency = Math.round(baseLatency + fluctuation);
  // Keep within reasonable bounds (10ms to 500ms)
  return Math.max(10, Math.min(500, newLatency));
}

export function useXandeumNodes(options: UseXandeumNodesOptions = {}): UseXandeumNodesReturn {
  const {
    autoRefresh = true,
    refreshInterval = REFRESH_INTERVAL,
    forceMock = false,
  } = options;

  const [nodes, setNodes] = useState<XandeumNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('mock');

  // Store base latencies to fluctuate around
  const [baseLatencies, setBaseLatencies] = useState<Map<string, number>>(new Map());

  const fetchNodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // If forceMock is true, skip RPC and use mock data
    if (forceMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const mockNodes = getMockNodes();
      setNodes(mockNodes);
      // Store base latencies for fluctuation
      const latencyMap = new Map<string, number>();
      mockNodes.forEach(n => latencyMap.set(n.id, n.latency));
      setBaseLatencies(latencyMap);
      setLastUpdated(new Date());
      setDataSource('mock');
      setIsLoading(false);
      return;
    }

    try {
      // Try fetching from pRPC get-pods first
      console.log('Fetching pNodes via pRPC...');
      const podsResponse = await fetchPods();

      if (podsResponse.pods && podsResponse.pods.length > 0) {
        console.log(`Found ${podsResponse.pods.length} pNodes via pRPC`);
        const transformedNodes = podsResponse.pods.map((pod, index) =>
          transformPodToNode(pod, index)
        );
        setNodes(transformedNodes);
        const latencyMap = new Map<string, number>();
        transformedNodes.forEach(n => latencyMap.set(n.id, n.latency));
        setBaseLatencies(latencyMap);
        setLastUpdated(new Date());
        setDataSource('live');
        setError(null);
      } else {
        // No pods returned, use mock data
        console.log('No pNodes returned from pRPC, using mock data...');
        const mockNodes = getMockNodes();
        setNodes(mockNodes);
        const latencyMap = new Map<string, number>();
        mockNodes.forEach(n => latencyMap.set(n.id, n.latency));
        setBaseLatencies(latencyMap);
        setLastUpdated(new Date());
        setDataSource('fallback');
      }
    } catch (err) {
      console.error('Failed to fetch pNodes from pRPC:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pNodes'));

      // Fallback to mock data on error
      console.log('Falling back to mock data...');
      const mockNodes = getMockNodes();
      setNodes(mockNodes);
      const latencyMap = new Map<string, number>();
      mockNodes.forEach(n => latencyMap.set(n.id, n.latency));
      setBaseLatencies(latencyMap);
      setLastUpdated(new Date());
      setDataSource('fallback');
    } finally {
      setIsLoading(false);
    }
  }, [forceMock]);

  // Initial fetch
  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNodes();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNodes]);

  // Latency fluctuation effect - makes the dashboard feel alive
  useEffect(() => {
    if (nodes.length === 0 || baseLatencies.size === 0) return;

    const fluctuationInterval = setInterval(() => {
      setNodes(prevNodes =>
        prevNodes.map(node => {
          const baseLatency = baseLatencies.get(node.id) || node.latency;
          return {
            ...node,
            latency: fluctuateLatency(baseLatency),
          };
        })
      );
    }, 3000); // Fluctuate every 3 seconds

    return () => clearInterval(fluctuationInterval);
  }, [baseLatencies, nodes.length]);

  // Calculate stats from nodes
  const stats = useMemo(() => calculateStats(nodes), [nodes]);

  return {
    nodes,
    stats,
    isLoading,
    error,
    refetch: fetchNodes,
    lastUpdated,
    dataSource,
  };
}

// Hook for fetching a single node by ID
export function useXandeumNode(nodeId: string) {
  const { nodes, isLoading, error, dataSource } = useXandeumNodes({ autoRefresh: false });

  const node = useMemo(
    () => nodes.find((n) => n.id === nodeId) || null,
    [nodes, nodeId]
  );

  return { node, isLoading, error, dataSource };
}

// Hook for filtered nodes
export function useFilteredNodes(
  filter: {
    status?: 'active' | 'offline' | 'all';
    country?: string;
    version?: string;
    search?: string;
  } = {}
) {
  const { nodes, stats, isLoading, error, refetch, lastUpdated, dataSource } = useXandeumNodes();

  const filteredNodes = useMemo(() => {
    let result = [...nodes];

    if (filter.status && filter.status !== 'all') {
      result = result.filter((n) => n.status === filter.status);
    }

    if (filter.country) {
      result = result.filter((n) => n.location.country === filter.country);
    }

    if (filter.version) {
      result = result.filter((n) => n.version === filter.version);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        (n) =>
          n.id.toLowerCase().includes(searchLower) ||
          n.ip.toLowerCase().includes(searchLower) ||
          n.pubkey?.toLowerCase().includes(searchLower) ||
          n.location.country.toLowerCase().includes(searchLower) ||
          n.location.city?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [nodes, filter]);

  const filteredStats = useMemo(() => calculateStats(filteredNodes), [filteredNodes]);

  return {
    nodes: filteredNodes,
    allNodes: nodes,
    stats: filteredStats,
    allStats: stats,
    isLoading,
    error,
    refetch,
    lastUpdated,
    dataSource,
  };
}

// Hook for network info (epoch, version, etc.)
export function useNetworkInfo() {
  const [info, setInfo] = useState<{
    epoch?: number;
    slot?: number;
    blockHeight?: number;
    version?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const [epochInfo, version] = await Promise.all([
          fetchEpochInfo(),
          fetchVersion(),
        ]);

        setInfo({
          epoch: epochInfo.epoch,
          slot: epochInfo.absoluteSlot,
          blockHeight: epochInfo.blockHeight,
          version: version['solana-core'],
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch network info:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch network info'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchInfo();
    const interval = setInterval(fetchInfo, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return { info, isLoading, error };
}
