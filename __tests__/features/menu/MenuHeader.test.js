import React from 'react';
import { render } from '@testing-library/react-native';
import MenuHeader from '../../../../package/src/features/menu/components/MenuHeader';

describe('MenuHeader', () => {
    it('renders without crashing', () => {
        const { getByTestId } = render(<MenuHeader title="Test Menu" />);
        expect(getByTestId('menu-header')).toBeTruthy();
    });
});
