import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme';
import { Button, type ButtonVariant } from '../ui/Button';
import { Text } from '../ui/Text';
import { type DetailRow, DetailRows } from './DetailRows';

export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  rows?: readonly DetailRow[];
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  /** Shown in red above the buttons, e.g. a rejection from the engine. */
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Extra content between the rows and the buttons, e.g. a 2FA field. */
  children?: ReactNode;
}

/** Bottom sheet that shows what is about to happen and asks to confirm. */
export function ConfirmSheet({
  visible,
  title,
  rows,
  confirmLabel,
  confirmVariant = 'primary',
  error,
  onConfirm,
  onCancel,
  children,
}: ConfirmSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityLabel="Close"
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
              paddingBottom: 16 + insets.bottom,
            },
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: theme.colors.border }]}
          />
          <Text variant="subtitle" style={styles.title}>
            {title}
          </Text>
          {rows ? <DetailRows rows={rows} /> : null}
          {children}
          {error ? (
            <Text variant="caption" tone="danger" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="secondary"
              style={styles.action}
              onPress={onCancel}
            />
            <Button
              label={confirmLabel}
              variant={confirmVariant}
              style={styles.action}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  error: {
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  action: {
    flex: 1,
    minHeight: 46,
  },
});
