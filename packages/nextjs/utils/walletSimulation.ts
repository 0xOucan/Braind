/**
 * Wallet Simulation Utility for Local Testing
 *
 * This utility simulates Starknet wallet connection for testing games locally
 * without needing to connect actual wallets.
 */

import { useState, useEffect } from 'react';

export interface SimulatedWallet {
  address: string;
  balance: string;
  isConnected: boolean;
  chainId: string;
}

// Simulated test wallet addresses
export const TEST_WALLETS = {
  alice: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  bob: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
  charlie: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
};

class WalletSimulator {
  private wallet: SimulatedWallet | null = null;
  private listeners: ((wallet: SimulatedWallet | null) => void)[] = [];

  /**
   * Simulate connecting a wallet
   */
  connect(walletKey: keyof typeof TEST_WALLETS = 'alice'): SimulatedWallet {
    this.wallet = {
      address: TEST_WALLETS[walletKey],
      balance: '100000000000000000000', // 100 STARK in wei
      isConnected: true,
      chainId: 'SN_SEPOLIA', // Sepolia testnet
    };

    console.log('🔗 Simulated wallet connected:', {
      address: this.wallet.address,
      balance: `${parseInt(this.wallet.balance) / 1e18} STARK`,
    });

    this.notifyListeners();
    return this.wallet;
  }

  /**
   * Simulate disconnecting wallet
   */
  disconnect(): void {
    console.log('🔌 Simulated wallet disconnected');
    this.wallet = null;
    this.notifyListeners();
  }

  /**
   * Get current simulated wallet
   */
  getWallet(): SimulatedWallet | null {
    return this.wallet;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.wallet !== null && this.wallet.isConnected;
  }

  /**
   * Subscribe to wallet changes
   */
  subscribe(listener: (wallet: SimulatedWallet | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Simulate a transaction
   */
  async simulateTransaction(params: {
    contractAddress: string;
    entrypoint: string;
    calldata: string[];
  }): Promise<{ transaction_hash: string; status: string }> {
    if (!this.wallet) {
      throw new Error('No wallet connected');
    }

    console.log('📝 Simulating transaction:', params);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    console.log('✅ Transaction simulated:', txHash);

    return {
      transaction_hash: txHash,
      status: 'ACCEPTED_ON_L2',
    };
  }

  /**
   * Simulate reading from contract
   */
  async simulateContractRead(params: {
    contractAddress: string;
    entrypoint: string;
    calldata: string[];
  }): Promise<any> {
    console.log('📖 Simulating contract read:', params);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return mock data based on entrypoint
    switch (params.entrypoint) {
      case 'get_score':
        return [Math.floor(Math.random() * 1000).toString()];
      case 'get_leaderboard':
        return [
          ['1000', '900', '800', '700', '600'],
          [
            TEST_WALLETS.alice,
            TEST_WALLETS.bob,
            TEST_WALLETS.charlie,
            '0x1111111111111111111111111111111111111111111111111111111111111111',
            '0x2222222222222222222222222222222222222222222222222222222222222222',
          ],
        ];
      default:
        return ['0'];
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.wallet));
  }
}

// Export singleton instance
export const walletSimulator = new WalletSimulator();

/**
 * React hook for simulated wallet (for testing)
 */
export function useSimulatedWallet() {
  if (typeof window === 'undefined') {
    return {
      wallet: null,
      connect: () => {},
      disconnect: () => {},
      isConnected: false,
    };
  }

  const [wallet, setWallet] = useState<SimulatedWallet | null>(
    walletSimulator.getWallet()
  );

  useEffect(() => {
    const unsubscribe = walletSimulator.subscribe(setWallet);
    return unsubscribe;
  }, []);

  return {
    wallet,
    connect: (key?: keyof typeof TEST_WALLETS) => walletSimulator.connect(key),
    disconnect: () => walletSimulator.disconnect(),
    isConnected: walletSimulator.isConnected(),
  };
}
