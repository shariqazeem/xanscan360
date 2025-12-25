export type NodeStatus = 'active' | 'offline';

export interface NodeLocation {
  lat: number;
  lng: number;
  country: string;
  city?: string;
}

export interface XandeumNode {
  id: string;
  ip: string;
  version: string;
  status: NodeStatus;
  latency: number;
  storage: number;
  location: NodeLocation;
  // Extended fields from actual RPC
  pubkey?: string;
  gossip?: string | null;
  tpu?: string | null;
  rpc?: string | null;
  featureSet?: number;
  shredVersion?: number;
  // pNode stats from get-stats
  cpuPercent?: number;
  ramUsed?: number;
  ramTotal?: number;
  uptime?: number;
  storageBytes?: number;
  storagePages?: number;
  packetsReceived?: number;
  packetsSent?: number;
  activeStreams?: number;
  lastSeen?: string;
}

export interface NodeStats {
  totalNodes: number;
  activeNodes: number;
  offlineNodes: number;
  averageLatency: number;
  totalStorage: number;
  countriesCount: number;
}
