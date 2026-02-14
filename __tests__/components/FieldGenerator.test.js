import React from 'react';
import { render } from '@testing-library/react-native';
import FieldGenerator from '../../../../package/components/FieldGenerator';

describe('FieldGenerator', () => {
    it('renders without crashing', () => {
        const { getByTestId } = render(<FieldGenerator fieldType="text" />);
        expect(getByTestId('field-generator')).toBeTruthy();
    });
});
