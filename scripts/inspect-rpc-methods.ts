/**
 * Script to inspect available methods on Xandeum/Solana Connection object
 * Run with: npx tsx scripts/inspect-rpc-methods.ts
 */

import { Connection } from '@solana/web3.js';

const RPC_ENDPOINT = 'https://rpc.xandeum.network';

async function inspectConnectionMethods() {
  console.log('🔍 Connecting to Xandeum RPC...');
  console.log(`   Endpoint: ${RPC_ENDPOINT}\n`);

  const connection = new Connection(RPC_ENDPOINT, 'confirmed');

  // Get all methods from the Connection prototype
  const connectionPrototype = Object.getPrototypeOf(connection);
  const allMethods = Object.getOwnPropertyNames(connectionPrototype);

  // Filter to get only methods (functions)
  const methods = allMethods.filter((name) => {
    try {
      return typeof (connection as any)[name] === 'function' && name !== 'constructor';
    } catch {
      return false;
    }
  });

  // Categorize methods
  const gossipMethods = methods.filter((m) => m.toLowerCase().includes('gossip'));
  const nodeMethods = methods.filter((m) => m.toLowerCase().includes('node') || m.toLowerCase().includes('cluster'));
  const getMethods = methods.filter((m) => m.startsWith('get'));
  const otherMethods = methods.filter(
    (m) => !m.startsWith('get') && !gossipMethods.includes(m) && !nodeMethods.includes(m)
  );

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    XANDEUM CONNECTION METHODS                  ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (gossipMethods.length > 0) {
    console.log('🌐 GOSSIP-RELATED METHODS:');
    console.log('─────────────────────────────────────────');
    gossipMethods.forEach((m) => console.log(`   • ${m}`));
    console.log();
  }

  if (nodeMethods.length > 0) {
    console.log('🖥️  NODE/CLUSTER METHODS:');
    console.log('─────────────────────────────────────────');
    nodeMethods.forEach((m) => console.log(`   • ${m}`));
    console.log();
  }

  console.log('📊 GET METHODS (likely data fetchers):');
  console.log('─────────────────────────────────────────');
  getMethods.sort().forEach((m) => console.log(`   • ${m}`));
  console.log();

  console.log('🔧 OTHER METHODS:');
  console.log('─────────────────────────────────────────');
  otherMethods.sort().forEach((m) => console.log(`   • ${m}`));
  console.log();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   Total methods found: ${methods.length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test key methods for node discovery
  console.log('🧪 TESTING NODE-RELATED METHODS...\n');

  // Test getClusterNodes - this is likely what we need for gossip nodes
  if (methods.includes('getClusterNodes')) {
    console.log('Testing: getClusterNodes()');
    try {
      const clusterNodes = await connection.getClusterNodes();
      console.log(`   ✅ Success! Found ${clusterNodes.length} nodes`);
      if (clusterNodes.length > 0) {
        console.log('\n   📋 Sample node structure:');
        const sample = clusterNodes[0];
        console.log(`      pubkey:     ${sample.pubkey}`);
        console.log(`      gossip:     ${sample.gossip}`);
        console.log(`      tpu:        ${sample.tpu}`);
        console.log(`      rpc:        ${sample.rpc || 'null'}`);
        console.log(`      version:    ${sample.version}`);
        console.log(`      featureSet: ${sample.featureSet}`);
        console.log(`      shredVersion: ${sample.shredVersion}`);

        console.log('\n   📊 All nodes summary:');
        console.log(`      Total nodes: ${clusterNodes.length}`);
        const withRpc = clusterNodes.filter(n => n.rpc).length;
        console.log(`      With RPC:    ${withRpc}`);
        const versions = [...new Set(clusterNodes.map(n => n.version))];
        console.log(`      Versions:    ${versions.join(', ')}`);
      }
    } catch (e: any) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    console.log();
  }

  // Test getVoteAccounts for validator info
  if (methods.includes('getVoteAccounts')) {
    console.log('Testing: getVoteAccounts()');
    try {
      const voteAccounts = await connection.getVoteAccounts();
      console.log(`   ✅ Success!`);
      console.log(`      Current validators:    ${voteAccounts.current.length}`);
      console.log(`      Delinquent validators: ${voteAccounts.delinquent.length}`);
    } catch (e: any) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    console.log();
  }

  // Test getEpochInfo
  if (methods.includes('getEpochInfo')) {
    console.log('Testing: getEpochInfo()');
    try {
      const epochInfo = await connection.getEpochInfo();
      console.log(`   ✅ Success!`);
      console.log(`      Epoch:        ${epochInfo.epoch}`);
      console.log(`      Slot:         ${epochInfo.absoluteSlot}`);
      console.log(`      Block Height: ${epochInfo.blockHeight}`);
    } catch (e: any) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    console.log();
  }

  // Test getVersion
  if (methods.includes('getVersion')) {
    console.log('Testing: getVersion()');
    try {
      const version = await connection.getVersion();
      console.log(`   ✅ Success!`);
      console.log(`      Solana Core: ${version['solana-core']}`);
      console.log(`      Feature Set: ${version['feature-set']}`);
    } catch (e: any) {
      console.log(`   ❌ Error: ${e.message}`);
    }
    console.log();
  }

  // Check for pNode specific methods
  const pNodeMethods = methods.filter((m) =>
    m.toLowerCase().includes('pnode') ||
    m.toLowerCase().includes('prpc') ||
    m.toLowerCase().includes('storage') ||
    m.toLowerCase().includes('xandeum')
  );

  if (pNodeMethods.length > 0) {
    console.log('🔥 PNODE/STORAGE SPECIFIC METHODS FOUND:');
    console.log('─────────────────────────────────────────');
    pNodeMethods.forEach((m) => console.log(`   • ${m}`));
    console.log();
  } else {
    console.log('ℹ️  No pNode-specific methods found on Connection object.');
    console.log('   pNode RPC methods may need direct JSON-RPC calls.\n');
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                         INSPECTION COMPLETE                    ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n📝 RECOMMENDATION: Use getClusterNodes() to fetch gossip nodes');
  console.log('   This returns all nodes appearing in the gossip protocol.\n');
}

inspectConnectionMethods().catch(console.error);
