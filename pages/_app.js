import React from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { TradingProvider } from '../context/TradingContext';

export default function App({ Component, pageProps }) {
  return (
    <TradingProvider>
      <Head>
        <title>Crypto Trading Bot Terminal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="High-performance automated decentralized exchange algorithmic tracking terminal." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="terminal-app-wrapper" style={styles.appWrapper}>
        <Component {...pageProps} />
      </div>
    </TradingProvider>
  );
}

const styles = {
  appWrapper: {
    backgroundColor: '#0d0e12',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#fff',
    overflowX: 'hidden'
  }
};