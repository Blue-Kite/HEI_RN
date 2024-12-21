import * as React from 'react';
import { render } from '@testing-library/react-native';
import Home from '../../app/(tabs)/index';

describe('<Home />', () => {
    test('홈랜더링 확인', () => {
        const { getByText, getByRole } = render(<Home />);

        expect(getByText('Upload image local')).toBeTruthy();
        expect(getByRole('button', { name: 'Upload' })).toBeTruthy();
    });
});
