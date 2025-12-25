/**
 * pNode RPC (pRPC) Client
 *
 * Connects to Xandeum pNodes to fetch network data using JSON-RPC 2.0
 *
 * Available methods:
 * - get-version: Returns pNode software version
 * - get-stats: Returns comprehensive node statistics
 * - get-pods: Returns list of all known peer pNodes
 */

// pRPC endpoint configuration
// Public pNodes expose RPC on port 6000
const PRPC_ENDPOINTS = [
  'https://prpc.xandeum.network',  // Primary (if exists)
  'http://173.212.207.32:6000',    // Bootstrap node (may not have public RPC)
];

// Fallback to our Next.js API proxy
const PRPC_PROXY = '/api/prpc';

interface PRPCRequest {
  jsonrpc: '2.0';
  method: string;
  params?: unknown[];
  id: number;
}

interface PRPCResponse<T> {
  jsonrpc: '2.0';
  result?: T;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

// Response types from pRPC
export interface PodInfo {
  address: string;
  version: string;
  last_seen: string;
  last_seen_timestamp: number;
}

export interface GetPodsResponse {
  pods: PodInfo[];
  total_count: number;
}

export interface NodeStats {
  cpu_percent: number;
  ram_used: number;
  ram_total: number;
  uptime: number;
  packets_received: number;
  packets_sent: number;
  active_streams: number;
}

export interface StorageMetadata {
  total_bytes: number;
  total_pages: number;
  last_updated: number;
}

export interface GetStatsResponse {
  metadata: StorageMetadata;
  stats: NodeStats;
  file_size: number;
}

export interface GetVersionResponse {
  version: string;
}

/**
 * Make a pRPC call to the specified endpoint
 */
async function prpcCall<T>(
  method: string,
  params: unknown[] = [],
  endpoint: string = PRPC_PROXY
): Promise<T> {
  const request: PRPCRequest = {
    jsonrpc: '2.0',
    method,
    params: params.length > 0 ? params : undefined,
    id: Date.now(),
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`pRPC request failed: ${response.status} ${response.statusText}`);
  }

  const data: PRPCResponse<T> = await response.json();

  if (data.error) {
    throw new Error(`pRPC error ${data.error.code}: ${data.error.message}`);
  }

  if (data.result === undefined) {
    throw new Error('pRPC response missing result');
  }

  return data.result;
}

/**
 * Get list of all known pNodes in the network
 */
export async function getPods(): Promise<GetPodsResponse> {
  return prpcCall<GetPodsResponse>('get-pods');
}

/**
 * Get comprehensive statistics from a pNode
 */
export async function getStats(): Promise<GetStatsResponse> {
  return prpcCall<GetStatsResponse>('get-stats');
}

/**
 * Get pNode software version
 */
export async function getVersion(): Promise<GetVersionResponse> {
  return prpcCall<GetVersionResponse>('get-version');
}

/**
 * Try to connect to multiple pRPC endpoints and return the first successful one
 */
export async function findWorkingEndpoint(): Promise<string | null> {
  for (const endpoint of PRPC_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'get-version',
          id: 1,
        }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          console.log(`Found working pRPC endpoint: ${endpoint}`);
          return endpoint;
        }
      }
    } catch (err) {
      console.log(`Endpoint ${endpoint} not available:`, err);
    }
  }

  return null;
}

/**
 * Fetch all pods with stats from the network
 * This aggregates data from get-pods and enriches with get-stats where possible
 */
export async function fetchNetworkData(): Promise<{
  pods: PodInfo[];
  stats: GetStatsResponse | null;
  version: string | null;
}> {
  try {
    const [podsResponse, statsResponse, versionResponse] = await Promise.allSettled([
      getPods(),
      getStats(),
      getVersion(),
    ]);

    return {
      pods: podsResponse.status === 'fulfilled' ? podsResponse.value.pods : [],
      stats: statsResponse.status === 'fulfilled' ? statsResponse.value : null,
      version: versionResponse.status === 'fulfilled' ? versionResponse.value.version : null,
    };
  } catch (err) {
    console.error('Failed to fetch network data:', err);
    throw err;
  }
}
