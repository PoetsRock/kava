import { DataService } from '@lib/data';
import { Accounts, PricingMap, VestingPeriod } from '@lib/types';

import { DataServiceCore } from './data-service-core';
import { MockAccountsData } from './mock-data/mock-account-data';
import { MockPricingData } from './mock-data/mock-price-data';


const mockVestPeriod: VestingPeriod[] = [
  {
    length: '6763707',
    amount: [
      {
        denom: 'ukava',
        amount: '21040'
      }
    ]
  },
  {
    length: '905987',
    amount: [
      {
        denom: 'hard',
        amount: '162846'
      }
    ]
  },
  {
    length: '5356800',
    amount: [
      {
        denom: 'hard',
        amount: '432'
      }
    ]
  },
  {
    length: '18509506',
    amount: [
      {
        denom: 'ukava',
        amount: '412655'
      }
    ]
  }
];


describe('DataServiceCore', () => {
  let dataServiceCore: DataServiceCore;
  let accounts: Accounts;
  let pricing: PricingMap;


  describe('#TransformPricingForView', () => {
    beforeEach(async () => {
      dataServiceCore = new DataServiceCore();
    });

    it('should be an instance of the DataServiceCore class', () => {
      expect(dataServiceCore).toBeInstanceOf(DataServiceCore);
    });

    it('should sum all the vesting periods', async () => {
      pricing = await dataServiceCore['transformPricingForView'](MockPricingData);
      expect(pricing.get('kava').price).toEqual('5.499600000000000044');
    });
  });

  describe('#TransformAccountsForView', () => {
    beforeEach(async () => {
      dataServiceCore = new DataServiceCore();
      pricing = await dataServiceCore['transformPricingForView'](MockPricingData);
    });

    it('should sum all the vesting periods', async () => {
      const accounts = await dataServiceCore['transformAccountsForView'](MockAccountsData, pricing);
      expect(accounts.coin.get('kava').amount).toEqual('31130726');
    });
  });

  describe('#UtilMethods', () => {

    beforeEach(async () => {
      dataServiceCore = new DataServiceCore();
      pricing = await dataServiceCore['transformPricingForView'](MockPricingData);
      accounts = await dataServiceCore['transformAccountsForView'](MockAccountsData, pricing);
    });

    describe('#CalcVestingPeriodSum', () => {

    it('should sum all the vesting periods', async () => {
      MockAccountsData.vesting_periods = mockVestPeriod;
      accounts = await dataServiceCore['transformAccountsForView'](MockAccountsData, pricing);
      const vestingPeriodSum = dataServiceCore['calcVestingPeriodSum'](accounts, 'kava');
      expect(vestingPeriodSum).toEqual(433695);
    });
  });


  describe('#CalcLockedPrice', () => {

    it('should return the sum of non-vested deposits for a given asset', async () => {
      MockAccountsData.vesting_periods = mockVestPeriod;
      accounts = await dataServiceCore['transformAccountsForView'](MockAccountsData, pricing);

      const lockedPrice = dataServiceCore['calcLockedPrice'](accounts, 'kava');
      expect(lockedPrice).toEqual('0');
    });
  });


  });
});
