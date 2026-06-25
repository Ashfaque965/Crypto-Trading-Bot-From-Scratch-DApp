import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PriceMonitor({ tokenIn, tokenOut, amountIn }) {
  const [price, setPrice] = useState('0.0');

  const checkPrice = async () => {
    if (!tokenIn || !tokenOut) return;
    try {
      const res = await axios.post('http://localhost:5000/api/get-price', { amountIn, tokenIn, tokenOut });
      if (res.data.success) setPrice(res.data.expectedOutput);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    checkPrice();
    const interval = setInterval(checkPrice, 10000);
    return () => clearInterval(interval);
  }, [tokenIn, tokenOut]);

  return (
    <div style={{ background: '#1a1b1f', padding: '1.5rem', borderRadius: '16px', border: '1px solid #2d2f36' }}>
      <h3>📈 Price Oracle Stream</h3>
      <p style={{ margin: '1rem 0', fontSize: '1.2rem' }}>Expected Output: <strong>{price}</strong></p>
    </div>
  );
}