import {
  Accounts, AccountsFromApi, BalanceData, Coin, CoinData, CoinValue, DenomsSanitized, ErrorFromApi, HandleAxiosErrors,
  MapDenoms,
  PricingFromApi,
  PricingMap, strToNum, Totals, VestingPeriod,
  VestingPeriodsMap, VestingPeriodsPerDenom
} from '@lib/types';
import { AxiosError } from 'axios';

export class DataServiceCore {

  protected async transformDataForView(prices: PricingFromApi[], accounts: AccountsFromApi): Promise<BalanceData[]> {
    let updatedPricing: PricingMap;
    let updatedAccounts: Accounts;
    const balances: BalanceData[] = [];

    try {
      updatedPricing = await this.transformPricingForView(prices);
      updatedAccounts = await this.transformAccountsForView(accounts, updatedPricing);

      updatedAccounts.coin.forEach((coin) => {
        const locked = this.calcLockedPrice(updatedAccounts, coin.denom);
        const liquid = this.calcLiquidPrice(updatedAccounts, coin.denom, locked);
        const totalBalance = (strToNum(locked) + strToNum(liquid)).toString();
        const totalCoins = (strToNum(coin.amount) / strToNum(coin.currentPrice)).toString();
        const balance: BalanceData = {
          cryptoName: coin.denom,
          currentPrice: coin.currentPrice,
          liquid,
          locked,
          totalBalance,
          totalCoins,
        };
        balance.totalBalance = (strToNum(balance.locked) + strToNum(balance.liquid)).toString();
        balances.push(balance);
      });
    } catch (err) {
      console.error('error on transform:\n', err);
    }
    return balances;
  }

  protected async transformPricingForView(prices: PricingFromApi[]): Promise<PricingMap> {
    const pricesMap = new Map();
    prices.forEach((pricing) => {
      const price = pricing.price;
      let name = pricing.market_id.slice(0, pricing.market_id.indexOf(':'));
      if (name.startsWith('xrp', 0) || name.startsWith('btc', 0)) {
        name = `${name}b`;
      }
      if (pricing.market_id.indexOf('30') !== -1) {
        name = `${name}:30`;
      }
      pricesMap.set(name, { marketId: pricing.market_id, price });
    });
    return pricesMap;
  }

  protected async transformAccountsForView(account: AccountsFromApi, prices: PricingMap): Promise<Accounts> {
    const coinData: CoinData = new Map();
    const mappedVestingPeriods: VestingPeriodsMap = this.mapVestingPeriods(account);
    account.coins.forEach((coin: Coin) => {
      const coinDenom: DenomsSanitized = MapDenoms[coin.denom]
      const coinValue: CoinValue = {
        amount: this.calcCoinAmt(coin.amount, coinDenom),
        currentPrice: prices.get(coinDenom)?.price ?? '0',
        delegatedVestingAmount: this.findVestedAmount(account.delegated_vesting, coinDenom),
        delegatedFreeAmount: this.findVestedAmount(account.delegated_free, coinDenom),
        denom: coinDenom,
        originalVestingAmount: this.findVestedAmount(account.original_vesting, coinDenom),
        vesting: mappedVestingPeriods.get(coinDenom),
      };
      coinData.set(coinDenom, coinValue);
    })
    return {
      coin: coinData,
      startTime: account.start_time,
      endTime: account.end_time
    };
  }

  protected calcTotals(subtotals: BalanceData[]): Totals {
    let totalAvailable = 0;
    let totalBalance = 0;
    let totalLocked = 0;
    subtotals.forEach((subtotal: BalanceData) => {
      totalAvailable += strToNum(subtotal.liquid);
      totalLocked += strToNum(subtotal.locked);
      totalBalance += strToNum(subtotal.totalBalance);
    });
    return {
      totalAvailable: totalAvailable.toString(),
      totalLocked: totalLocked.toString(),
      totalBalance: totalBalance.toString(),
    }
  }

  protected mapVestingPeriods(accounts: AccountsFromApi): VestingPeriodsMap {
    const vestingPeriodsMap: VestingPeriodsMap = new Map();
    accounts.vesting_periods.forEach((vestingPeriod: VestingPeriod) => {
      const denom: DenomsSanitized = vestingPeriod.amount[0].denom !== 'ukava' ? vestingPeriod.amount[0].denom : 'kava';
      const denomVestingPeriod: VestingPeriodsPerDenom[] = vestingPeriodsMap.get(denom) ?? [];
      const amount = this.calcCoinAmt(vestingPeriod.amount[0].amount, denom);
      denomVestingPeriod.push({
        amount,
        length: vestingPeriod.length,
      });
      vestingPeriodsMap.set(denom, denomVestingPeriod);
    });
    return vestingPeriodsMap;
  }

  protected calcLockedPrice(accounts: Accounts, denom: DenomsSanitized): string {
    const vestingSum = this.calcVestingPeriodSum(accounts, denom);
    if (vestingSum < 1) {
      return '0';
    }
    return (strToNum(accounts.coin.get(denom)?.amount ?? '0') - vestingSum).toString();
  }

  protected calcLiquidPrice(accounts: Accounts, denom: DenomsSanitized, lockedAmount: string): string {
    const price: CoinValue | undefined = accounts.coin.get(denom) ?? undefined;
    if (typeof(price) === 'undefined' || typeof(price.delegatedVestingAmount) === 'undefined') {
      return '';
    }
    return Math.min(
      (strToNum(price.amount) + strToNum(price.delegatedVestingAmount)) - strToNum(lockedAmount),
      strToNum(price.amount)
    ).toString();
  }

  protected calcVestingPeriodSum(accounts: Accounts, denom: DenomsSanitized): number {
    let vestingSubtotal = 0;
    accounts.coin.get(denom)?.vesting?.forEach((vest) => {
      if (strToNum(accounts.startTime) + strToNum(vest.length) < (Date.now() / 1000)) {
        vestingSubtotal += strToNum(vest.amount);
      }
    });
    return vestingSubtotal;
  }

  protected calcCoinAmt(coinAmount: string, denom: DenomsSanitized): string {
    const coinAmtAsNum = strToNum(coinAmount);
    return (denom === 'hard' || denom === 'kava' || denom === 'usdx') ?
      Math.round(coinAmtAsNum / 10000).toString() :
      Math.round(coinAmtAsNum / 1000000).toString();
  }

  protected findVestedAmount(coin: Coin[], denom: DenomsSanitized): string | undefined {
    const amt: string = coin.find((x) => MapDenoms[x.denom] === denom)?.amount ?? '0';
    return this.calcCoinAmt(amt, denom);
  }

  protected handleError(responseError: AxiosError<unknown>): ErrorFromApi {
    const errorFromApi = new HandleAxiosErrors(responseError);
    return errorFromApi.transformError();
  }
}
