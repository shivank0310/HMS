import type { AIService } from '@/types';

export const aiServices: AIService[] = [
  {
    icon: '🔬',
    iconBg: 'var(--cyan-dim)',
    name: 'Diagnosis Assistant',
    description:
      'Predicts possible diseases from patient symptoms, history, and reports. Confidence-scored differential diagnosis using scikit-learn & XGBoost.',
  },
  {
    icon: '💊',
    iconBg: 'var(--purple-dim)',
    name: 'Treatment Recommender',
    description:
      'Suggests personalized treatment plans based on diagnosis, patient history, allergies, and current medications using NLP models (GPT, BERT).',
  },
  {
    icon: '📊',
    iconBg: 'var(--amber-dim)',
    name: 'Risk Prediction',
    description:
      'Predicts patient risk of readmission and complications using Deep Learning (TensorFlow/PyTorch). Flags high-risk patients for proactive care.',
  },
  {
    icon: '🛡',
    iconBg: 'var(--red-dim)',
    name: 'Fraud Detection',
    description:
      'Detects insurance claim anomalies and billing irregularities in real-time. Pattern recognition identifies duplicate claims and inflated charges.',
  },
  {
    icon: '⚠️',
    iconBg: 'var(--green-dim)',
    name: 'Drug Interaction Checker',
    description:
      'Checks drug-drug and drug-patient interactions, generating clinical alerts. Prevents adverse events at the point of prescription and dispensing.',
  },
  {
    icon: '📦',
    iconBg: 'var(--cyan-dim)',
    name: 'Resource Forecasting',
    description:
      'Predicts ICU bed needs, inventory levels, and staffing requirements using Prophet & LSTM time series models for optimized operations.',
  },
];
