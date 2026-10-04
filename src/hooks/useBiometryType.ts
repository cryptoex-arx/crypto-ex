import { useEffect, useState } from 'react';

import { type BiometryType, getBiometryType } from '../services/security';

/**
 * The device's biometric sensor (Face ID, fingerprint…), or `undefined` while
 * loading and on devices with none enrolled.
 */
export function useBiometryType(): BiometryType | undefined {
  const [type, setType] = useState<BiometryType>();

  useEffect(() => {
    let active = true;
    getBiometryType().then(next => {
      if (active) {
        setType(next);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return type;
}
