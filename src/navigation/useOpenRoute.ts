import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import type { ParamlessRoute } from './types';

/**
 * Navigates to a detail route picked at runtime from a list, e.g. a settings
 * menu. React Navigation can't type a union of route names, and these routes
 * take no params, so one narrowed signature covers them all.
 */
export function useOpenRoute(): (route: ParamlessRoute) => void {
  const navigation = useNavigation();
  return useCallback(
    route => (navigation.navigate as (name: ParamlessRoute) => void)(route),
    [navigation],
  );
}
