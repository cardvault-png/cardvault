import { Server } from 'socket.io';
import { prisma } from '../utils/prisma';

interface CryptoData {
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export class CryptoRateService {
  private io: Server;
  private isRunning: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 60000; // 60 seconds
  private readonly COINS = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana'];
  private readonly SYMBOL_MAP: Record<string, string> = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'tether': 'USDT',
    'binancecoin': 'BNB',
    'solana': 'SOL'
  };
  private readonly NAME_MAP: Record<string, string> = {
    'bitcoin': 'Bitcoin',
    'ethereum': 'Ethereum',
    'tether': 'Tether',
    'binancecoin': 'BNB',
    'solana': 'Solana'
  };

  constructor(io: Server) {
    this.io = io;
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting crypto rate service...');
    
    // Initial fetch
    await this.fetchAndUpdateRates();
    
    // Start update loop
    this.updateInterval = setInterval(() => {
      this.fetchAndUpdateRates();
    }, this.UPDATE_INTERVAL);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('Crypto rate service stopped');
  }

  private async fetchAndUpdateRates() {
    try {
      const rates = await this.fetchCryptoRates();
      
      for (const rate of rates) {
        await this.updateRateInDatabase(rate);
      }
      
      // Emit updated rates to all connected clients
      this.io.emit('crypto_rates_update', rates);
      
      console.log('Crypto rates updated successfully');
    } catch (error) {
      console.error('Error fetching crypto rates:', error);
    }
  }

  private async fetchCryptoRates(): Promise<CryptoData[]> {
    try {
      const apiKey = process.env.COINGECKO_API_KEY;
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${this.COINS.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
      
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['x-cg-pro-api-key'] = apiKey;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return this.COINS.map(coin => ({
        symbol: this.SYMBOL_MAP[coin],
        name: this.NAME_MAP[coin],
        priceUsd: data[coin]?.usd || 0,
        change24h: data[coin]?.usd_24h_change || 0,
        volume24h: data[coin]?.usd_24h_vol || 0,
        marketCap: data[coin]?.usd_market_cap || 0
      }));
    } catch (error) {
      console.error('Error fetching from CoinGecko:', error);
      
      // Fallback: return cached rates from database
      return this.getCachedRates();
    }
  }

  private async updateRateInDatabase(data: CryptoData) {
    try {
      await prisma.cryptoRate.upsert({
        where: { symbol: data.symbol },
        update: {
          priceUsd: data.priceUsd,
          change24h: data.change24h,
          volume24h: data.volume24h,
          marketCap: data.marketCap,
          lastUpdated: new Date()
        },
        create: {
          symbol: data.symbol,
          name: data.name,
          priceUsd: data.priceUsd,
          change24h: data.change24h,
          volume24h: data.volume24h,
          marketCap: data.marketCap
        }
      });
    } catch (error) {
      console.error(`Error updating rate for ${data.symbol}:`, error);
    }
  }

  private async getCachedRates(): Promise<CryptoData[]> {
    try {
      const rates = await prisma.cryptoRate.findMany({
        orderBy: { lastUpdated: 'desc' }
      });
      
      return rates.map(rate => ({
        symbol: rate.symbol,
        name: rate.name,
        priceUsd: parseFloat(rate.priceUsd.toString()),
        change24h: rate.change24h,
        volume24h: parseFloat(rate.volume24h.toString()),
        marketCap: parseFloat(rate.marketCap.toString())
      }));
    } catch (error) {
      console.error('Error getting cached rates:', error);
      return [];
    }
  }

  // Public method to get current rates
  async getCurrentRates(): Promise<CryptoData[]> {
    const rates = await prisma.cryptoRate.findMany({
      orderBy: { lastUpdated: 'desc' }
    });
    
    if (rates.length === 0) {
      // If no cached rates, fetch fresh
      return this.fetchCryptoRates();
    }
    
    return rates.map(rate => ({
      symbol: rate.symbol,
      name: rate.name,
      priceUsd: parseFloat(rate.priceUsd.toString()),
      change24h: rate.change24h,
      volume24h: parseFloat(rate.volume24h.toString()),
      marketCap: parseFloat(rate.marketCap.toString())
    }));
  }

  // Get single crypto rate
  async getRate(symbol: string): Promise<CryptoData | null> {
    const rate = await prisma.cryptoRate.findUnique({
      where: { symbol: symbol.toUpperCase() }
    });
    
    if (!rate) return null;
    
    return {
      symbol: rate.symbol,
      name: rate.name,
      priceUsd: parseFloat(rate.priceUsd.toString()),
      change24h: rate.change24h,
      volume24h: parseFloat(rate.volume24h.toString()),
      marketCap: parseFloat(rate.marketCap.toString())
    };
  }

  // Convert amount between currencies
  async convert(amount: number, fromSymbol: string, toSymbol: string): Promise<number> {
    if (fromSymbol === toSymbol) return amount;
    
    const fromRate = await this.getRate(fromSymbol);
    const toRate = await this.getRate(toSymbol);
    
    if (!fromRate || !toRate) {
      throw new Error('Exchange rate not available');
    }
    
    const usdValue = amount * fromRate.priceUsd;
    return usdValue / toRate.priceUsd;
  }
}
