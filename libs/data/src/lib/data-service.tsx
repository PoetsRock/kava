import {
  AccountsAndPricesData, AccountsFromApi, AccountsResult, ApiResponse, BalanceData, Balances, ErrorFromApi,
  PricingFromApi, Totals
} from '@lib/types';
import axios from 'axios';
import React from 'react';
import { DataServiceCore } from './data-service-core';

export const ACCOUNTS_URL = 'https://api.kava.io/auth/accounts/kava1vlpsrmdyuywvaqrv7rx6xga224sqfwz3fyfhwq';
export const PRICES_URL = 'https://api.kava.io/pricefeed/prices';

export class DataService extends DataServiceCore {

  public constructor() {
    super();
  }

  public async fetchPrices(): Promise<PricingFromApi[] | ErrorFromApi> {
    try {
      return await axios.get(PRICES_URL)
        .then((priceData: ApiResponse<PricingFromApi[]>) => priceData.data.result);
    } catch (err) {
      return this.handleError(err)
    }
  }

  public async fetchAccounts(): Promise<AccountsFromApi | ErrorFromApi> {
    try {
      return await axios.get(ACCOUNTS_URL)
        .then((accountData: ApiResponse<AccountsResult>) => accountData.data.result.value)
    } catch (err) {
     return this.handleError(err);
    }
  }

  public async getAccountsAndPrices(): Promise<Balances> {
    return await Promise.all([this.fetchPrices(), this.fetchAccounts()])
      .then(async ([prices, accounts]: AccountsAndPricesData) => {
        const subtotals: BalanceData[] = await this.transformDataForView(prices as PricingFromApi[], accounts as AccountsFromApi);
        const totals: Totals = this.calcTotals(subtotals);
        return { subtotals, totals }
      });
  }
}
