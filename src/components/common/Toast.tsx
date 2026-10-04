import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { notificationsStore } from '../../services/notifications';
import { fonts } from '../../theme';
import { Text } from '../ui/Text';

type ToastTone = 'default' | 'success' | 'danger';

interface ToastMessage {
  title: string;
  body?: string;
  tone: ToastTone;
}

const VISIBLE_MS = 3200;
const listeners = new Set<(message: ToastMessage) => void>();

/** Shows a short message at the top of the screen, over everything. */
export function showToast(
  title: string,
  tone: ToastTone = 'default',
  body?: string,
) {
  listeners.forEach(listener => listener({ title, body, tone }));
}

/**
 * Mounted once at the root. Shows `showToast` calls and every notification
 * that arrives while the app is open (fills, deposits, alerts).
 */
export function ToastHost() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<ToastMessage>();
  const lastSeen = useRef(notificationsStore.get().items[0]?.id);

  useEffect(() => {
    const onMessage = (next: ToastMessage) => setMessage(next);
    listeners.add(onMessage);

    const unsubscribe = notificationsStore.subscribe(() => {
      const latest = notificationsStore.get().items[0];
      if (!latest || latest.id === lastSeen.current) {
        return;
      }
      lastSeen.current = latest.id;
      if (!latest.read) {
        setMessage({ title: latest.title, body: latest.body, tone: 'default' });
      }
    });

    return () => {
      listeners.delete(onMessage);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(() => setMessage(undefined), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) {
    return null;
  }

  const accent =
    message.tone === 'success'
      ? theme.colors.success
      : message.tone === 'danger'
      ? theme.colors.danger
      : theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="alert"
      onPress={() => setMessage(undefined)}
      style={[
        styles.toast,
        {
          top: insets.top + 8,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderLeftColor: accent,
        },
      ]}
    >
      <Text variant="label" style={styles.title}>
        {message.title}
      </Text>
      {message.body ? (
        <Text variant="caption" tone="muted" style={styles.body}>
          {message.body}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontFamily: fonts.bold,
  },
  body: {
    marginTop: 2,
  },
});
