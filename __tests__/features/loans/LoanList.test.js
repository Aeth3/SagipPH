import React from 'react';
import { render } from '@testing-library/react-native';
import LoanList from '../../../../package/src/features/loans/components/LoanList';

describe('LoanList', () => {
    it('renders without crashing', () => {
        const { getByTestId } = render(<LoanList loans={[]} />);
        expect(getByTestId('loan-list')).toBeTruthy();
    });
});
