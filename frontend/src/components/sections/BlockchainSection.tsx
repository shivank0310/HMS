import { blockNodes, blockchainFeatures } from '@/data/blockchain';
import SectionHeader from '@/components/ui/SectionHeader';
import './BlockchainSection.css';

export default function BlockchainSection() {
  return (
    <section id="blockchain" className="blockchain-section">
      <div className="glow-orb glow-1 blockchain-glow" />
      <div className="container blockchain-container">
        <SectionHeader
          label="Hyperledger Fabric + IPFS"
          title="Immutable Blockchain Ledger"
          description="Every clinical event — diagnosis, prescription, billing, consent — is cryptographically signed and stored on Hyperledger Fabric. Patient files are stored on IPFS with their hash anchored on-chain."
        />
        <div className="blockchain-flow">
          {blockNodes.map((node, index) => (
            <div key={node.number} className="block-node-wrap">
              {index > 0 && <div className="block-arrow">→</div>}
              <div
                className="block-node"
                style={{
                  borderColor: node.borderColor,
                  background: node.background,
                }}
              >
                <div className="block-number" style={{ color: node.numberColor }}>
                  {node.number}
                </div>
                <div className="block-hash">{node.hash}</div>
                {node.items.map((item) => (
                  <div key={item} className="block-data-item">
                    {item}
                  </div>
                ))}
                <div className="block-verified" style={{ color: node.verifiedColor }}>
                  {node.verified}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="blockchain-features">
          {blockchainFeatures.map((feature) => (
            <div key={feature.title} className="card blockchain-feature-card">
              <div className="blockchain-feature-icon">{feature.icon}</div>
              <div className="blockchain-feature-title">{feature.title}</div>
              <div className="blockchain-feature-desc">{feature.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
