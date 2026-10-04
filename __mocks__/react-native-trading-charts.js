/**
 * The chart is a native Fabric component with a TurboModule, neither of which
 * exists under Jest. Jest picks this file up automatically for the package.
 */
const { View } = require('react-native');

module.exports = {
  TradingChartsView: View,
  TradingCharts: {
    setHistory: jest.fn(),
    updateTrade: jest.fn(),
    updateCandle: jest.fn(),
  },
  createTradeBatcher: jest.fn(),
};
