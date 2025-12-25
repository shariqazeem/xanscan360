'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ContactInfo } from '@solana/web3.js';
import { XandeumNode, NodeStats } from '@/types/node';
import { getMockNodes } from '@/lib/mock-nodes';

// Use our API proxy to avoid CORS issues
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

// Extended ContactInfo type that may include additional fields from RPC
interface ExtendedContactInfo extends ContactInfo {
  featureSet?: number;
  shredVersion?: number;
}

// Transform RPC cluster node to our XandeumNode format
function transformClusterNode(node: ContactInfo, index: number): XandeumNode {
  // Extract IP from gossip address
  const ip = node.gossip?.split(':')[0] || 'unknown';
  const extNode = node as ExtendedContactInfo;

  // We don't have geolocation from RPC, so we'd need a GeoIP service
  // For now, return placeholder that can be enhanced later
  return {
    id: `node-${index}-${node.pubkey.slice(0, 8)}`,
    pubkey: node.pubkey,
    ip,
    gossip: node.gossip,
    tpu: node.tpu,
    rpc: node.rpc,
    version: node.version || 'unknown',
    featureSet: extNode.featureSet,
    shredVersion: extNode.shredVersion,
    status: 'active', // Nodes in gossip are considered active
    latency: 0, // Would need to be measured separately
    storage: 0, // Would need pRPC to get this
    location: {
      lat: 0,
      lng: 0,
      country: 'Unknown',
    },
  };
}

// RPC call via proxy (bypasses CORS)
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

// Fetch cluster nodes via proxy
async function fetchClusterNodes(): Promise<ContactInfo[]> {
  return rpcCall<ContactInfo[]>('getClusterNodes');
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
      // Fetch via our proxy to bypass CORS
      const clusterNodes = await fetchClusterNodes();

      if (clusterNodes.length > 0) {
        const transformedNodes = clusterNodes.map((node, index) =>
          transformClusterNode(node, index)
        );
        setNodes(transformedNodes);
        setLastUpdated(new Date());
        setDataSource('live');
        setError(null);
      } else {
        // No nodes returned, use mock data
        console.log('No nodes returned from RPC, using mock data...');
        const mockNodes = getMockNodes();
        setNodes(mockNodes);
        const latencyMap = new Map<string, number>();
        mockNodes.forEach(n => latencyMap.set(n.id, n.latency));
        setBaseLatencies(latencyMap);
        setLastUpdated(new Date());
        setDataSource('fallback');
      }
    } catch (err) {
      console.error('Failed to fetch nodes from RPC:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch nodes'));

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
