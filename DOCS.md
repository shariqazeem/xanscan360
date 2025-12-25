# XanScan 360 - Documentation

## Deployment & Usage Guide

### Live Platform
**Production URL:** https://xanscan360.vercel.app

---

## Table of Contents
1. [Quick Start Deployment](#quick-start-deployment)
2. [Local Development](#local-development)
3. [Platform Usage Guide](#platform-usage-guide)
4. [Feature Reference](#feature-reference)
5. [pRPC Integration](#prpc-integration)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start Deployment

### Deploy to Vercel (Recommended)

1. **Fork the Repository**
   ```bash
   git clone https://github.com/shariqazeem/xanscan360.git
   cd xanscan360
   ```

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Access Your Deployment**
   - Vercel will provide a production URL
   - The app connects to Xandeum network automatically

### Deploy to Other Platforms

#### Netlify
```bash
npm run build
# Upload the .next folder or connect your GitHub repo
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/shariqazeem/xanscan360.git

# Navigate to directory
cd xanscan360

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on http://localhost:3000 |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |

### Environment Variables (Optional)

The platform works out-of-the-box with default Xandeum endpoints. For custom configuration:

```env
# .env.local (optional)
NEXT_PUBLIC_XANDEUM_RPC=https://xandeum.network
NEXT_PUBLIC_XANDEUM_PRPC=https://xandeum.network/prpc
```

---

## Platform Usage Guide

### First Launch Experience

1. **Cinematic Boot Sequence**
   - On first load, enjoy the Hollywood-style boot animation
   - System initialization messages display
   - Click anywhere to skip if desired

2. **Main Dashboard**
   - Interactive 3D globe showing global pNode distribution
   - Real-time network statistics in the HUD
   - Node grid with detailed information

### Navigation

| Element | Location | Function |
|---------|----------|----------|
| Logo | Top-left | Home / Refresh |
| Network Status | Top-center | Shows OPTIMAL/DEGRADED/CRITICAL |
| Export Button | Top-right | Download node data as CSV |
| Sync Button | Top-right | Refresh network data |
| Help Button (?) | Top-right | Show system controls |

### Interacting with the Globe

- **Rotate**: Click and drag
- **Zoom**: Scroll wheel
- **Hover**: View node tooltip with status, latency, location
- **Auto-rotate**: Globe rotates automatically, pauses on interaction

### Search & Filter

The AI-powered search bar accepts natural language queries:

| Query Example | Result |
|---------------|--------|
| "active nodes" | Shows all online nodes |
| "nodes in USA" | Filters to US-based nodes |
| "fast nodes" | Shows nodes with <100ms latency |
| "show me Europe" | Pans globe to Europe, highlights nodes |
| "inactive" | Shows offline nodes |

### Voice Control

1. Click the **microphone icon** in the search bar
2. Speak your query naturally
3. Examples:
   - "Show me active nodes in Asia"
   - "Find nodes with low latency"
   - "Display all nodes in Germany"

---

## Feature Reference

### System Controls (Press ? to view)

| Feature | Activation | Description |
|---------|------------|-------------|
| Voice Control | Click Mic Icon | Natural language voice search |
| Matrix Mode | `Ctrl + M` | Easter egg - green Matrix effect |
| Deep Sleep | Idle 30 seconds | Cinematic screensaver with clock |
| Density Mode | Toggle button | Switch between satellite/density view |
| Celebration | Search "xandeum" | Confetti celebration effect |

### View Modes

#### Satellite Mode (Default)
- Individual node points on globe
- Color-coded by status (green = active, red = inactive)
- Animated gossip protocol arcs

#### Density Mode
- Hexagonal binning visualization
- Point height indicates node concentration
- Great for identifying cluster regions

### Node Cards

Each node card displays:
- **Node ID** (click to copy)
- **Status** (Active/Inactive with indicator)
- **Latency** (color-coded: green <100ms, yellow <200ms, red >200ms)
- **Location** (Country, City)
- **Version** (Xandeum software version)

**Expanded View** (click "Details"):
- CPU Usage percentage
- RAM Usage with progress bar
- Storage capacity
- Uptime duration
- Packets transmitted/received
- Last seen timestamp

### Network Statistics HUD

| Metric | Description |
|--------|-------------|
| Active Nodes | Count of online pNodes |
| Network Latency | Average response time |
| Total Stake | Network stake amount |
| Regions | Number of countries with nodes |
| Slot Height | Current blockchain slot |
| Epoch Progress | Visual progress bar |

### Live Gossip Log

Located in bottom-right corner:
- Real-time network event stream
- Event types: GOSSIP_RECV, GOSSIP_PUSH, HEARTBEAT, BLOCK_SYNC, PEER_CONNECT
- Pause/Resume with button
- Expand/Minimize view

### Data Export

Click **Export** button to download:
- CSV file with all node data
- Includes: ID, IP, Status, Version, Latency, CPU, RAM, Storage, Location, Uptime

---

## pRPC Integration

XanScan 360 connects to the Xandeum network via pRPC (JSON-RPC 2.0).

### Endpoints Used

```
POST https://xandeum.network/prpc
```

### Methods

| Method | Purpose | Response |
|--------|---------|----------|
| `prpc_getClusterNodes` | Fetch all pNode validators | Array of node objects |
| `getSlot` | Current slot height | Number |
| `getEpochInfo` | Epoch progress data | Epoch object |
| `getHealth` | Network health status | "ok" or error |

### Example Request

```javascript
// Fetch cluster nodes
const response = await fetch('/api/prpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'prpc_getClusterNodes',
    params: []
  })
});

const data = await response.json();
// data.result contains array of pNode information
```

### Data Refresh

- Automatic refresh every 30 seconds
- Manual refresh via Sync button
- Real-time gossip events simulated for demo

---

## Troubleshooting

### Globe Not Loading

1. **Check browser compatibility** - Requires WebGL support
2. **Disable ad blockers** - May block CDN resources
3. **Clear cache** - Hard refresh with `Ctrl + Shift + R`

### No Node Data

1. **Check network connection**
2. **Verify Xandeum RPC is accessible**
3. **Wait for initial data fetch** (may take 2-3 seconds)

### Voice Control Not Working

1. **Allow microphone permissions** when prompted
2. **Use Chrome or Edge** - Best Web Speech API support
3. **Check microphone is not muted**

### Performance Issues

1. **Reduce browser tabs** - Globe uses WebGL
2. **Disable extensions** temporarily
3. **Use latest Chrome/Firefox**

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | Full |
| Firefox 88+ | Full |
| Safari 14+ | Full (no voice) |
| Edge 90+ | Full |

---

## Architecture

```
xanscan360/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main dashboard
│   │   ├── api/prpc/          # pRPC proxy endpoint
│   │   └── api/rpc/           # RPC proxy endpoint
│   ├── components/dashboard/
│   │   ├── HeroGlobe.tsx      # 3D Globe visualization
│   │   ├── StatsHUD.tsx       # Network statistics
│   │   ├── NodeGrid.tsx       # Node cards grid
│   │   ├── AINodeSelector.tsx # Search & voice control
│   │   ├── LiveGossipLog.tsx  # Event stream
│   │   ├── DeepSleepMode.tsx  # Screensaver
│   │   └── HelpModal.tsx      # Controls reference
│   ├── hooks/
│   │   ├── useXandeumNodes.ts # Data fetching
│   │   └── useSoundEffects.ts # Audio system
│   └── lib/
│       └── nl-parser.ts       # Natural language parsing
```

---

## Credits

Built for the Xandeum Hackathon by Shariq

**Technologies:** Next.js 15, TypeScript, Tailwind CSS, react-globe.gl, Framer Motion, Web Audio API, Web Speech API

---

## Support

- **GitHub Issues:** https://github.com/shariqazeem/xanscan360/issues
- **Xandeum Discord:** https://discord.gg/xandeum
- **Documentation:** https://docs.xandeum.network

---

*XanScan 360 - The Hollywood-Grade Command Center for Xandeum Network*
