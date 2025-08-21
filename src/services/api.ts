import axios from 'axios';

// Default to MainNet
let API_BASE_URL = 'https://stellaris-node.connor33341.dev';

// Rate limiting configuration
const RATE_LIMIT_DELAY = 100; // ms between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms base delay for retries
const MAX_BLOCKS_PER_REQUEST = 500; // Reduced from 2000 to avoid 422 errors

// Function to update the API base URL (will be called by network context)
export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
};

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
  amount: number; // API returns numbers, not strings
}

export interface Transaction {
  is_coinbase: boolean;
  hash: string;
  block_hash?: string;
  time_mined: number;
  outputs: BlockOutput[];
  inputs?: any[];
}

export interface Block {
  id: number;
  hash: string;
  content: string;
  address: string;
  random: number;
  difficulty: number;
  reward: number;
  timestamp: number;
  transactions?: Transaction[];
}

// API Response Types for blocks
interface BlockApiResponse {
  block: Block;
  transactions: string[] | null; // Array of transaction hashes
  full_transactions?: { hash: string; is_coinbase: boolean }[]; // Minimal transaction objects
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

// Rate limiting utility
class RateLimiter {
  private lastRequestTime = 0;

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

// Sleep utility for delays
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

class StellarisAPI {
  private rateLimiter = new RateLimiter();

  private async get<T>(endpoint: string, params?: Record<string, any>, retryCount = 0): Promise<T> {
    try {
      // Apply rate limiting
      await this.rateLimiter.waitIfNeeded();
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });
      const data = response.data as ApiResponse<T>;
      
      if (!data.ok) {
        throw new Error('API request failed');
      }
      
      return data.result;
    } catch (error: any) {
      console.error(`API Error for ${endpoint}:`, error);
      
      // Retry logic for rate limit errors (429) or network errors
      if (retryCount < MAX_RETRIES && (
        error.response?.status === 429 || 
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNRESET'
      )) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying ${endpoint} in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await sleep(delay);
        return this.get<T>(endpoint, params, retryCount + 1);
      }
      
