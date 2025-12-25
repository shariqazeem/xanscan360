import { NextRequest, NextResponse } from 'next/server';

/**
 * pRPC Proxy Route
 *
 * Forwards JSON-RPC requests to pNode endpoints to bypass CORS restrictions.
 * Tries multiple endpoints and returns the first successful response.
 */

// pNode RPC endpoints to try (in order of priority)
const PRPC_ENDPOINTS = [
  process.env.PRPC_ENDPOINT,                    // Custom endpoint from env
  'http://173.212.207.32:6000/rpc',             // Bootstrap node
  'http://95.217.229.171:6000/rpc',             // Atlas server (may have pRPC)
].filter(Boolean) as string[];

// Timeout for each endpoint attempt
const ENDPOINT_TIMEOUT = 10000; // 10 seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate JSON-RPC request
    if (!body.jsonrpc || !body.method) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          error: { code: -32600, message: 'Invalid Request' },
          id: body.id || null,
        },
        { status: 400 }
      );
    }

    // Try each endpoint until one works
    let lastError: Error | null = null;

    for (const endpoint of PRPC_ENDPOINTS) {
      try {
        console.log(`[pRPC Proxy] Trying endpoint: ${endpoint}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ENDPOINT_TIMEOUT);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();

          // Check if it's a valid JSON-RPC response
          if (data.result !== undefined || data.error) {
            console.log(`[pRPC Proxy] Success from ${endpoint}`);
            return NextResponse.json(data);
          }
        }

        console.log(`[pRPC Proxy] Invalid response from ${endpoint}: ${response.status}`);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.log(`[pRPC Proxy] Error from ${endpoint}:`, lastError.message);
      }
    }

    // All endpoints failed
    console.error('[pRPC Proxy] All endpoints failed');
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `All pRPC endpoints unavailable: ${lastError?.message || 'Unknown error'}`,
        },
        id: body.id || null,
      },
      { status: 503 }
    );
  } catch (err) {
    console.error('[pRPC Proxy] Request error:', err);
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      },
      { status: 500 }
    );
  }
}

// Health check / info endpoint
export async function GET() {
  const endpointStatus: Record<string, string> = {};

  // Quick health check on all endpoints
  for (const endpoint of PRPC_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'get-version', id: 1 }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.result?.version) {
          endpointStatus[endpoint] = `online (v${data.result.version})`;
        } else {
          endpointStatus[endpoint] = 'invalid response';
        }
      } else {
        endpointStatus[endpoint] = `error: ${response.status}`;
      }
    } catch (err) {
      endpointStatus[endpoint] = `offline: ${err instanceof Error ? err.message : 'Unknown'}`;
    }
  }

  return NextResponse.json({
    service: 'pRPC Proxy',
    endpoints: endpointStatus,
    timestamp: new Date().toISOString(),
  });
}
