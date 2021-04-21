import { AxiosError, AxiosResponse } from 'axios';
import { AccountsFromApi } from './accounts';
import { PricingFromApi } from './pricing';

export type Denoms = 'bnb' | 'btcb' | 'busd' | 'hard' | 'ukava' | 'usdx' | 'xrpb'
export type DenomsSanitized = 'bnb' | 'btcb' | 'busd' | 'hard' | 'kava' | 'usdx' | 'xrpb'

export type ErrorFromApi = GenericErrorFromApi | ErrorFromApiOnReq | ErrorFromApiOnRes;
export type AccountsAndPricesData = [PricingFromApi[] | ErrorFromApi, AccountsFromApi | ErrorFromApi];

export enum MapDenoms {
  bnb = 'bnb',
  btcb = 'btcb',
  busd = 'busd',
  hard = 'hard',
  ukava = 'kava',
  usdx = 'usdx',
  xrpb = 'xrpb',
}

export interface ApiResponse<T> extends AxiosResponse{
  data: Data<T>;
}

export interface Data<T> {
  height: string;
  result: T;
}

export interface GenericErrorFromApi {
  error: AxiosError<unknown>;
  message: string;
}

export interface ErrorFromApiOnReq {
  request: unknown;
}

export interface ErrorFromApiOnRes {
  headers: unknown;
  status: number;
  data: unknown;
}

export class HandleAxiosErrors {
  private readonly responseError: AxiosError;

  public constructor(err: AxiosError) {
    this.responseError = err;
  }

  public transformError(): ErrorFromApi {
    if (this.responseError.response) {
      console.error(this.responseError.response.data);
      console.error(this.responseError.response.status);
      console.error(this.responseError.response.headers);
      return {
        headers: this.responseError.response.headers,
        status: this.responseError.response.status,
        data: this.responseError.response.data,
      }
    } else if (this.responseError.request) {
      console.error(this.responseError.request);
      return {
        request: this.responseError.request,
      }
    } else {
      console.error('Generic error from server:\n', this.responseError);
      console.error('Error Message:\n', this.responseError.message);
      return {
        error: this.responseError,
        message: this.responseError.message,
      }
    }
  }

}
