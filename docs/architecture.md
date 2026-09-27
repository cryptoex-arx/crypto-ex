# Architecture

Scope: this document describes the foundation of the app and the screen layer
built on top of it — what exists, why it is shaped this way, and the rules to
follow when features are added. The screens render the product UI from the
supplied designs; every value they show is placeholder data held in the screen
or in `src/constants`, because no API, authentication or persistence exists yet.

## Stack

| Concern    | Choice                                               |
| ---------- | ---------------------------------------------------- |
| Framework  | React Native 0.86 (Community CLI, not Expo)          |
| Language   | TypeScript 5.8, `strict` plus extra checks           |
| Navigation | React Navigation 7 (native stack + bottom tabs)      |
| Icons      | `react-native-vector-icons` (Feather, plus Ionicons) |
| State      | React Context + `useReducer` (no library)            |
| Networking | `fetch` wrapped in `src/services/api`                |
| Config     | `react-native-dotenv` (Babel-time inlining)          |
| Tooling    | ESLint 8 + Prettier 2 + Jest                         |

## Layers

```text
screens ──► components ──► theme
   │             │
   │             └────────► hooks
   ├──► store (app-level state)
   └──► services/api ──► config ──► @env
                    └──► utils/logger
```

Rules that keep the layering intact:

- **Screens** orchestrate UI. They own screen-local state and compose
  components; they do not contain transport or persistence logic.
- **Components** are presentational. `ui/` holds primitives with no domain
  knowledge; `common/` holds shared composites built from those primitives.
- **Services** own everything that talks to the outside world and translate
  failures into `ApiError`.
- **Config** is the only place that reads `@env`. Nothing else imports it.
- **Store** holds state that more than one screen needs. Anything belonging to a
  single screen stays in that screen.

## Decisions

**React Native CLI kept as-is.** The project was already scaffolded with the
community CLI and has working `android/` and `ios/` folders, so the existing
native setup, Metro config and Babel preset were preserved. The only native edit
is `MainActivity.kt`, which installs `RNScreensFragmentFactory` as required by
`react-native-screens`.

**Navigation: splash, then two branches under a root stack.** `RootNavigator`
holds `SplashScreen` while the app boots, then renders either `AuthNavigator` or
`AppNavigator` based on a placeholder flag in the app store. `AppNavigator` is a
native stack whose first route is `MainTabNavigator` (Home, Markets, Futures,
Portfolio, Account); every detail screen reached from the Account tab is pushed
on that stack, so it covers the tab bar. Param lists live in
`src/navigation/types.ts` and are registered on `ReactNavigation.RootParamList`,
so `navigate()` and `useNavigation()` are typed everywhere without extra
generics. Screens receive typed props via
`AuthStackScreenProps<'MobileNumber'>`, `AppStackScreenProps<'Profile'>` or
`MainTabScreenProps<'Portfolio'>` — the last one is a composite type so tab
screens can also reach the stack routes.

**Auth is mobile number + OTP, nothing else.** `AuthNavigator` has exactly two
routes: `MobileNumber` collects a 10-digit number, `OtpVerification` takes the
6-digit code and flips the session flag. There is no registration, no password
and therefore no reset flow — a number that has never signed in and one that has
follow the same two steps. Shared values (country code, field lengths, resend
delay) live in `src/constants/auth.ts`. Nothing is sent or verified yet.

**Headers are components, not navigator options.** Both navigators run with
`headerShown: false` and each screen renders `ScreenHeader` itself. The designs
need a centred title with arbitrary leading and trailing content (a coin avatar,
a balance-visibility toggle), which is simpler to express as a component than as
per-route `options`.

**Icons: `react-native-vector-icons`.** The designs use around sixty line
icons, all of which ship in the Feather set (`@react-native-vector-icons/feather`);
`@react-native-vector-icons/ionicons` covers the three glyphs Feather lacks
(fingerprint, palette, shield-check). `src/components/ui/icons.ts` maps the
app-level names onto those fonts and `Icon` renders any of them at any size or
colour, so screens never name a font family and no icon geometry is hand-drawn.
Both packages autolink their fonts, but adding them requires a native rebuild of
the Android/iOS app. `react-native-svg` stays for the portfolio donut chart.

**State: no library.** A single `AppStateProvider` (Context + `useReducer`)
covers the only piece of app-level state that exists today — the placeholder
session flag the root navigator switches on. Redux/Zustand/Jotai would be
premature; introduce one only when shared state actually outgrows this. There is
no persistence layer yet: add `@react-native-async-storage/async-storage` when a
real requirement for persistent state appears, and hydrate it inside the
provider rather than in components.

