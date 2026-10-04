/**
 * @format
 */

import ReactTestRenderer from 'react-test-renderer';

import App from '../src/App';

// Open seeded orders start the simulated price feed's interval.
jest.useFakeTimers();

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
