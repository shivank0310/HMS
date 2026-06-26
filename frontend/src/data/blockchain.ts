import type { BlockNode } from '@/types';

export const blockNodes: BlockNode[] = [
  {
    number: 'GENESIS BLOCK #0',
    hash: 'Hash: 0x0000...0000',
    items: ['🏥 Hospital Registry Init', '📅 Jan 1, 2024'],
    verified: '✓ Verified · Immutable',
  },
  {
    number: 'BLOCK #10039',
    hash: 'Hash: 0x8d7c...f4a22 | Prev: 0x3f1b...77cc',
    items: ['💊 Drug Dispensed: Warfarin', '👤 Patient: John Doe / P001'],
    verified: '✓ Verified on Fabric Network',
    borderColor: 'rgba(0,212,255,0.3)',
  },
  {
    number: 'BLOCK #10040',
    hash: 'Hash: 0x1b5e...907d | Prev: 0x8d7c...f4a22',
    items: ['🧾 Invoice #INV-1024: ₹7,500', '🛡 Fraud Score: 18% (Low)'],
    verified: '✓ Verified on Fabric Network',
    borderColor: 'rgba(0,212,255,0.3)',
  },
  {
    number: 'BLOCK #10041',
    hash: 'Hash: 0x3f9a...c2b1 | Prev: 0x1b5e...907d',
    items: ['📋 Treatment Plan Updated', '🤖 AI Diagnosis Saved'],
    verified: '✓ Verified on Fabric Network',
    borderColor: 'rgba(0,212,255,0.3)',
  },
  {
    number: 'BLOCK #10042 · PENDING',
    hash: 'Hash: Computing…',
    items: ['🔍 Audit Log Entry', '📁 IPFS: QmXh7...9dR2'],
    verified: '⏳ Awaiting Consensus',
    verifiedColor: 'var(--amber)',
    borderColor: 'rgba(124,92,252,0.4)',
    background: 'var(--purple-dim)',
    numberColor: 'var(--purple)',
  },
];

export const blockchainFeatures = [
  {
    icon: '🔐',
    title: 'Hyperledger Fabric',
    description:
      'Permissioned blockchain with peer nodes, ordering service, and smart contract chaincode.',
  },
  {
    icon: '🌐',
    title: 'IPFS Decentralized Storage',
    description:
      'Patient documents, scans, and reports stored on IPFS. Content-addressed by hash, linked on-chain.',
  },
  {
    icon: '📝',
    title: 'Smart Contracts (Chaincode)',
    description:
      'Automated execution of consent management, billing approval, and drug dispensing workflows.',
  },
];
