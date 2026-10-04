import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  PixelRatio,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  type AdditionalChartSeriesOptions,
  type ChartPaneOptions,
  type ChartResolution,
  TradingCharts,
  TradingChartsView,
} from 'react-native-trading-charts';

import { findCoin } from '../../constants/markets';
import { useTheme } from '../../hooks/useTheme';
import {
  getCandleHistory,
  getQuotes,
  subscribeToTrades,
} from '../../services/market';
import { fonts } from '../../theme';
import { Chip } from '../ui/Chip';
import { Icon } from '../ui/Icon';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';

interface Timeframe {
  label: string;
  ms: number;
  resolution: ChartResolution;
}

const TIMEFRAMES: readonly Timeframe[] = [
  { label: '1m', ms: 60_000, resolution: { unit: 'minute' } },
  { label: '15m', ms: 900_000, resolution: { unit: 'minute', multiplier: 15 } },
  {
    label: '30m',
    ms: 1_800_000,
    resolution: { unit: 'minute', multiplier: 30 },
  },
  { label: '1h', ms: 3_600_000, resolution: { unit: 'hour' } },
  { label: '4h', ms: 14_400_000, resolution: { unit: 'hour', multiplier: 4 } },
  { label: '1D', ms: 86_400_000, resolution: { unit: 'day' } },
];

type ChartType = 'candlestick' | 'line' | 'area';

