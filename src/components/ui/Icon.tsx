import { Feather } from '@react-native-vector-icons/feather';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { useTheme } from '../../hooks/useTheme';
import { type IconName, iconSources } from './icons';

export interface IconProps {
  name: IconName;
  size?: number;
  /** Defaults to the primary colour, which is what most tiles use. */
  color?: string;
}

/** Single entry point for icons, backed by the bundled vector icon fonts. */
export function Icon({ name, size = 20, color }: IconProps) {
  const theme = useTheme();
  const source = iconSources[name];
  const tint = color ?? theme.colors.primary;

  if (source.family === 'ionicons') {
    return <Ionicons name={source.glyph} size={size} color={tint} />;
  }

  return <Feather name={source.glyph} size={size} color={tint} />;
}
