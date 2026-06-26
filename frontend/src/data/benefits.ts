import type { Benefit, FooterLinkGroup } from '@/types';

export const benefits: Benefit[] = [
  {
    icon: '🔬',
    title: 'Improved Diagnostic Accuracy',
    description:
      'AI achieves 92%+ confidence in differential diagnosis, reducing misdiagnosis rates and accelerating treatment decisions.',
  },
  {
    icon: '👤',
    title: 'Personalized Patient Care',
    description:
      "Treatment plans and recommendations tailored to each patient's history, genetics, and lifestyle factors using ML models.",
  },
  {
    icon: '⚡',
    title: 'Early Risk Detection',
    description:
      'Predict deterioration 6+ hours in advance, enabling proactive intervention and significantly reducing ICU emergencies.',
  },
  {
    icon: '🛡',
    title: 'Fraud & Anomaly Detection',
    description:
      'Real-time insurance fraud detection and access anomaly alerts protect revenue and ensure regulatory compliance.',
  },
  {
    icon: '💰',
    title: 'Optimized Resources & Cost',
    description:
      'AI-driven inventory forecasting and generic drug substitution reduce operational costs by up to 15% annually.',
  },
  {
    icon: '✅',
    title: 'Better Decision Making',
    description:
      'Clinicians get real-time AI insights, drug interaction warnings, and evidence-based recommendations at the point of care.',
  },
];

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    heading: 'Modules',
    links: [
      { label: 'Doctor Dashboard', href: '#' },
      { label: 'Patient Portal', href: '#' },
      { label: 'Emergency Center', href: '#' },
      { label: 'Pharmacy', href: '#' },
      { label: 'Billing & Insurance', href: '#' },
      { label: 'Audit & Compliance', href: '#' },
    ],
  },
  {
    heading: 'Technology',
    links: [
      { label: 'Hyperledger Fabric', href: '#' },
      { label: 'IPFS Storage', href: '#' },
      { label: 'AI Service Layer', href: '#' },
      { label: 'REST & GraphQL API', href: '#' },
      { label: 'Smart Contracts', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Documentation', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];
