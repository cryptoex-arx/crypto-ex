/**
 * Native asset linking. `npx react-native-asset` reads `assets` to copy the
 * fonts into `android/app/src/main/assets/fonts` and register them with the
 * Xcode target, so keep `src/assets/fonts` as the single source of truth.
 */
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/fonts'],
};
