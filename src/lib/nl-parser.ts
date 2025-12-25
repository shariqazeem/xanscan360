import { XandeumNode } from '@/types/node';

export interface ParsedQuery {
  countries: string[];
  latencyCondition: 'high' | 'low' | 'medium' | null;
  statusFilter: 'active' | 'offline' | null;
  storageCondition: 'high' | 'low' | null;
  versionFilter: string | null;
  regionFilter: string | null;
  limitCount: number | null;
  sortBy: 'latency' | 'storage' | 'status' | null;
  sortOrder: 'asc' | 'desc';
  rawQuery: string;
}

// Comprehensive country name mapping (common names to standard names)
const COUNTRY_ALIASES: Record<string, string[]> = {
  'United States': ['usa', 'us', 'united states', 'america', 'u.s.', 'u.s.a.'],
  'Germany': ['germany', 'deutschland', 'de'],
  'United Kingdom': ['uk', 'united kingdom', 'britain', 'england', 'gb', 'great britain'],
  'France': ['france', 'fr'],
  'Japan': ['japan', 'jp', 'nippon'],
  'Singapore': ['singapore', 'sg'],
  'Netherlands': ['netherlands', 'holland', 'nl', 'dutch'],
  'Canada': ['canada', 'ca'],
  'Australia': ['australia', 'au', 'aussie'],
  'Brazil': ['brazil', 'brasil', 'br'],
  'India': ['india', 'in'],
  'South Korea': ['korea', 'south korea', 'kr', 's. korea'],
  'Ireland': ['ireland', 'ie'],
  'Sweden': ['sweden', 'se', 'sverige'],
  'Finland': ['finland', 'fi', 'suomi'],
  'Poland': ['poland', 'pl', 'polska'],
  'Switzerland': ['switzerland', 'ch', 'swiss'],
  'Spain': ['spain', 'es', 'espana', 'españa'],
  'Italy': ['italy', 'it', 'italia'],
  'Russia': ['russia', 'ru'],
  'China': ['china', 'cn', 'prc'],
  'Hong Kong': ['hong kong', 'hk'],
  'Taiwan': ['taiwan', 'tw'],
  'Mexico': ['mexico', 'mx'],
  'Argentina': ['argentina', 'ar'],
  'Chile': ['chile', 'cl'],
  'South Africa': ['south africa', 'za', 's. africa'],
  'UAE': ['uae', 'united arab emirates', 'dubai', 'emirates'],
  'Israel': ['israel', 'il'],
  'Norway': ['norway', 'no', 'norge'],
  'Denmark': ['denmark', 'dk', 'danmark'],
  'Belgium': ['belgium', 'be'],
  'Austria': ['austria', 'at'],
  'Portugal': ['portugal', 'pt'],
  'Czech Republic': ['czech', 'czechia', 'cz', 'czech republic'],
  'Romania': ['romania', 'ro'],
  'Ukraine': ['ukraine', 'ua'],
  'Turkey': ['turkey', 'tr', 'türkiye'],
  'Indonesia': ['indonesia', 'id'],
  'Malaysia': ['malaysia', 'my'],
  'Thailand': ['thailand', 'th'],
  'Vietnam': ['vietnam', 'vn'],
  'Philippines': ['philippines', 'ph'],
  'New Zealand': ['new zealand', 'nz'],
};

// Region mappings
const REGION_ALIASES: Record<string, string[]> = {
  'europe': ['europe', 'european', 'eu'],
  'asia': ['asia', 'asian', 'apac', 'asia-pacific'],
  'north america': ['north america', 'na', 'n. america'],
  'south america': ['south america', 'sa', 'latin america', 'latam'],
  'middle east': ['middle east', 'me', 'mena'],
  'africa': ['africa', 'african'],
  'oceania': ['oceania', 'pacific', 'australia'],
};

// Countries by region
const COUNTRIES_BY_REGION: Record<string, string[]> = {
  'europe': ['Germany', 'United Kingdom', 'France', 'Netherlands', 'Ireland', 'Sweden', 'Finland', 'Poland', 'Switzerland', 'Spain', 'Italy', 'Norway', 'Denmark', 'Belgium', 'Austria', 'Portugal', 'Czech Republic', 'Romania', 'Ukraine'],
  'asia': ['Japan', 'Singapore', 'South Korea', 'India', 'China', 'Hong Kong', 'Taiwan', 'Indonesia', 'Malaysia', 'Thailand', 'Vietnam', 'Philippines'],
  'north america': ['United States', 'Canada', 'Mexico'],
  'south america': ['Brazil', 'Argentina', 'Chile'],
  'middle east': ['UAE', 'Israel', 'Turkey'],
  'africa': ['South Africa'],
  'oceania': ['Australia', 'New Zealand'],
};

