import { XandeumNode, NodeLocation } from '@/types/node';

// Major data center locations around the world
const DATA_CENTER_LOCATIONS: (NodeLocation & { weight: number })[] = [
  // North America
  { lat: 37.7749, lng: -122.4194, country: 'USA', city: 'San Francisco', weight: 8 },
  { lat: 40.7128, lng: -74.006, country: 'USA', city: 'New York', weight: 7 },
  { lat: 47.6062, lng: -122.3321, country: 'USA', city: 'Seattle', weight: 5 },
  { lat: 33.749, lng: -84.388, country: 'USA', city: 'Atlanta', weight: 4 },
  { lat: 32.7767, lng: -96.797, country: 'USA', city: 'Dallas', weight: 4 },
  { lat: 39.0997, lng: -94.5786, country: 'USA', city: 'Kansas City', weight: 2 },
  { lat: 43.6532, lng: -79.3832, country: 'Canada', city: 'Toronto', weight: 3 },
  { lat: 49.2827, lng: -123.1207, country: 'Canada', city: 'Vancouver', weight: 2 },

  // Europe
  { lat: 52.52, lng: 13.405, country: 'Germany', city: 'Berlin', weight: 5 },
  { lat: 50.1109, lng: 8.6821, country: 'Germany', city: 'Frankfurt', weight: 6 },
  { lat: 51.5074, lng: -0.1278, country: 'UK', city: 'London', weight: 6 },
  { lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris', weight: 4 },
  { lat: 52.3676, lng: 4.9041, country: 'Netherlands', city: 'Amsterdam', weight: 5 },
  { lat: 59.3293, lng: 18.0686, country: 'Sweden', city: 'Stockholm', weight: 2 },
  { lat: 60.1699, lng: 24.9384, country: 'Finland', city: 'Helsinki', weight: 2 },
  { lat: 47.3769, lng: 8.5417, country: 'Switzerland', city: 'Zurich', weight: 3 },
  { lat: 41.9028, lng: 12.4964, country: 'Italy', city: 'Rome', weight: 2 },
  { lat: 40.4168, lng: -3.7038, country: 'Spain', city: 'Madrid', weight: 2 },

  // Asia Pacific
  { lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo', weight: 6 },
  { lat: 1.3521, lng: 103.8198, country: 'Singapore', city: 'Singapore', weight: 5 },
  { lat: 22.3193, lng: 114.1694, country: 'Hong Kong', city: 'Hong Kong', weight: 4 },
  { lat: 37.5665, lng: 126.978, country: 'South Korea', city: 'Seoul', weight: 4 },
  { lat: 25.033, lng: 121.5654, country: 'Taiwan', city: 'Taipei', weight: 3 },
  { lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney', weight: 4 },
  { lat: -37.8136, lng: 144.9631, country: 'Australia', city: 'Melbourne', weight: 2 },
  { lat: 19.076, lng: 72.8777, country: 'India', city: 'Mumbai', weight: 3 },
  { lat: 12.9716, lng: 77.5946, country: 'India', city: 'Bangalore', weight: 2 },

  // South America
  { lat: -23.5505, lng: -46.6333, country: 'Brazil', city: 'São Paulo', weight: 3 },
  { lat: -34.6037, lng: -58.3816, country: 'Argentina', city: 'Buenos Aires', weight: 2 },
  { lat: -33.4489, lng: -70.6693, country: 'Chile', city: 'Santiago', weight: 1 },

  // Middle East & Africa
  { lat: 25.2048, lng: 55.2708, country: 'UAE', city: 'Dubai', weight: 3 },
  { lat: 32.0853, lng: 34.7818, country: 'Israel', city: 'Tel Aviv', weight: 2 },
  { lat: -33.9249, lng: 18.4241, country: 'South Africa', city: 'Cape Town', weight: 2 },
];

// Generate a random IP address
function generateIP(): string {
  const ranges = [
    () => `${Math.floor(Math.random() * 128) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    () => `${Math.floor(Math.random() * 64) + 128}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    () => `${Math.floor(Math.random() * 32) + 192}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
  ];
  return ranges[Math.floor(Math.random() * ranges.length)]();
}

// Generate a random pubkey-like string
function generatePubkey(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Select a location based on weights
function selectWeightedLocation(): NodeLocation {
  const totalWeight = DATA_CENTER_LOCATIONS.reduce((sum, loc) => sum + loc.weight, 0);
  let random = Math.random() * totalWeight;

  for (const loc of DATA_CENTER_LOCATIONS) {
    random -= loc.weight;
    if (random <= 0) {
      // Add small variation to prevent exact overlaps
      return {
        lat: loc.lat + (Math.random() - 0.5) * 2,
        lng: loc.lng + (Math.random() - 0.5) * 2,
        country: loc.country,
        city: loc.city,
      };
    }
  }

  return DATA_CENTER_LOCATIONS[0];
}

// Version variations
const VERSIONS = [
  '2.0.15',
  '2.0.14',
  '2.0.13',
  '2.0.12',
  '1.18.26',
  '1.18.25',
];

export function generateMockNodes(count: number = 50): XandeumNode[] {
  const nodes: XandeumNode[] = [];

  for (let i = 0; i < count; i++) {
    const location = selectWeightedLocation();
    const isActive = Math.random() > 0.08; // 92% active rate
    const ip = generateIP();
    const pubkey = generatePubkey();

    // Calculate latency based on distance from a reference point (SF)
    const distanceFromSF = Math.sqrt(
      Math.pow(location.lat - 37.7749, 2) + Math.pow(location.lng - (-122.4194), 2)
    );
    const baseLatency = 20 + distanceFromSF * 1.5;
    const latency = isActive
      ? Math.round(baseLatency + Math.random() * 50)
      : Math.round(baseLatency + 500 + Math.random() * 1000);

    // Storage in GB (100GB - 10TB range)
    const storage = Math.round(100 + Math.random() * 9900);

    nodes.push({
      id: `node-${i + 1}-${pubkey.slice(0, 8)}`,
      pubkey,
      ip,
      gossip: `${ip}:8001`,
      tpu: `${ip}:8004`,
      rpc: Math.random() > 0.7 ? `http://${ip}:8899` : null,
      version: VERSIONS[Math.floor(Math.random() * VERSIONS.length)],
      status: isActive ? 'active' : 'offline',
      latency,
      storage,
      location,
      featureSet: 4215500110 + Math.floor(Math.random() * 1000000),
      shredVersion: 64430 + Math.floor(Math.random() * 100),
    });
  }

  return nodes;
}

// Pre-generated nodes for consistent display
let cachedNodes: XandeumNode[] | null = null;

export function getMockNodes(): XandeumNode[] {
  if (!cachedNodes) {
    cachedNodes = generateMockNodes(50);
  }
  return cachedNodes;
}

// Reset cache (useful for testing)
export function resetMockNodes(): void {
  cachedNodes = null;
}
