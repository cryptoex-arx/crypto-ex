import type { FeatherIconName } from '@react-native-vector-icons/feather';
import type { IoniconsIconName } from '@react-native-vector-icons/ionicons';

type IconSource =
  | { readonly family: 'feather'; readonly glyph: FeatherIconName }
  | { readonly family: 'ionicons'; readonly glyph: IoniconsIconName };

/**
 * App-level icon names mapped onto react-native-vector-icons glyphs. Feather is
 * the house set; Ionicons only covers the few glyphs Feather has no equivalent
 * for. Keeping the names app-level means screens never reference a font family.
 */
export const iconSources = {
  activity: { family: 'feather', glyph: 'activity' },
  'alert-circle': { family: 'feather', glyph: 'alert-circle' },
  'arrow-down': { family: 'feather', glyph: 'arrow-down' },
  'arrow-up': { family: 'feather', glyph: 'arrow-up' },
  'bar-chart': { family: 'feather', glyph: 'bar-chart' },
  bell: { family: 'feather', glyph: 'bell' },
  camera: { family: 'feather', glyph: 'camera' },
  check: { family: 'feather', glyph: 'check' },
  'check-circle': { family: 'feather', glyph: 'check-circle' },
  'chevron-down': { family: 'feather', glyph: 'chevron-down' },
  'chevron-left': { family: 'feather', glyph: 'chevron-left' },
  'chevron-right': { family: 'feather', glyph: 'chevron-right' },
  clock: { family: 'feather', glyph: 'clock' },
  copy: { family: 'feather', glyph: 'copy' },
  'credit-card': { family: 'feather', glyph: 'credit-card' },
  database: { family: 'feather', glyph: 'database' },
  'dollar-sign': { family: 'feather', glyph: 'dollar-sign' },
  download: { family: 'feather', glyph: 'download' },
  external: { family: 'feather', glyph: 'external-link' },
  eye: { family: 'feather', glyph: 'eye' },
  'file-text': { family: 'feather', glyph: 'file-text' },
  filter: { family: 'feather', glyph: 'filter' },
  fingerprint: { family: 'ionicons', glyph: 'finger-print-outline' },
  gift: { family: 'feather', glyph: 'gift' },
  hash: { family: 'feather', glyph: 'hash' },
  history: { family: 'feather', glyph: 'rotate-ccw' },
  home: { family: 'feather', glyph: 'home' },
  info: { family: 'feather', glyph: 'info' },
  key: { family: 'feather', glyph: 'key' },
  lock: { family: 'feather', glyph: 'lock' },
  'log-out': { family: 'feather', glyph: 'log-out' },
  mail: { family: 'feather', glyph: 'mail' },
  'message-circle': { family: 'feather', glyph: 'message-circle' },
  monitor: { family: 'feather', glyph: 'monitor' },
  moon: { family: 'feather', glyph: 'moon' },
  more: { family: 'feather', glyph: 'more-horizontal' },
  palette: { family: 'ionicons', glyph: 'color-palette-outline' },
  phone: { family: 'feather', glyph: 'phone' },
  'pie-chart': { family: 'feather', glyph: 'pie-chart' },
  plus: { family: 'feather', glyph: 'plus' },
  search: { family: 'feather', glyph: 'search' },
  send: { family: 'feather', glyph: 'send' },
  settings: { family: 'feather', glyph: 'settings' },
  shield: { family: 'feather', glyph: 'shield' },
  'shield-check': { family: 'ionicons', glyph: 'shield-checkmark-outline' },
  'shopping-cart': { family: 'feather', glyph: 'shopping-cart' },
  sliders: { family: 'feather', glyph: 'sliders' },
  smartphone: { family: 'feather', glyph: 'smartphone' },
  star: { family: 'feather', glyph: 'star' },
  sun: { family: 'feather', glyph: 'sun' },
  tag: { family: 'feather', glyph: 'tag' },
  transfer: { family: 'feather', glyph: 'repeat' },
  trash: { family: 'feather', glyph: 'trash-2' },
  'trending-down': { family: 'feather', glyph: 'trending-down' },
  'trending-up': { family: 'feather', glyph: 'trending-up' },
  user: { family: 'feather', glyph: 'user' },
  users: { family: 'feather', glyph: 'users' },
  zap: { family: 'feather', glyph: 'zap' },
} as const satisfies Record<string, IconSource>;

export type IconName = keyof typeof iconSources;
