import { Pressable, ScrollView, View } from 'react-native';

import { CoinAvatar } from '../../../components/common/CoinAvatar';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { BASKETS } from '../../../constants/baskets';
import { findCoin } from '../../../constants/markets';
import { useLiveQuotes } from '../../../hooks/useLiveQuotes';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { basketChange } from '../../../services/account';
import { formatInr, formatPercent } from '../../../utils/format';
import { styles } from './styles';

/** Every curated coin basket with its live 24h change. */
export function BasketsScreen({ navigation }: AppStackScreenProps<'Baskets'>) {
  const theme = useTheme();
  const quotes = useLiveQuotes();

  return (
    <Screen>
      <ScreenHeader title="Coin Baskets" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text tone="muted">
          Buy a themed set of coins in one go, split by weight.
        </Text>
        {BASKETS.map(basket => {
          const change = basketChange(basket.id, quotes);
          return (
            <Pressable
              key={basket.id}
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('BasketDetail', { basketId: basket.id })
              }
            >
              <Card padded>
                <View style={styles.row}>
                  <View style={styles.grow}>
                    <Text variant="subtitle" style={styles.bold}>
                      {basket.name}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {basket.description}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-right"
                    size={16}
                    color={theme.colors.textMuted}
                  />
                </View>
                <View style={[styles.row, styles.footer]}>
                  <View style={styles.avatars}>
                    {basket.components.map(component => {
                      const coin = findCoin(component.coinId);
                      return (
                        <View key={component.coinId} style={styles.avatar}>
                          <CoinAvatar
                            symbol={coin?.symbol ?? ''}
                            color={coin?.color}
                            size={24}
                          />
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.grow} />
                  <Text
                    variant="label"
                    tone={change >= 0 ? 'success' : 'danger'}
                  >
                    {formatPercent(change)} 24h
                  </Text>
                  <Text variant="caption" tone="muted">
                    · Min {formatInr(basket.minInvestment)}
                  </Text>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
