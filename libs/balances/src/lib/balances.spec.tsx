import { render } from '@testing-library/react';

import Balances from './balances';

describe('Balances', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Balances />);
    expect(baseElement).toBeTruthy();
  });
});
