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
}

export interface NodeStats {
  totalNodes: number;
  activeNodes: number;
  offlineNodes: number;
  averageLatency: number;
  totalStorage: number;
  countriesCount: number;
}
