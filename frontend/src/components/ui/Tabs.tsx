import { useState } from 'react';
import './Tabs.css';

interface TabsProps {
  tabs: string[];
  defaultActive?: number;
}

export default function Tabs({ tabs, defaultActive = 0 }: TabsProps) {
  const [active, setActive] = useState(defaultActive);

  return (
    <div className="tabs">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={`tab ${index === active ? 'active' : ''}`}
          onClick={() => setActive(index)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
