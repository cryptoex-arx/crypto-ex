# Assets

Static assets bundled with the app (images, fonts, icons).

- Keep raster images at the resolutions React Native expects
  (`name.png`, `name@2x.png`, `name@3x.png`) and prefer compressed PNG/WebP.
- Reference them with a static `require('...')` path so Metro can bundle them.

## Fonts

`fonts/` is the single source of truth for the app's typefaces (Figtree, OFL —
see `fonts/OFL.txt`). `react-native.config.js` points the linker here; after
adding or removing a face run `npx react-native-asset` and rebuild both apps.
Select a face in styles with `fontFamily: fonts.<weight>` from `src/theme`, not
`fontWeight` — see `src/theme/fonts.ts`.
