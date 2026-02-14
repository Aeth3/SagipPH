# Unit Testing Instructions

## Running Tests

1. **Install dependencies** (if not already):
   ```sh
   npm install
   # or
   yarn install
   ```

2. **Run all tests:**
   ```sh
   npm test
   # or
   yarn test
   ```

3. **Run tests for a specific file:**
   ```sh
   npm test -- <path-to-test-file>
   # Example:
   npm test -- __tests__/features/chat/ChatScreen.test.js
   ```

## Adding More Tests
- Place new test files in the `__tests__` directory, mirroring the structure of your source code.
- Use `.test.js` or `.test.tsx` extensions for test files.
- Use [Jest](https://jestjs.io/) and [@testing-library/react-native](https://testing-library.com/docs/react-native-testing-library/intro/) for React Native components.

## Example Test
```js
import React from 'react';
import { render } from '@testing-library/react-native';
import MyComponent from '../../path/to/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<MyComponent />);
    expect(getByTestId('my-component')).toBeTruthy();
  });
});
```

## Tips
- Mock dependencies as needed using `jest.mock()`.
- Use `getByTestId`, `getByText`, etc., to select elements.
- Check for both rendering and behavior (e.g., button presses, state changes).

---

For more details, see the [Jest documentation](https://jestjs.io/docs/getting-started).