// Latency keyword patterns
const LATENCY_PATTERNS = {
  high: /\b(high\s*latency|slow|lagg?y|bad\s*latency|poor\s*latency|latency\s*>\s*200|over\s*200\s*ms|above\s*200|>200)\b/i,
  low: /\b(low\s*latency|fast|quick|good\s*latency|best\s*latency|latency\s*<\s*100|under\s*100\s*ms|below\s*100|<100)\b/i,
  medium: /\b(medium\s*latency|moderate|average|normal\s*latency)\b/i,
};

// Status keyword patterns
const STATUS_PATTERNS = {
  active: /\b(active|online|up|running|live|healthy|working)\b/i,
  offline: /\b(offline|down|inactive|dead|unhealthy|not\s*working|failed)\b/i,
};

// Storage keyword patterns
const STORAGE_PATTERNS = {
  high: /\b(high\s*storage|large\s*storage|big\s*storage|most\s*storage|>?\s*1\s*tb|terabyte|lots?\s*of\s*storage)\b/i,
  low: /\b(low\s*storage|small\s*storage|little\s*storage|least\s*storage|<?\s*500\s*gb)\b/i,
};

// Sort patterns
const SORT_PATTERNS = {
  latency: /\b(sort\s*by\s*latency|order\s*by\s*latency|fastest\s*first|slowest\s*first)\b/i,
  storage: /\b(sort\s*by\s*storage|order\s*by\s*storage|most\s*storage\s*first|largest\s*first)\b/i,
};

// Limit patterns
const LIMIT_PATTERN = /\b(top|first|show|limit|only)\s*(\d+)\b/i;
const NUMBER_WORDS: Record<string, number> = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
};

/**
 * Parse a natural language query into structured filter criteria
 */
export function parseNaturalQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase().trim();

  const result: ParsedQuery = {
    countries: [],
    latencyCondition: null,
    statusFilter: null,
    storageCondition: null,
    versionFilter: null,
    regionFilter: null,
    limitCount: null,
    sortBy: null,
    sortOrder: 'asc',
    rawQuery: query,
  };

  // Extract countries
  for (const [country, aliases] of Object.entries(COUNTRY_ALIASES)) {
    for (const alias of aliases) {
      // Use word boundary matching
      const regex = new RegExp(`\\b${alias.replace(/\./g, '\\.')}\\b`, 'i');
      if (regex.test(lowerQuery)) {
        if (!result.countries.includes(country)) {
          result.countries.push(country);
        }
        break;
      }
    }
  }

  // Extract regions and expand to countries
  for (const [region, aliases] of Object.entries(REGION_ALIASES)) {
    for (const alias of aliases) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(lowerQuery)) {
        result.regionFilter = region;
        // Add all countries in this region
        const regionCountries = COUNTRIES_BY_REGION[region] || [];
        for (const country of regionCountries) {
          if (!result.countries.includes(country)) {
            result.countries.push(country);
          }
        }
        break;
      }
    }
    if (result.regionFilter) break;
  }

  // Extract latency condition
  if (LATENCY_PATTERNS.high.test(lowerQuery)) {
    result.latencyCondition = 'high';
  } else if (LATENCY_PATTERNS.low.test(lowerQuery)) {
    result.latencyCondition = 'low';
  } else if (LATENCY_PATTERNS.medium.test(lowerQuery)) {
    result.latencyCondition = 'medium';
  }

  // Extract status filter
  if (STATUS_PATTERNS.offline.test(lowerQuery)) {
    result.statusFilter = 'offline';
  } else if (STATUS_PATTERNS.active.test(lowerQuery)) {
    result.statusFilter = 'active';
  }

  // Extract storage condition
  if (STORAGE_PATTERNS.high.test(lowerQuery)) {
    result.storageCondition = 'high';
  } else if (STORAGE_PATTERNS.low.test(lowerQuery)) {
    result.storageCondition = 'low';
  }

  // Extract version filter
  const versionMatch = lowerQuery.match(/\b(?:version|v)\s*([\d.]+)\b/i);
  if (versionMatch) {
    result.versionFilter = versionMatch[1];
  }

  // Extract limit
  const limitMatch = lowerQuery.match(LIMIT_PATTERN);
  if (limitMatch) {
    result.limitCount = parseInt(limitMatch[2], 10);
  } else {
    // Check for word numbers
    for (const [word, num] of Object.entries(NUMBER_WORDS)) {
      const wordLimitRegex = new RegExp(`\\b(top|first|show|only)\\s+${word}\\b`, 'i');
      if (wordLimitRegex.test(lowerQuery)) {
        result.limitCount = num;
        break;
      }
    }
  }

  // Extract sort preferences
  if (SORT_PATTERNS.latency.test(lowerQuery)) {
    result.sortBy = 'latency';
    result.sortOrder = /slowest|highest|worst/i.test(lowerQuery) ? 'desc' : 'asc';
  } else if (SORT_PATTERNS.storage.test(lowerQuery)) {
    result.sortBy = 'storage';
    result.sortOrder = /largest|most|biggest/i.test(lowerQuery) ? 'desc' : 'asc';
  }

  // Infer sort from context
  if (!result.sortBy) {
    if (/fastest|quickest|best/i.test(lowerQuery)) {
      result.sortBy = 'latency';
      result.sortOrder = 'asc';
    } else if (/slowest|worst/i.test(lowerQuery)) {
      result.sortBy = 'latency';
      result.sortOrder = 'desc';
    }
  }

  return result;
}

