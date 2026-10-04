module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    // The vector icon packages require their .ttf directly, and the preset's
    // asset transformer only covers image and video extensions.
    '^.+\\.ttf$': require.resolve(
      '@react-native/jest-preset/jest/assetFileTransformer.js',
    ),
  },
  // These packages ship untranspiled ESM, or assets that need the transforms
  // above, so they must not be skipped.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-vector-icons|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-qrcode-svg)/)',
  ],
};
