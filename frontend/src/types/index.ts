export interface NavLink {
  label: string;
  href: string;
}

export interface HeroStat {
  value: number;
  suffix: string;
  label: string;
}

export interface BlockchainCard {
  blockNumber: string;
  hash: string;
  data: string;
}

export interface ArchitectureItem {
  icon: string;
  label: string;
  value: string;
}

export interface AIService {
  icon: string;
  iconBg: string;
  name: string;
  description: string;
}

export interface Diagnosis {
  name: string;
  confidence: number;
  color?: string;
}

export interface Alert {
  patientId: string;
  patientName: string;
  condition: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface InvoiceLine {
  label: string;
  amount: string;
  isTotal?: boolean;
}

export interface BlockNode {
  number: string;
  hash: string;
  items: string[];
  verified: string;
  verifiedColor?: string;
  borderColor?: string;
  background?: string;
  numberColor?: string;
}

export interface FlowStep {
  icon: string;
  iconBg: string;
  name: string;
  description: string;
}

export interface TechItem {
  icon: string;
  name: string;
  description: string;
}

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface FooterLinkGroup {
  heading: string;
  links: { label: string; href: string }[];
}
