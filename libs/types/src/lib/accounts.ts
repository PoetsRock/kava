import { Denoms, DenomsSanitized } from './base';

/**
 * Accounts from API
 */
export interface AccountsFromApi {
  address: string;
  coins: Coin[];
  public_key: {
    type: string;
    value: string;
  };
  account_number: string;
  sequence: string;
  original_vesting: Coin[];
  delegated_free: Coin[];
  delegated_vesting: Coin[];
  end_time: string;
  start_time: string;
  vesting_periods: VestingPeriod[];
}

export interface Coin {
  denom: Denoms;
  amount: string;
}

export interface VestingPeriod {
  length: string;
  amount: Coin[];
}

export interface AccountsResult {
  type: string;
  value: AccountsFromApi;
}

/**
 * Pricing for View Components
 */

export type CoinData = Map<DenomsSanitized, CoinValue>;
export type VestingPeriodsMap = Map<DenomsSanitized, VestingPeriodsPerDenom[]>;

export interface Accounts {
  startTime: string;
  endTime: string;
  coin: CoinData;
}

export interface CoinValue {
  amount: string;
  currentPrice: string;
  delegatedFreeAmount?: string;
  delegatedVestingAmount?: string;
  denom: DenomsSanitized;
  originalVestingAmount?: string;
  vesting?: VestingPeriodsPerDenom[];
}

export interface VestingPeriodsPerDenom {
  length: string;
  amount: string;
}