      throw error;
    }
  }

  // Get network mining information
  async getMiningInfo(): Promise<MiningInfo> {
    return this.get<MiningInfo>('/get_mining_info');
  }

  // Get blocks with pagination
  async getBlocks(offset: number = 0, limit: number = 10): Promise<Block[]> {
    const response = await this.get<BlockApiResponse[]>('/get_blocks', { offset, limit });
    return response.map(item => ({
      ...item.block,
      transactions: [] // We'll need to fetch full transaction details separately if needed
    }));
  }

  // Get specific block by ID with optional full transaction details
  async getBlock(blockId: number, fullTransactions: boolean = false): Promise<Block> {
    const response = await this.get<BlockApiResponse>('/get_block', { 
      block: blockId, 
      full_transactions: fullTransactions 
    });
    
    const block: Block = {
      ...response.block,
      transactions: []
    };
    
    // Only fetch full transaction details if explicitly requested and available
    // Disabled by default to prevent rate limiting issues
    if (fullTransactions && response.full_transactions && response.full_transactions.length > 0) {
      console.log(`Fetching ${response.full_transactions.length} transactions for block ${blockId}`);
      
      // Fetch transactions sequentially with delays to avoid rate limits
      const transactions: Transaction[] = [];
      for (const [index, tx] of response.full_transactions.entries()) {
        try {
          const fullTx = await this.getTransaction(tx.hash);
          transactions.push(fullTx);
          
          // Add delay between transaction requests
          if (index < response.full_transactions.length - 1) {
            await sleep(RATE_LIMIT_DELAY);
          }
        } catch (error) {
          console.warn(`Failed to fetch transaction ${tx.hash}:`, error);
          // Use the basic transaction data from the block response
          transactions.push({
            ...tx,
            block_hash: block.hash,
            time_mined: block.timestamp,
            outputs: [],
            inputs: []
          });
        }
      }
      
      block.transactions = transactions;
    }
    
    return block;
  }

  // Get transaction by hash
  async getTransaction(txHash: string): Promise<Transaction> {
    return this.get<Transaction>('/get_transaction', { tx_hash: txHash });
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
      // Get more blocks to find enough transactions, but limit the API calls
      const latestBlocks = await this.getLatestBlocks(Math.min(20, limit * 2)); 
      const transactions: Transaction[] = [];
      
      // Get transactions from latest blocks - fetch blocks sequentially to avoid rate limits
      for (const [index, block] of latestBlocks.entries()) {
        try {
          // Create minimal transaction objects from block data
          // Since we can't fetch full transaction details due to rate limits,
          // we'll create basic transaction entries from the block info we already have
          const blockTransaction: Transaction = {
            is_coinbase: true,
            hash: `coinbase-${block.hash}`,
            block_hash: block.hash,
            time_mined: block.timestamp,
            outputs: [{
              address: block.address,
              amount: block.reward
            }],
            inputs: []
          };
          
          transactions.push(blockTransaction);
          
          // Add delay between iterations to respect rate limits
          if (index < latestBlocks.length - 1) {
            await sleep(RATE_LIMIT_DELAY);
          }
          
        } catch (error) {
          console.warn(`Failed to process block ${block.id}:`, error);
          // Continue with next block
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

  // Get network activity data for charting (24 hours)
  async getNetworkActivity24h(): Promise<{ time: string; transactions: number; blocks: number; hour: number }[]> {
    try {
      const miningInfo = await this.getMiningInfo();
      const latestBlockId = miningInfo.last_block.id;
      
      // Calculate 24 hours ago timestamp
      const now = Date.now() / 1000;
      const twentyFourHoursAgo = now - (24 * 60 * 60);
      
      // Use smaller batches to avoid rate limits and 422 errors
      // Assuming average block time of ~60 seconds, we need about 1440 blocks for 24 hours
      const estimatedBlocksFor24h = Math.min(1440, latestBlockId); // Reduced estimate
      const offset = Math.max(0, latestBlockId - estimatedBlocksFor24h);
      
      console.log(`Fetching blocks for network activity in smaller batches...`);
      
      // Fetch blocks in smaller chunks to avoid rate limits
      const allBlocks: Block[] = [];
      const chunkSize = Math.min(MAX_BLOCKS_PER_REQUEST, 200); // Use smaller chunks
      
      for (let i = 0; i < estimatedBlocksFor24h; i += chunkSize) {
        const currentOffset = offset + i;
        const currentLimit = Math.min(chunkSize, estimatedBlocksFor24h - i);
        
        try {
          console.log(`Fetching ${currentLimit} blocks from offset ${currentOffset}`);
          const blockChunk = await this.getBlocks(currentOffset, currentLimit);
          allBlocks.push(...blockChunk);
          
          // Add a small delay between chunks to respect rate limits
          if (i + chunkSize < estimatedBlocksFor24h) {
            await sleep(RATE_LIMIT_DELAY);
          }
        } catch (error) {
          console.warn(`Failed to fetch block chunk at offset ${currentOffset}:`, error);
          // Continue with other chunks rather than failing completely
        }
      }
      
      console.log(`Fetched ${allBlocks.length} total blocks for network activity`);
      
      // Filter blocks to last 24 hours
      const recentBlocks = allBlocks.filter(block => block.timestamp >= twentyFourHoursAgo);
      
      console.log(`Found ${recentBlocks.length} blocks in the last 24 hours`);
      
      // Group blocks by hour
      const hourlyData = new Map<number, { blocks: number; transactions: number }>();
      
      // Initialize all 24 hours with zero values
      for (let i = 0; i < 24; i++) {
        const hourTimestamp = Math.floor((now - (23 - i) * 3600) / 3600) * 3600;
        hourlyData.set(hourTimestamp, { blocks: 0, transactions: 0 });
      }
      
      // Process recent blocks and count transactions
      for (const block of recentBlocks) {
        const hourTimestamp = Math.floor(block.timestamp / 3600) * 3600;
        const existing = hourlyData.get(hourTimestamp) || { blocks: 0, transactions: 0 };
        
        // For now, assume 1 transaction per block (coinbase)
        // Avoid fetching individual transactions to prevent rate limits
        const transactionCount = 1;
        
        hourlyData.set(hourTimestamp, {
          blocks: existing.blocks + 1,
          transactions: existing.transactions + transactionCount
        });
      }
      
      // Convert to chart data format
      const chartPoints = [];
      const sortedHours = Array.from(hourlyData.keys()).sort((a, b) => a - b);
      
      for (const hourTimestamp of sortedHours) {
        const data = hourlyData.get(hourTimestamp)!;
        const hour = new Date(hourTimestamp * 1000).getHours();
        const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
        
        chartPoints.push({
          time: timeLabel,
          transactions: data.transactions,
          blocks: data.blocks,
          hour: hour
        });
      }
      
      return chartPoints;
    } catch (error) {
      console.error('Error fetching network activity:', error);
      throw error;
    }
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
