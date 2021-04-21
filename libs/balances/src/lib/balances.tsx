import React, { useEffect, useState } from 'react';
import { DataService } from '@lib/data';
import { Balances, BalanceData, Totals, strToNum } from '@lib/types';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import './balances.module.scss';

const convertToCurrency = (str: string, precision = 2): string => {
  if (!str) {
    return '';
  }
  const curr = (strToNum(str) / 100).toFixed(precision);
  return `$${curr}`
}

const ActionItems = () => (
  <div className="p-d-flex p-jc-start p-ai-center">
    <Button label='Load/Unload' className="p-button-outlined main-button"/>
    <Button label='Send/Receive' className='p-button-outlined main-button'/>
  </div>
);

export function BalancesComponent() {
  const [totals, setTotals] = useState({} as Totals);
  const [subtotals, setSubtotals] = useState([] as BalanceData[]);
  const dataService = new DataService();

  useEffect(() => {
    dataService.getAccountsAndPrices()
      .then((balancesRes: Balances) => {
        setTotals(balancesRes.totals);
        setSubtotals(balancesRes.subtotals);
      })
  }, []);

  return (
    <section style={{ width: '92%' }} className='p-grid p-d-flex p-flex-column app-container'>

      <h2 style={{ marginLeft: '24px', fontWeight: 500 }}>Balances</h2>

      <Card className="p-d-flex p-jc-between p-ai-center card p-card p-card-body p-card-content balances">
        <div className="balance-total">
          <div className="label">Total Balance</div>
          <div className="amount">{convertToCurrency(totals.totalBalance)}</div>
        </div>

        <div className="p-d-flex p-ai-center balance-sub-totals">
          <div className="p-d-flex p-flex-column total-available">
            <div className="label">Total Available</div>
            <div className="amount">{convertToCurrency(totals.totalAvailable)}</div>
          </div>
          <div className="total-locked">
            <div className="label">Total Locked <i className="pi pi-lock"></i></div>
            <div className="amount">{convertToCurrency(totals.totalLocked)}</div>
          </div>
        </div>

      </Card>

      <section className="sub-totals-section">
        <div className='p-d-flex p-jc-between labels'>
          <div>Asset</div>
          <div>Total</div>
          <div>Available</div>
          <div>Locked <i className="pi pi-lock"></i></div>
        </div>


        <>
          {
            subtotals.map((balance: BalanceData, id: number) => {
              return <div key={id}>
                <Card className="p-grid card p-card p-card-body p-card-content">
                  <div className="p-col-2 p-d-flex p-jc-start p-ai-center icon-name-price" style={{ width: '15%' }}>
                    <img src={require(`./../../../assets/logos/${balance.cryptoName}.jpg`)}/>
                    <div className="p-d-flex p-flex-column p-jc-between card-label">
                      <div className="denom-asset">{balance.cryptoName.toUpperCase()}</div>
                      <div className="asset-current-price">{convertToCurrency(balance.currentPrice)}</div>
                    </div>
                  </div>

                  <div className="p-grid p-col p-d-flex p-jc-between balances-per-asset" style={{ width: '35%' }}>
                    <div className="p-col p-d-flex p-flex-column p-jc-center p-ai-start total-per-asset">
                      <div className="total-coins">{(strToNum(balance.totalCoins) / 100).toFixed(4)} {balance.cryptoName.toUpperCase()}</div>
                      <div className="total-balance">{convertToCurrency(balance.totalBalance)}</div>
                    </div>

                    <div className="p-col p-d-flex p-jc-start p-ai-center available-per-asset">
                      <div>{convertToCurrency(balance.liquid)}</div>
                    </div>

                    <div className="p-col p-d-flex p-jc-start p-ai-center locked-per-asset">
                      <div>{convertToCurrency(balance.locked)}</div>
                    </div>
                  </div>

                  <div className="p-col p-d-flex p-jc-end">
                    <ActionItems></ActionItems>
                  </div>

                </Card>
              </div>
            })
          }
        </>
      </section>

    </section>
  );
}

export default BalancesComponent;
