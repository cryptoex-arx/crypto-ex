import { useEffect } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';

import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import type { IconName } from '../../../components/ui/icons';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useStore } from '../../../hooks/useStore';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import {
  clearNotifications,
  markAllNotificationsRead,
  type NotificationKind,
  notificationsStore,
} from '../../../services/notifications';
import { formatDateTime } from '../../../utils/format';
import { styles } from './styles';

const KIND_ICONS: Record<NotificationKind, IconName> = {
  trade: 'trending-up',
  funds: 'credit-card',
  alert: 'bell',
  account: 'user',
};

/** In-app notifications: fills, deposits, alerts and account events. */
export function NotificationsScreen({
  navigation,
}: AppStackScreenProps<'Notifications'>) {
  const theme = useTheme();
  const { items } = useStore(notificationsStore);

  // Opening the list counts as reading everything in it.
  useEffect(() => {
    markAllNotificationsRead();
  }, [items.length]);

  const onClear = () =>
    Alert.alert('Clear all notifications?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearNotifications },
    ]);

  return (
    <Screen>
      <ScreenHeader
        title="Notifications"
        onBack={navigation.goBack}
        trailing={
          items.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClear}
            >
              <Text variant="label" tone="primary">
                Clear
              </Text>
            </Pressable>
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <EmptyState
            title="You're all caught up"
            message="Order fills, deposits and price alerts show up here."
          />
        ) : (
          <Card>
            {items.map((item, index) => (
              <ListRow
                key={item.id}
                icon={KIND_ICONS[item.kind]}
                iconColor={item.read ? undefined : theme.colors.success}
                iconBackground={
                  item.read ? undefined : theme.colors.successSurface
                }
                title={item.title}
                subtitle={item.body + '\n' + formatDateTime(item.createdAt)}
                divider={index < items.length - 1}
              />
            ))}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
