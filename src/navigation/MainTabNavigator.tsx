import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Icon } from '../components/ui/Icon';
import { useTheme } from '../hooks/useTheme';
import { AccountScreen } from '../screens/main/account';
import { FuturesScreen } from '../screens/main/futures';
import { HomeScreen } from '../screens/main/home';
import { MarketsScreen } from '../screens/main/markets';
import { PortfolioScreen } from '../screens/main/portfolio';
import { fonts } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_ICON_SIZE = 20;

/** Defined once at module scope so the tab bar never remounts its icons. */
const TAB_BAR_ICONS: Record<
  keyof MainTabParamList,
  (props: { color: string }) => React.ReactElement
> = {
  Home: ({ color }) => (
    <Icon name="home" size={TAB_BAR_ICON_SIZE} color={color} />
  ),
  Markets: ({ color }) => (
    <Icon name="bar-chart" size={TAB_BAR_ICON_SIZE} color={color} />
  ),
  Futures: ({ color }) => (
    <Icon name="trending-up" size={TAB_BAR_ICON_SIZE} color={color} />
  ),
  Portfolio: ({ color }) => (
    <Icon name="pie-chart" size={TAB_BAR_ICON_SIZE} color={color} />
  ),
  Account: ({ color }) => (
    <Icon name="user" size={TAB_BAR_ICON_SIZE} color={color} />
  ),
};

const LABEL_STYLE = { fontSize: 10, fontFamily: fonts.semiBold } as const;

export function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: LABEL_STYLE,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
        tabBarIcon: TAB_BAR_ICONS[route.name],
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Markets" component={MarketsScreen} />
      <Tab.Screen name="Futures" component={FuturesScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
