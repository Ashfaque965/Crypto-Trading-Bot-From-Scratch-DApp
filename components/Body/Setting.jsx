import React, { useState } from 'react';

export default function Setting() {
  const [slippage, setSlippage] = useState('0.5');
  const [gasPricePreset, setGasPricePreset] = useState('standard');
  const [customGasLimit, setCustomGasLimit] = useState('250000');
  const [mevProtection, setMevProtection] = useState(true);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    const settingsPayload = {
      slippage: parseFloat(slippage),
      gasPricePreset,
      customGasLimit: parseInt(customGasLimit, 10),
      mevProtection
    };

    // Commit parameters to operational local state tracking mechanisms
    localStorage.setItem('bot_execution_settings', JSON.stringify(settingsPayload));
    alert('Execution guard rules committed successfully!');
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>⚙️ Risk & Execution Settings</h3>
      <p style={styles.subtitle}>
        Fine-tune execution parameters to protect on-chain trades against high slippage, MEV sandwiches, and gas price volatility.
      </p>

      <form onSubmit={handleSaveSettings} style={styles.form}>
        
        {/* Slippage Control */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Max Slippage Tolerance (%)</label>
          <div style={styles.presetContainer}>
            {['0.1', '0.5', '1.0'].map((val) => (
              <button
                key={val}
                type="button"
                style={{
                  ...styles.presetBtn,
                  backgroundColor: slippage === val ? '#3894ff' : '#0d0e12',
                  borderColor: slippage === val ? '#3894ff' : '#2d2f36',
                }}
                onClick={() => setSlippage(val)}
              >
                {val}%
              </button>
            ))}
            <input
              type="number"
              step="0.01"
              style={styles.customInput}
              placeholder="Custom"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
            />
          </div>
        </div>

        {/* Gas Preset Selectors */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Gas Speed Profile</label>
          <select
            style={styles.select}
            value={gasPricePreset}
            onChange={(e) => setGasPricePreset(e.target.value)}
          >
            <option value="standard">Standard (Market Baseline)</option>
            <option value="fast">Fast (+10% Priority Fee)</option>
            <option value="instant">Instant (+25% Frontrun Mitigation)</option>
          </select>
        </div>

        {/* Gas Limit Configuration */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Execution Gas Limit Cap</label>
          <input
            type="number"
            style={styles.input}
            value={customGasLimit}
            onChange={(e) => setCustomGasLimit(e.target.value)}
            required
          />
        </div>

        {/* MEV Shield Toggle */}
        <div style={styles.toggleGroup}>
          <div>
            <div style={styles.toggleTitle}>MEV Frontrunning Protection</div>
            <div style={styles.toggleSubtitle}>Route trades through private RPC relays (Flashbots) to mask transaction state pools.</div>
          </div>
          <input
            type="checkbox"
            style={styles.checkbox}
            checked={mevProtection}
            onChange={(e) => setMevProtection(e.target.checked)}
          />
        </div>

        <button type="submit" style={styles.submitBtn}>
          Commit Parameters
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: {
    background: '#1a1b1f',
    border: '1px solid #2d2f36',
    borderRadius: '16px',
    padding: '1.5rem',
    color: '#fff',
    marginTop: '1.5rem'
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#98a1c0',
    marginBottom: '1.5rem',
    lineHeight: '1.4'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.8rem',
    color: '#98a1c0',
    fontWeight: '500'
  },
  presetContainer: {
    display: 'flex',
    gap: '0.5rem'
  },
  presetBtn: {
    color: '#fff',
    border: '1px solid',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  customInput: {
    flex: '1',
    padding: '0.5rem',
    fontSize: '0.85rem',
    textAlign: 'right'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    background: '#0d0e12',
    border: '1px solid #2d2f36',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '0.9rem',
    outline: 'none'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.9rem'
  },
  toggleGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#0d0e12',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    border: '1px solid #2d2f36'
  },
  toggleTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff'
  },
  toggleSubtitle: {
    fontSize: '0.75rem',
    color: '#98a1c0',
    marginTop: '0.15rem',
    maxWidth: '340px'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  submitBtn: {
    background: '#3894ff',
    color: '#fff',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    transition: 'background 0.2s ease'
  }
};