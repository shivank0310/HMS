import type { FlowStep } from '@/types';

export const dataFlowSteps: FlowStep[] = [
  {
    icon: '👤',
    iconBg: 'var(--cyan-dim)',
    name: 'User Input',
    description: 'Doctor/staff enters data or performs an action in the HMS interface.',
  },
  {
    icon: '🗄',
    iconBg: 'var(--purple-dim)',
    name: 'Data Collection',
    description: 'Data pulled from HMS modules, Blockchain, and IPFS sources.',
  },
  {
    icon: '🤖',
    iconBg: 'var(--amber-dim)',
    name: 'AI Processing',
    description: 'AI models analyze data and generate alerts, scores, and predictions.',
  },
  {
    icon: '📊',
    iconBg: 'var(--green-dim)',
    name: 'AI Output',
    description: 'Recommendations, risk scores, and insights presented to staff.',
  },
  {
    icon: '👨‍⚕️',
    iconBg: 'var(--cyan-dim)',
    name: 'Action & Decision',
    description: 'Doctor/admin takes action based on AI output and clinical judgment.',
  },
  {
    icon: '🔒',
    iconBg: 'var(--purple-dim)',
    name: 'Stored Securely',
    description: 'Results and actions stored immutably on Blockchain & IPFS.',
  },
];
