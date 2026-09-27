module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Inlines values from .env / .env.<mode> into the `@env` module at build time.
    // Mode is resolved from NODE_ENV (development by default, production for release bundles).
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        allowUndefined: true,
        quiet: true,
      },
    ],
  ],
};
