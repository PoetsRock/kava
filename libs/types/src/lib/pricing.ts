import { DenomsSanitized } from './base';

export interface PricingFromApi {
  market_id: string;
  price: string;
}

export interface Pricing {
  marketId: string;
  price: string;
}

export type PricingMap = Map<DenomsSanitized, Pricing>;
