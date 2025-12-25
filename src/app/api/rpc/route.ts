import { NextRequest, NextResponse } from 'next/server';

// Configure RPC endpoint via environment variable
// Set XANDEUM_RPC_ENDPOINT in .env.local
const RPC_ENDPOINT = process.env.XANDEUM_RPC_ENDPOINT || 'https://rpc.xandeum.network';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `RPC request failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('RPC proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'RPC proxy failed' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Test connection to RPC
    const response = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getVersion',
        params: [],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: 'RPC unreachable' },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      status: 'ok',
      rpcEndpoint: RPC_ENDPOINT,
      version: data.result,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 }
    );
  }
}
