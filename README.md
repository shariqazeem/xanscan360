<div align="center">

# XANSCAN 360

### The Hollywood-Grade Command Center for Xandeum Network

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Xandeum](https://img.shields.io/badge/Xandeum-Network-cyan?style=for-the-badge)](https://xandeum.network/)

<br />

*"Like stepping into a Marvel movie where you ARE the superhero monitoring the entire blockchain network"*

<br />

[**LIVE DEMO**](https://xanscan360.vercel.app) | [Xandeum Network](https://xandeum.network) | [Documentation](https://docs.xandeum.network)

---

</div>

## The Vision

**XanScan 360** isn't just another blockchain explorer. It's a **cinematic experience** that transforms network monitoring into something you'd expect to see in Tony Stark's lab or aboard the USS Enterprise.

We asked ourselves: *"What if blockchain explorers were designed by the teams behind The Avengers and Blade Runner?"*

The result is a real-time network analytics dashboard that makes you FEEL like you're commanding a starship.

---

## Features That Will Blow Your Mind

### Cinematic Boot Sequence

When you first load XanScan 360, you're greeted with a **Hollywood-grade boot sequence** featuring:

- Terminal-style initialization with realistic system checks
- Procedurally generated sound effects using Web Audio API
- CRT monitor turn-on effect with authentic scan lines
- Progressive system status updates
- Dramatic "NEURAL LINK ESTABLISHED" finale

*"It's not just loading... it's an experience."*

---

### The Holographic Globe with Geospatial Ping Tracking

A fully interactive **3D Earth visualization** showing:

- **Real-time pNode locations** across 6 continents
- **Animated gossip protocol arcs** visualizing network communication
- **Geospatial ping rings** - expanding ripples show live network activity
- **Cyberpunk gradient data streams** (Cyan -> Purple -> Pink -> Green)
- **Dynamic node highlighting** based on search queries
- **Smooth auto-rotation** with manual control
- **Atmospheric glow effects** with multi-layer halos

The globe responds to your queries - search for "nodes in USA" and watch it smoothly pan to North America while highlighting matching nodes. **Ping rings pulse outward from active nodes**, proving the network is alive.

---

### J.A.R.V.I.S. Voice Command

Yes, you read that right. **VOICE CONTROL.**

Click the microphone button and speak naturally:

> *"Show me active nodes in Europe"*
> *"Find nodes with latency under 50 milliseconds"*
> *"Display all inactive nodes"*

Our natural language parser understands:
- Location queries (country, region, city)
- Status filters (active, inactive, all)
- Performance metrics (latency ranges)
- Complex combinations

*"JARVIS, show me what we're working with."*

---

### AI-Powered Natural Language Search

Forget complex query syntax. Just type like you're talking to a friend:

| You Type | It Understands |
|----------|----------------|
| "fast nodes in asia" | Active nodes in Asia with low latency |
| "show me Germany" | All nodes located in Germany |
| "slow ones" | Nodes with high latency |
| "everything that's down" | All inactive nodes |
| "top performers" | Fastest responding nodes |

The search bar features:
- Real-time suggestions
- Animated holographic styling
- Voice input integration
- Query result counter

---

### Live Gossip Terminal (The Heartbeat)

A scrolling **system log** in the corner that shows raw network events in real-time:

- **GOSSIP_RECV** - Incoming gossip protocol messages
- **GOSSIP_PUSH** - Outgoing data propagation
- **HEARTBEAT** - Node health checks with latency
- **BLOCK_SYNC** - Ledger synchronization events
- **PEER_CONNECT** - New node discoveries

The terminal makes the dashboard feel **busy and connected**, like a real server room. Pause, expand, or minimize as needed.

*"It's not just a dashboard. It's mission control."*

---

### Node Comparison Mode (The Analyst Tool)

Select any **2 nodes** and compare them side-by-side:

| Metric | Node A | Node B |
|--------|--------|--------|
| Latency | Color-coded winner | Color-coded loser |
| CPU Usage | Real-time % | Real-time % |
| RAM Usage | With progress bar | With progress bar |
| Storage | Total capacity | Total capacity |
| Status | Active/Offline | Active/Offline |

Click "COMPARE" on any node card to select it. When 2 are selected, a **sticky comparison bar** appears at the bottom. Green = better, Red = worse.

*"Because real analysts need real tools."*

---

### 3D Tilt Node Cards with Deep Stats

Every node card responds to your mouse movement with a **smooth 3D parallax effect**:

- 15° perspective tilt
- Subtle scale on hover
- Glassmorphic backdrop blur
- **CPU & RAM usage** with animated progress bars
- **Uptime display** in human-readable format
- Real-time latency display with color coding
- Copy-to-clipboard node IDs

Expand any card to see **deep pNode statistics**:
- Storage bytes & pages
- Packets received/transmitted
- Active streams count
- Last seen timestamp

*"It's like each card is a holographic display floating in space."*

---

### Real-Time Network Statistics

| Metric | Display |
|--------|---------|
| Active Nodes | Live count with pulse animation |
| Network Latency | Color-coded performance indicator |
| Total Stake | Formatted with glowing effect |
| Global Regions | Country count coverage |
| Slot Height | Current blockchain slot |
| Epoch Progress | Visual progress bar |

The **HUD-style stats display** features:
- Floating holographic cards
- Real-time data updates via pRPC
- Animated value transitions
- Cyberpunk corner accents

---

## Easter Eggs

### Matrix Mode (`Ctrl + M`)

Press `Ctrl + M` anywhere to activate **THE MATRIX**:
- Everything turns green with sepia-hue rotation
- Scanline overlay appears with animation
- Monospace font takeover
- Digital rain effect
- Glitch sound effect

*"Follow the white rabbit..."*

---

### Winner Celebration

Type any of these magic words in the search:
- **"winner"**
- **"xandeum"**
- **"hackathon"**
- **"champion"**
- **"victory"**

Watch the screen EXPLODE with confetti while a toast declares:
> "XANDEUM TAKES FIRST PLACE!"

*We believe in manifesting success.*

---

## Technical Architecture

```
xanscan360/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Command Center (main dashboard)
│   │   ├── globals.css        # Cyberpunk styling system
│   │   └── layout.tsx         # Root layout with SEO metadata
│   ├── components/
│   │   └── dashboard/
│   │       ├── HeroGlobe.tsx        # 3D Globe with ping rings
│   │       ├── StatsHUD.tsx         # Floating statistics display
│   │       ├── NodeGrid.tsx         # 3D tilt cards + Compare Mode
│   │       ├── AINodeSelector.tsx   # Voice + NL search
│   │       ├── CinematicIntro.tsx   # Boot sequence animation
│   │       └── LiveGossipLog.tsx    # Real-time gossip terminal
│   ├── hooks/
│   │   ├── useXandeumNodes.ts     # pRPC data fetching
│   │   └── useSoundEffects.ts     # Procedural audio system
│   ├── lib/
│   │   ├── nl-parser.ts           # Natural language processing
│   │   └── mock-nodes.ts          # Fallback demo data
│   └── types/
│       └── node.ts                # TypeScript definitions
```

### Key Technologies

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Fluid animations |
| **react-globe.gl** | 3D Earth visualization |
| **Web Audio API** | Procedural sound generation |
| **Web Speech API** | Voice recognition |
| **react-tilt** | 3D parallax effects |
| **canvas-confetti** | Celebration effects |
| **pRPC** | Xandeum network integration |

---

## Live Data Integration

XanScan 360 connects directly to the **Xandeum Network** via pRPC (JSON-RPC 2.0):

```typescript
// Real endpoints we query:
POST https://xandeum.network/prpc

// Methods:
- prpc_getClusterNodes    // All pNode validators
- getSlot                 // Current slot height
- getEpochInfo            // Epoch progress
- getHealth               // Network health status
```

When live data is unavailable, the system gracefully falls back to **realistic mock data** simulating a global network of 50+ nodes across 25 countries.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/xanscan360.git

# Navigate to directory
cd xanscan360

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and prepare to be amazed.

### Build for Production

```bash
npm run build
npm start
```

---

## The Immersive Sound System

XanScan 360 features a **procedurally generated audio system** built entirely with the Web Audio API:

- **Ambient Hum**: Subtle spaceship-style drone at 40Hz, 80Hz, and 160Hz harmonics
- **Click Sounds**: Satisfying UI feedback
- **Scan Effect**: Deep bass thrum when refreshing data
- **Success Chimes**: Triumphant tones for completed actions
- **Alert Sounds**: Warning notifications
- **Glitch Effects**: Matrix mode activation sound

All sounds are generated in real-time - no audio files required!

---

## Why XanScan 360 Should Win

### Functionality
- **Real pRPC Integration** - Actually connects to Xandeum network
- **Live Gossip Visualization** - See network events in real-time
- **Node Comparison Mode** - Professional analytics tool
- **Export to CSV** - Download all node data

### Clarity
- **Intuitive UI** - Anyone can understand the data
- **Color-coded metrics** - Green good, red bad, instant comprehension
- **Natural language search** - No technical knowledge required

### User Experience
- **Voice Commands** - J.A.R.V.I.S. style control
- **3D Globe with Ping Rings** - Geospatial activity visualization
- **Cinematic Boot Sequence** - First impressions matter
- **Procedural Sound Design** - Every click feels satisfying

### Innovation
- **AI-Powered Search** - "Show me fast nodes in Europe"
- **Geospatial Ping Tracking** - Expanding rings prove network activity
- **Network Health Indicator** - OPTIMAL/DEGRADED/CRITICAL status
- **Matrix Mode Easter Egg** - Press Ctrl+M for fun

### The X-Factor
This isn't just a dashboard. It's what happens when you ask: *"What if Tony Stark built a blockchain explorer?"*

---

<div align="center">

### Built for the Xandeum Ecosystem

<br />

[![Xandeum](https://img.shields.io/badge/Powered_by-Xandeum-00FFFF?style=for-the-badge)](https://xandeum.network/)

<br />

*"The future of blockchain monitoring isn't just functional. It's cinematic."*

<br />

**XANSCAN 360** // SYSTEM VERSION 2.0.45 // NEURAL LINK ESTABLISHED

---

Made with mass mass of mass and mass mass of mass

</div>
