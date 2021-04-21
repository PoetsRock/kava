import { BalancesComponent } from '@lib/balances';
import PrimeReact from 'primereact/api';
import React from 'react';
PrimeReact.ripple = true;

export function App() {
  return (
    <BalancesComponent></BalancesComponent>
  )
}

export default App;