**Theme: colors and typography only.** `src/theme` exposes light/dark palettes
and seven text variants. The palette carries the tinted surfaces the designs
rely on (`surfaceStrong` for icon tiles and segmented tracks, `successSurface` /
`dangerSurface` for status badges) so screens never hard-code a colour.
`useTheme()` resolves the palette from the OS color scheme and returns a
per-scheme stable object. Spacing, radii and shadows are deliberately _not_
centralised — they live in the `StyleSheet` of the component or screen that
needs them until a real pattern emerges.

**Fonts: pick the face, not the weight.** The app ships Figtree (OFL) as four
static faces in `src/assets/fonts`, registered natively through
`react-native.config.js` — copies under `android/app/src/main/assets/fonts`,
and `UIAppFonts` plus a `Fonts` group in the Xcode target. Android resolves a
bundled font by _file name_ and only recognises the `_bold` / `_italic`
suffixes, so `fontWeight: '600'` there silently falls back to the system font.
Styles therefore select a face with `fontFamily: fonts.semiBold` and set no
`fontWeight` at all, which renders identically on both platforms. Adding a
weight means dropping the `.ttf` into `src/assets/fonts`, running
`npx react-native-asset`, and rebuilding — it is not a JS-only change.

**Errors.** `ApiError` carries a `kind` (`network`, `timeout`, `http`, `parse`,
`config`, `unknown`) plus an optional status. `toApiError` normalises anything
thrown by the transport; `getUserMessage` maps it to copy from
`src/constants/messages.ts`. Raw error text is never rendered — technical detail
goes to `logger` only. `ErrorBoundary` wraps the app for unexpected render
errors; `ErrorState` / `EmptyState` / `LoadingIndicator` cover the routine UI
states.

**Environment.** `react-native-dotenv` was chosen over `react-native-config`
because it is a Babel plugin: no native linking, no Gradle/Xcode changes. Values
are inlined at build time, so they are **not secret** — they must not hold
private keys. The mode is resolved from `NODE_ENV` (`development` by default,
`production` for release bundles), which is why the files are named
`.env.development` / `.env.production`. `src/config/env.ts` parses and defaults
every value so a missing key degrades predictably instead of crashing the bundle.

**No path aliases.** Imports are relative. Aliases would require
`babel-plugin-module-resolver`, matching `tsconfig` paths, a Jest
`moduleNameMapper` and an ESLint resolver; the tree is shallow enough that the
cost is not worth paying yet.

## Conventions

- `PascalCase.tsx` for components (`PrimaryButton.tsx`), `camelCase.ts` for
  everything else (`httpClient.ts`), `useSomething.ts` for hooks,
  `UPPER_SNAKE_CASE` for exported constants.
- Each screen is a `camelCase` folder holding exactly two files: `index.tsx`
  with the component and `styles.ts` with its `StyleSheet`. `styles.ts` carries
  layout and static values only; anything that depends on `useTheme()` is
  applied inline in `index.tsx`, which also keeps the
  `react-native/no-inline-styles` lint rule quiet.
- One primary export per file; folders expose a barrel `index.ts` for external
  consumers, while files inside a folder import each other directly.
- Imports are sorted automatically (`simple-import-sort`): packages, then
  absolute, then relative — run `npm run lint:fix`.
- `console` is banned by ESLint; use `src/utils/logger.ts`, which is silent
  outside development for `debug`/`warn`. Never log credentials, tokens or
  request bodies.
- Prefer `FlatList`/`SectionList` for any list that can grow. Do not add
  `memo`/`useMemo`/`useCallback` without a measured reason — the existing
  `useMemo` calls exist to keep context and theme object identities stable.
- Validate user input in the screen or hook that collects it, and never rely on
  client-side checks for authorization.

## Not built yet

Intentionally absent until a feature requires them: authentication, API
endpoints, persistent storage (the Appearance and Base Currency choices are
screen-local and are lost on unmount), an onboarding flow, runtime response
validation, and any design-system layer beyond the primitives in
`components/ui`.

The screens render placeholder data and their actions are inert unless the
design implied otherwise. Controls without a destination in the designs —
"Continue with Google", Transparency Center, Account Details, Nominee Details,
Account Management, the security controls, the FAQ entries, the Markets filter
button, and the SIP / Earn / More shortcuts on Home — render but do not
navigate. Home's Coin Basket and Expert Picks carousels are presentational; no
basket or leveraged-position feature exists behind them.
