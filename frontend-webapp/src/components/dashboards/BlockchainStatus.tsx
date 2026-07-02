import type { DashboardApiData } from '@/types';
import './BlockchainStatus.css';

interface BlockchainStatusProps {
  data?: DashboardApiData | null;
  isLoading?: boolean;
  error?: string;
}

export default function BlockchainStatus({ data, isLoading, error }: BlockchainStatusProps) {
  const modules = data?.blockchain.modules ?? [];

  return (
    <div className="card blockchain-status">
      <div className="blockchain-status-head">
        <div>
          <div className="blockchain-status-title">Hyperledger Fabric live status</div>
          <div className="blockchain-status-sub">
            {data ? `${data.mspId} · refreshed ${new Date(data.generatedAt).toLocaleTimeString()}` : 'Waiting for role API'}
          </div>
        </div>
        <span className={`blockchain-status-pill ${isLoading ? 'is-loading' : ''} ${error ? 'is-error' : ''}`}>
          {error ? 'API fallback' : isLoading ? 'Syncing...' : 'Connected'}
        </span>
      </div>

      {error ? <div className="blockchain-status-note">{error}</div> : null}

      <div className="blockchain-module-grid">
        {(modules.length ? modules : [{ module: 'dashboard', channel: null, chaincode: null, databaseCount: 0, syncedCount: 0, failedCount: 0, onChainCount: 0 }]).map((module) => (
          <div className="blockchain-module" key={module.module}>
            <div className="blockchain-module-name">{module.module}</div>
            <div className="blockchain-module-meta">
              {module.channel && module.chaincode ? `${module.channel} · ${module.chaincode}` : 'Role dashboard API'}
            </div>
            <div className="blockchain-module-counts">
              <div>
                <span>DB</span>
                <strong>{module.databaseCount}</strong>
              </div>
              <div>
                <span>Synced</span>
                <strong>{module.syncedCount}</strong>
              </div>
              <div>
                <span>Chain</span>
                <strong>{module.onChainCount}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data?.blockchain.note ? <div className="blockchain-status-note">{data.blockchain.note}</div> : null}
    </div>
  );
}
