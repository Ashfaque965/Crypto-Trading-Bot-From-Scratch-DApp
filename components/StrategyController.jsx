import React, { useState } from 'react';
import axios from 'axios';

export default function StrategyController() {
  const [config, setConfig] = useState({
    tokenIn: '', tokenOut: '', amountIn: '', targetPrice: '', type: 'BUY'
  });
  const [activeJobs, setActiveJobs] = useState([]);

  const handleStartBot = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/bot/start', config);
      if (res.data.success) {
        setActiveJobs([...activeJobs, { id: res.data.strategyId, ...config }]);
        alert("Bot Strategy Spun Up Safely!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopBot = async (id) => {
    try {
      const res = await axios.post('/api/bot/stop', { strategyId: id });
      if (res.data.success) {
        setActiveJobs(activeJobs.filter(job => job.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: '#1a1b1f', padding: '1.5rem', borderRadius: '16px', border: '1px solid #2d2f36' }}>
      <h3 style={{ marginBottom: '1rem' }}>🤖 Set Automated Rules</h3>
      <form onSubmit={handleStartBot} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <input type="text" placeholder="Base Token In Address" onChange={e => setConfig({...config, tokenIn: e.target.value})} required />
        <input type="text" placeholder="Target Token Out Address" onChange={e => setConfig({...config, tokenOut: e.target.value})} required />
        <input type="text" placeholder="Execution Amount" onChange={e => setConfig({...config, amountIn: e.target.value})} required />
        <input type="text" placeholder="Target Trigger Price Threshold" onChange={e => setConfig({...config, targetPrice: e.target.value})} required />
        <select value={config.type} onChange={e => setConfig({...config, type: e.target.value})} style={{ padding: '0.8rem', borderRadius: '12px', background: '#1a1b1f', color: '#fff', border: '1px solid #2d2f36' }}>
          <option value="BUY">BUY ORDER (Execute when yield rises above Target)</option>
          <option value="SELL">SELL ORDER (Execute when yield drops below Target)</option>
        </select>
        <button type="submit" style={{ padding: '0.8rem', background: '#4edf7a', border: 'none', borderRadius: '12px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
          Activate Strategy Rule
        </button>
      </form>

      {activeJobs.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4>Active Engine Operations ({activeJobs.length})</h4>
          {activeJobs.map(job => (
            <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d0e12', padding: '0.5rem 1rem', borderRadius: '8px', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <span>{job.type} {job.amountIn} Asset when Target hits {job.targetPrice}</span>
              <button onClick={() => handleStopBot(job.id)} style={{ background: '#ff4d4d', border: 'none', padding: '4px 8px', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Kill</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}