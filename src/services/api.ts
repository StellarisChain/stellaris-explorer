import axios from 'axios';

const API_BASE_URL = 'https://stellaris-node.connor33341.dev';

// API Response Types
interface ApiResponse<T> {
  ok: boolean;
  result: T;
}

// Mining Info Types
interface MiningInfo {
  difficulty: number;
  last_block: Block;
  pending_transactions: any[];
  pending_transactions_hashes: string[];
  merkle_root: string;
}

// Block Types
export interface BlockOutput {
  address: string;
  amount: string;
}

export interface Transaction {
  is_coinbase: boolean;
  hash: string;
  block_hash: string;
  time_mined: number;
  outputs: BlockOutput[];
  inputs?: any[];
}

export interface Block {
  id: number;
  hash: string;
  content: string;
  address: string;
  random: string;
  difficulty: number;
  reward: number;
  timestamp: number;
  transactions?: Transaction[];
}

// Address Info Types
interface SpendableOutput {
  amount: string;
  tx_hash: string;
  index: number;
}

interface AddressInfo {
  balance: string;
  spendable_outputs: SpendableOutput[];
  transactions: Transaction[];
  pending_transactions: any[] | null;
  pending_spent_outputs: any[] | null;
}

class StellarisAPI {
  private async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });
      const data = response.data as ApiResponse<T>;
      
      if (!data.ok) {
        throw new Error('API request failed');
      }
      
      return data.result;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get network mining information
  async getMiningInfo(): Promise<MiningInfo> {
    return this.get<MiningInfo>('/get_mining_info');
  }

  // Get blocks with pagination
  async getBlocks(offset: number = 0, limit: number = 10): Promise<Block[]> {
    return this.get<Block[]>('/get_blocks', { offset, limit });
  }

  // Get specific block by ID with optional full transaction details
  async getBlock(blockId: number, fullTransactions: boolean = true): Promise<Block> {
    return this.get<Block>('/get_block', { 
      block: blockId, 
      full_transactions: fullTransactions 
    });
  }

  // Get transaction by hash
  async getTransaction(txHash: string): Promise<Transaction> {
    return this.get<Transaction>('/get_transaction', { transaction: txHash });
  }

  // Get address information with transactions
  async getAddressInfo(
    address: string, 
    transactionLimit: number = 10
  ): Promise<AddressInfo> {
    return this.get<AddressInfo>('/get_address_info', {
      address,
      transactions_count_limit: transactionLimit
    });
  }

  // Get pending transactions
  async getPendingTransactions(): Promise<Transaction[]> {
    return this.get<Transaction[]>('/get_pending_transactions');
  }

  // Utility methods for the explorer
  async getLatestBlocks(limit: number = 10): Promise<Block[]> {
    try {
      const miningInfo = await this.getMiningInfo();
      const latestBlockId = miningInfo.last_block.id;
      
      // Ensure we have valid numbers
      if (!latestBlockId || isNaN(latestBlockId)) {
        console.warn('Invalid latest block ID, fetching blocks from offset 0');
        const blocks = await this.getBlocks(0, limit);
        console.log('Fetched blocks from offset 0:', blocks);
        return blocks.sort((a, b) => b.id - a.id);
      }
      
      // Calculate offset to get the latest blocks
      const offset = Math.max(0, latestBlockId - limit + 1);
      const blocks = await this.getBlocks(offset, limit);
      
      console.log('Fetched latest blocks:', blocks);
      
      // Sort by ID descending to show newest first
      return blocks.sort((a, b) => b.id - a.id);
    } catch (error) {
      console.error('Error fetching latest blocks:', error);
      // Fallback: try to get recent blocks without using mining info
      try {
        const blocks = await this.getBlocks(0, limit);
        console.log('Fallback blocks:', blocks);
        return blocks.sort((a, b) => b.id - a.id);
      } catch (fallbackError) {
        console.error('Fallback block fetch also failed:', fallbackError);
        return [];
      }
    }
  }

  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    try {
      const latestBlocks = await this.getLatestBlocks(5); // Get last 5 blocks
      const transactions: Transaction[] = [];
      
      // Get transactions from latest blocks
      for (const block of latestBlocks) {
        if (block.transactions) {
          transactions.push(...block.transactions);
        } else {
          // If transactions not included, fetch the block with full transaction details
          const fullBlock = await this.getBlock(block.id, true);
          if (fullBlock.transactions) {
            transactions.push(...fullBlock.transactions);
          }
        }
        
        if (transactions.length >= limit) {
          break;
        }
      }
      
      // Sort by time_mined descending and limit results
      return transactions
        .sort((a, b) => b.time_mined - a.time_mined)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
  }

  // Format helpers
  formatSTR(amount: string | number | null | undefined): string {
    if (amount == null) return '0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    }).format(numAmount);
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  formatTimeAgo(timestamp: number | null | undefined): string {
    if (timestamp == null) return 'Unknown time';
    const now = Date.now();
    const diff = now - (timestamp * 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  // Calculate network hash rate (simplified)
  calculateHashRate(difficulty: number): string {
    // This is a simplified calculation - you may need to adjust based on Stellaris specifics
    const hashRate = difficulty * 1000000; // Example calculation
    
    if (hashRate >= 1e12) {
      return `${(hashRate / 1e12).toFixed(2)} TH/s`;
    } else if (hashRate >= 1e9) {
      return `${(hashRate / 1e9).toFixed(2)} GH/s`;
    } else if (hashRate >= 1e6) {
      return `${(hashRate / 1e6).toFixed(2)} MH/s`;
    } else if (hashRate >= 1e3) {
      return `${(hashRate / 1e3).toFixed(2)} KH/s`;
    }
    return `${hashRate.toFixed(2)} H/s`;
  }
}

// Export singleton instance
export const stellarisAPI = new StellarisAPI();
export default stellarisAPI;

// Export types for use in components
export type {
  MiningInfo,
  AddressInfo,
  SpendableOutput
};
