import { Alert, ScrollView } from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ListRow } from '../../../components/ui/ListRow';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useStore } from '../../../hooks/useStore';
import type { AppStackScreenProps } from '../../../navigation/types';
import { removeDevice, securityStore } from '../../../services/security';
import { formatDateTime } from '../../../utils/format';
import { styles } from './styles';

/** Signed-in devices, with sign-out for the others, and recent activity. */
export function AccountActivityScreen({
  navigation,
}: AppStackScreenProps<'AccountActivity'>) {
  const { devices, activity } = useStore(securityStore);

  const onRemove = (id: string, name: string) =>
    Alert.alert('Sign out ' + name + '?', 'It will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => removeDevice(id),
      },
    ]);

  return (
    <Screen>
      <ScreenHeader title="Devices & Activity" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          DEVICES
        </Text>
        <Card>
          {devices.map((device, index) => (
            <ListRow
              key={device.id}
              icon={device.current ? 'smartphone' : 'monitor'}
              title={device.name}
              subtitle={
                device.location +
                ' · ' +
                (device.current
                  ? 'Active now'
                  : 'Last active ' + formatDateTime(device.lastActiveAt))
              }
              divider={index < devices.length - 1}
              trailing={
                device.current ? (
                  <Badge label="This device" tone="success" />
                ) : (
                  <Button
                    label="Sign out"
                    variant="secondary"
                    onPress={() => onRemove(device.id, device.name)}
                  />
                )
              }
            />
          ))}
        </Card>

        <Text variant="overline" tone="muted" style={styles.sectionLabel}>
          RECENT ACTIVITY
        </Text>
        <Card>
          {activity.map((event, index) => (
            <ListRow
              key={event.id}
              icon="activity"
              title={event.title}
              subtitle={event.detail + ' · ' + formatDateTime(event.at)}
              divider={index < activity.length - 1}
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
