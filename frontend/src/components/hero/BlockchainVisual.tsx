import './BlockchainVisual.css';

const cards = [
  { className: 'bc1', blockNumber: 'BLOCK #10041', hash: '0x3f9a...c2b1e', data: 'Patient Record — John Doe' },
  { className: 'bc2', blockNumber: 'BLOCK #10039', hash: '0x8d7c...f4a22', data: 'Drug Dispensed — Warfarin 5mg' },
  { className: 'bc3', blockNumber: 'BLOCK #10040', hash: '0x1b5e...907d3', data: 'Invoice #INV-1024 — ₹7,500' },
  { className: 'bc4', blockNumber: 'BLOCK #10042', hash: '0x6e2f...a8d90', data: 'Treatment Plan — Antiviral Therapy' },
];

export default function BlockchainVisual() {
  return (
    <div className="hero-visual">
      <div className="blockchain-visual-inner">
        {cards.map((card) => (
          <div key={card.blockNumber} className={`blockchain-card ${card.className}`}>
            <div className="bc-label">{card.blockNumber}</div>
            <div className="bc-hash">{card.hash}</div>
            <div className="bc-data">{card.data}</div>
            <div className="bc-verified">✓ Verified on Chain</div>
          </div>
        ))}
        <div className="bc-connector conn-v conn-v1" />
        <div className="bc-connector conn-v conn-v2" />
        <div className="bc-connector conn-h" />
      </div>
    </div>
  );
}
