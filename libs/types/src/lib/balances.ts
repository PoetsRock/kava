import { DenomsSanitized } from './base';

export interface BalanceData {
  cryptoName: DenomsSanitized;
  currentPrice: string;
  liquid: string;
  locked: string;
  totalBalance: string;
  totalCoins: string;
}

export interface Totals {
  totalBalance: string;
  totalAvailable: string;
  totalLocked: string;
}

export interface Balances {
  subtotals: BalanceData[];
  totals: Totals;
}
