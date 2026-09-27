# cryptoEx

A React Native (CLI, TypeScript) application. This repository currently contains
the **project foundation only**: architecture, tooling, navigation skeleton,
theme, and shared UI primitives. No application features are implemented yet.

## Prerequisites

- Node.js `>= 22.11.0` and npm
- JDK 17 and the Android SDK (`ANDROID_HOME` configured) for Android builds
- Xcode + CocoaPods (macOS only) for iOS builds
- Follow the React Native
  [environment setup guide](https://reactnative.dev/docs/set-up-your-environment)
  for the "React Native CLI" path

## Installation

```bash
npm install
```

Create your local environment file (see [Environment](#environment)):

```bash
cp .env.example .env
```

iOS only, from a macOS machine:

```bash
bundle install && bundle exec pod install --project-directory=ios
```

## Running the app

Start Metro in one terminal:

```bash
npm start
```

Then build and launch:

```bash
npm run android
```

```bash
npm run ios
```

## Development commands

| Command                | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `npm start`            | Start the Metro dev server                         |
| `npm run start:reset`  | Start Metro with a cleared cache (after env edits) |
| `npm run android`      | Build and run the Android app                      |
| `npm run ios`          | Build and run the iOS app                          |
| `npm run typecheck`    | TypeScript check (`tsc --noEmit`)                  |
| `npm run lint`         | ESLint                                             |
| `npm run lint:fix`     | ESLint with auto-fix                               |
| `npm run format`       | Format with Prettier                               |
| `npm run format:check` | Verify formatting                                  |
| `npm test`             | Jest test suite                                    |
| `npm run validate`     | typecheck + lint + format check + tests            |

## Environment

Environment values are loaded by
[`react-native-dotenv`](https://github.com/goatandsheep/react-native-dotenv)
(a Babel plugin — no native module) and inlined at build time.

| File               | Used when                                    |
| ------------------ | -------------------------------------------- |
| `.env`             | Always, as the base values                   |
| `.env.development` | `NODE_ENV=development` (the default)         |
| `.env.production`  | `NODE_ENV=production` (release bundling)     |
| `.env.example`     | Committed template — documents required keys |

Only `.env.example` is committed; every other `.env*` file is git-ignored.
Never put secrets in `.env.example`, and never read `@env` outside
[`src/config/env.ts`](src/config/env.ts) — that module is the single typed
source of configuration.

Metro caches transformed modules, so after editing an env file restart with
`npm run start:reset`.

## Build commands

Android release APK/bundle (run from the `android` directory):

```bash
./gradlew assembleRelease
```

```bash
./gradlew bundleRelease
```

iOS release builds are produced from Xcode (`Product → Archive`) using the
`Release` configuration.

## Architecture

```text
src/
├── assets/          Static images and fonts
├── components/
│   ├── common/      Composite shared components (error boundary, error/empty states)
│   └── ui/          Presentational primitives (Button, Text, Input, Screen, LoadingIndicator)
├── config/          Environment configuration (the only reader of `@env`)
├── constants/       Shared constant values and user-facing copy
├── hooks/           Reusable hooks
├── navigation/      Navigators and navigation types
├── screens/         Screen components grouped by flow (auth, main)
├── services/api/    HTTP transport and API error normalisation
├── store/           Application-level state (React Context + reducer)
├── theme/           Colors and typography
├── types/           Shared TypeScript types
└── utils/           Generic helpers (logger)
```

See [docs/architecture.md](docs/architecture.md) for the decisions behind this
structure and the conventions to follow when adding features.