const CHART_TYPES: readonly { value: ChartType; label: string }[] = [
  { value: 'candlestick', label: 'Candles' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
];

type Indicator = 'ma' | 'ema' | 'rsi' | 'macd';

const INDICATORS: readonly { value: Indicator; label: string }[] = [
  { value: 'ma', label: 'MA 20' },
  { value: 'ema', label: 'EMA 50' },
  { value: 'rsi', label: 'RSI 14' },
  { value: 'macd', label: 'MACD' },
];

/** Indicator lines need to stand apart from the up/down candle colours. */
const MA_COLOR = '#2E90F5';
const EMA_COLOR = '#F5A524';
const RSI_COLOR = '#8B5CF6';

/** Pane heights in dp; also used as the panes' relative weights. */
const PANE_HEIGHT = { main: 210, volume: 70, oscillator: 110 } as const;

const OSCILLATOR_FORMAT = {
  type: 'price',
  precision: 2,
  useGrouping: false,
} as const;

/** Price-axis label size, pinned so the lane width can be derived from it. */
const AXIS_FONT_SIZE = 10;
/** Average digit width as a share of the font size, rounded up. */
const AXIS_CHAR_WIDTH = 0.6;
/** Space around a label inside the lane, enough for the price badge's pill. */
const AXIS_PADDING = 14;

export interface CoinChartProps {
  coinId: string;
}

/**
 * Live trading chart for one coin: history from the simulated feed, then
 * every feed trade aggregated natively into the open candle. Chart type and
 * indicators sit behind the settings toggle; the expand button reopens the
 * same chart, settings included, in a full-screen modal.
 */
export function CoinChart({ coinId }: CoinChartProps) {
  const theme = useTheme();
  const { colors } = theme;
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[0]);
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [indicators, setIndicators] = useState<readonly Indicator[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // A new id per timeframe (and per inline / full-screen view) remounts the
  // native view with a clean candle store.
  const chartId =
    coinId + '-' + timeframe.label + (expanded ? '-fullscreen' : '');

  useEffect(() => {
    TradingCharts.setHistory(chartId, getCandleHistory(coinId, timeframe.ms));

    return subscribeToTrades((id, trade) => {
      if (id === coinId) {
        TradingCharts.updateTrade(chartId, trade);
      }
    });
  }, [chartId, coinId, timeframe.ms]);

  // Read once per coin: the axis precision and width should not flip as
  // prices tick.
  const { priceFormat, axisWidth } = useMemo(() => {
    const price = getQuotes()[coinId]?.price ?? 0;
    const large = price >= 1000;
    const precision = large ? 0 : 2;
    // A fixed lane left a blank strip beside short labels such as ₹7.95, so
    // size it to this coin's label plus one digit of headroom.
    const label =
      '₹' +
      price.toLocaleString('en-IN', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      });
    const charWidth =
      AXIS_FONT_SIZE * AXIS_CHAR_WIDTH * PixelRatio.getFontScale();
    return {
      priceFormat: {
        type: 'price',
        precision,
        minMove: large ? 1 : 0.01,
        currencySymbol: '₹',
        locale: 'en-IN',
      } as const,
      axisWidth: Math.ceil((label.length + 1) * charWidth) + AXIS_PADDING,
    };
  }, [coinId]);

  const chartTheme = useMemo(
    () => ({
      backgroundColor: colors.background,
      gridColor: colors.border,
      axisTextColor: colors.textMuted,
      upColor: colors.success,
      downColor: colors.danger,
      crosshairColor: colors.textMuted,
      tooltipBackgroundColor: colors.surface,
      tooltipTextColor: colors.text,
    }),
    [colors],
  );

  const panes = useMemo(() => {
    const list: ChartPaneOptions[] = [
      {
        paneId: 'main',
        heightWeight: PANE_HEIGHT.main,
        priceScale: { priceScaleId: 'main' },
      },
      {
        paneId: 'volume',
        heightWeight: PANE_HEIGHT.volume,
        minHeight: 56,
        priceScale: {
          priceScaleId: 'volume',
          valueFormat: { type: 'volume', precision: 1 },
        },
      },
    ];
    for (const oscillator of ['rsi', 'macd'] as const) {
      if (indicators.includes(oscillator)) {
        list.push({
          paneId: oscillator,
          heightWeight: PANE_HEIGHT.oscillator,
          minHeight: 96,
          priceScale: {
            priceScaleId: oscillator,
            valueFormat: OSCILLATOR_FORMAT,
          },
        });
      }
    }
    return list;
  }, [indicators]);

  const additionalSeries = useMemo(() => {
    const list: AdditionalChartSeriesOptions[] = [
      {
        seriesId: 'volume',
        type: 'histogram',
        paneId: 'volume',
        priceScaleId: 'volume',
        source: { type: 'ohlcvVolume', seriesId: 'main' },
        appearance: {
          upColor: colors.success + '80',
          downColor: colors.danger + '80',
        },
      },
    ];
    if (indicators.includes('ma')) {
      list.push({
        seriesId: 'ma',
        type: 'line',
        paneId: 'main',
        priceScaleId: 'main',
        source: { type: 'ohlcvSma', seriesId: 'main', period: 20 },
        appearance: { color: MA_COLOR, width: 1.5 },
      });
    }
    if (indicators.includes('ema')) {
      list.push({
        seriesId: 'ema',
        type: 'line',
        paneId: 'main',
        priceScaleId: 'main',
        source: { type: 'ohlcvEma', seriesId: 'main', period: 50 },
        appearance: { color: EMA_COLOR, width: 1.5 },
      });
    }
    if (indicators.includes('rsi')) {
      list.push({
        seriesId: 'rsi',
        type: 'line',
        paneId: 'rsi',
        priceScaleId: 'rsi',
        source: { type: 'ohlcvRsi', seriesId: 'main', period: 14 },
        appearance: {
          color: RSI_COLOR,
          width: 1.5,
          textColor: colors.textMuted,
          levelLineColor: RSI_COLOR + '80',
          bandColor: RSI_COLOR + '14',
        },
      });
    }
    if (indicators.includes('macd')) {
      list.push({
        seriesId: 'macd',
        type: 'macd',
        paneId: 'macd',
        priceScaleId: 'macd',
        source: { type: 'ohlcvMacd', seriesId: 'main' },
        appearance: {
          macdLine: { color: MA_COLOR, width: 1.5 },
          signalLine: { color: EMA_COLOR, width: 1.5 },
          textColor: colors.textMuted,
          zeroLineColor: colors.textMuted + '66',
        },
      });
    }
    return list;
  }, [colors, indicators]);

  const toggleIndicator = (indicator: Indicator) =>
    setIndicators(current =>
      current.includes(indicator)
        ? current.filter(item => item !== indicator)
        : [...current, indicator],
    );

  const height = panes.reduce((total, pane) => total + pane.heightWeight, 0);
  const coin = findCoin(coinId);

  const toolbar = (
    <View style={styles.toolbar}>
      <View style={styles.timeframes}>
        {TIMEFRAMES.map(option => {
          const selected = option.label === timeframe.label;
          return (
            <Pressable
              key={option.label}
              accessibilityRole="button"
              accessibilityLabel={option.label + ' candles'}
              accessibilityState={{ selected }}
              hitSlop={6}
              onPress={() => setTimeframe(option)}
            >
              <Text
                variant="label"
                tone={selected ? 'default' : 'muted'}
                style={selected && styles.selectedTimeframe}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Chart type and indicators"
        accessibilityState={{ expanded: settingsOpen }}
        hitSlop={8}
        onPress={() => setSettingsOpen(open => !open)}
      >
        <Icon
          name="sliders"
          size={16}
          color={
            settingsOpen || indicators.length > 0
              ? colors.primary
              : colors.textMuted
          }
        />
      </Pressable>
      {expanded ? null : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Full-screen chart"
          hitSlop={8}
          onPress={() => setExpanded(true)}
        >
          <Icon name="maximize" size={16} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );

  const settings = settingsOpen ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.settings}
    >
      {CHART_TYPES.map(option => (
        <Chip
          key={option.value}
          label={option.label}
          selected={option.value === chartType}
          onPress={() => setChartType(option.value)}
        />
      ))}
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      {INDICATORS.map(option => (
        <Chip
          key={option.value}
          label={option.label}
          icon={indicators.includes(option.value) ? 'check' : undefined}
          selected={indicators.includes(option.value)}
          onPress={() => toggleIndicator(option.value)}
        />
      ))}
    </ScrollView>
  ) : null;

  const chart = (
    <TradingChartsView
      key={chartId}
      chartId={chartId}
      style={expanded ? styles.fill : { height }}
      resolution={timeframe.resolution}
      initialVisibleCount={80}
      series={{ type: chartType }}
      panes={panes}
      additionalSeries={additionalSeries}
      theme={chartTheme}
      appearance={{
        candles: { radius: 1 },
        yAxis: { text: { fontSize: AXIS_FONT_SIZE } },
      }}
      xAxis={{ locale: 'en-IN', timeZone: 'Asia/Kolkata' }}
      yAxis={{ width: axisWidth, valueFormat: priceFormat }}
      crosshair={{
        tooltipFields: ['open', 'high', 'low', 'close', 'volume'],
      }}
      accessibilityLabel="Price chart"
    />
  );

  return (
    <View>
      {toolbar}
      {settings}
      {/* Keeps the page layout steady while the chart is full screen. */}
      {expanded ? <View style={{ height }} /> : chart}

      <Modal
        visible={expanded}
        animationType="slide"
        onRequestClose={() => setExpanded(false)}
      >
        <Screen>
          <View style={styles.fullscreenHeader}>
            <Text variant="subtitle" style={styles.fullscreenTitle}>
              {coin ? coin.symbol + '/INR' : ''}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close full-screen chart"
              hitSlop={12}
              onPress={() => setExpanded(false)}
            >
              <Icon name="x" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
          {toolbar}
          {settings}
          {expanded ? chart : null}
        </Screen>
      </Modal>
    </View>
  );
}

/**
 * The chart runs edge to edge, so its controls carry the screen gutter
 * themselves instead of inheriting it from the page.
 */
const GUTTER = 16;

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: GUTTER,
    paddingBottom: 10,
  },
  timeframes: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  selectedTimeframe: {
    fontFamily: fonts.bold,
  },
  settings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: GUTTER,
    paddingBottom: 10,
  },
  separator: {
    width: 1,
    height: 18,
    marginHorizontal: 2,
  },
  fill: {
    flex: 1,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GUTTER,
    paddingVertical: 10,
  },
  fullscreenTitle: {
    fontFamily: fonts.bold,
  },
});
