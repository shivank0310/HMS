import type { NavLink, HeroStat, BlockchainCard, ArchitectureItem } from '@/types';

export const navLinks: NavLink[] = [
  { label: 'Dashboard', href: '#modules' },
  { label: 'AI Services', href: '#ai' },
  { label: 'Blockchain', href: '#blockchain' },
  { label: 'Tech Stack', href: '#tech' },
  { label: 'Benefits', href: '#benefits' },
];

export const heroStats: HeroStat[] = [
  { value: 98, suffix: '%', label: 'Compliance Score' },
  { value: 92, suffix: '%', label: 'AI Diagnosis Accuracy' },
  { value: 18, suffix: '%', label: 'Fraud Risk (Low)' },
];

export const blockchainCards: BlockchainCard[] = [
  { blockNumber: 'BLOCK #10041', hash: '0x3f9a...c2b1e', data: 'Patient Record — John Doe' },
  { blockNumber: 'BLOCK #10039', hash: '0x8d7c...f4a22', data: 'Drug Dispensed — Warfarin 5mg' },
  { blockNumber: 'BLOCK #10040', hash: '0x1b5e...907d3', data: 'Invoice #INV-1024 — ₹7,500' },
  { blockNumber: 'BLOCK #10042', hash: '0x6e2f...a8d90', data: 'Treatment Plan — Antiviral Therapy' },
];

export const architectureItems: ArchitectureItem[] = [
  { icon: '🖥', label: 'FRONTEND', value: 'React · Mobile · Admin' },
  { icon: '🔌', label: 'API GATEWAY', value: 'REST · WebSocket · GraphQL' },
  { icon: '🤖', label: 'AI SERVICE LAYER', value: 'Diagnosis · Risk · Fraud · NLP' },
  { icon: '🔗', label: 'INTEGRATION LAYER', value: 'Hyperledger · IPFS · AI Models' },
  { icon: '🗄', label: 'BACKEND', value: 'Fabric Network · IPFS · DB' },
];
