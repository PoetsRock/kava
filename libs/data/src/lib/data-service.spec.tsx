import { DataServiceCore } from '@lib/data';
import { Accounts, PricingMap } from '@lib/types';

import { DataService } from './data-service';
import { MockAccountsData } from './mock-data/mock-account-data';
import { MockPricingData } from './mock-data/mock-price-data';

describe('DataService', () => {
  let dataServiceCore: DataServiceCore;
  let dataService: DataService;
  let accounts: Accounts;
  let pricing: PricingMap;


  beforeEach(async () => {
    dataServiceCore = new DataServiceCore();
    dataService = new DataService();
    pricing = await dataServiceCore['transformPricingForView'](MockPricingData);
    accounts = await dataServiceCore['transformAccountsForView'](MockAccountsData, pricing);
  });

  it('should be an instance of the DataService class', () => {
    expect(dataService).toBeInstanceOf(DataService);
  });

});