/**
 * Apply parsed query filters to a list of nodes
 */
export function filterNodes(nodes: XandeumNode[], query: ParsedQuery): XandeumNode[] {
  let filtered = [...nodes];

  // Filter by countries
  if (query.countries.length > 0) {
    filtered = filtered.filter(node =>
      query.countries.some(country =>
        node.location.country.toLowerCase() === country.toLowerCase()
      )
    );
  }

  // Filter by latency
  if (query.latencyCondition) {
    filtered = filtered.filter(node => {
      switch (query.latencyCondition) {
        case 'high':
          return node.latency > 200;
        case 'low':
          return node.latency < 100;
        case 'medium':
          return node.latency >= 100 && node.latency <= 200;
        default:
          return true;
      }
    });
  }

  // Filter by status
  if (query.statusFilter) {
    filtered = filtered.filter(node => node.status === query.statusFilter);
  }

  // Filter by storage
  if (query.storageCondition) {
    filtered = filtered.filter(node => {
      switch (query.storageCondition) {
        case 'high':
          return node.storage >= 1000; // 1TB+
        case 'low':
          return node.storage < 500;
        default:
          return true;
      }
    });
  }

  // Filter by version
  if (query.versionFilter) {
    filtered = filtered.filter(node =>
      node.version.includes(query.versionFilter!)
    );
  }

  // Sort results
  if (query.sortBy) {
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (query.sortBy) {
        case 'latency':
          comparison = a.latency - b.latency;
          break;
        case 'storage':
          comparison = a.storage - b.storage;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return query.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Apply limit
  if (query.limitCount && query.limitCount > 0) {
    filtered = filtered.slice(0, query.limitCount);
  }

  return filtered;
}

/**
 * Generate a human-readable description of the applied filters
 */
export function describeQuery(query: ParsedQuery, resultCount: number): string {
  const parts: string[] = [];

  if (query.statusFilter) {
    parts.push(`${query.statusFilter}`);
  }

  if (query.latencyCondition) {
    parts.push(`${query.latencyCondition} latency`);
  }

  if (query.storageCondition) {
    parts.push(`${query.storageCondition} storage`);
  }

  if (query.countries.length > 0) {
    if (query.regionFilter) {
      parts.push(`in ${query.regionFilter}`);
    } else if (query.countries.length <= 3) {
      parts.push(`in ${query.countries.join(', ')}`);
    } else {
      parts.push(`in ${query.countries.length} countries`);
    }
  }

  if (query.versionFilter) {
    parts.push(`version ${query.versionFilter}`);
  }

  if (parts.length === 0) {
    return `Found ${resultCount} nodes`;
  }

  const description = parts.join(' ');
  const prefix = query.limitCount ? `Top ${query.limitCount}` : `${resultCount}`;

  return `${prefix} ${description} node${resultCount !== 1 ? 's' : ''}`;
}

/**
 * Get example queries for the placeholder
 */
export function getExampleQueries(): string[] {
  return [
    'Show me high latency nodes in Germany',
    'Find all offline nodes',
    'Top 5 fastest nodes in Europe',
    'Active nodes with high storage in USA',
    'Slow nodes in Asia',
    'Online nodes in Japan or Singapore',
    'Show nodes in South America',
    'Find low latency nodes with over 1TB storage',
  ];
}
