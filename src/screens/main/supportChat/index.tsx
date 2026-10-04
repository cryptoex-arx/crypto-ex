import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';

import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { Text } from '../../../components/ui/Text';
import { useTheme } from '../../../hooks/useTheme';
import type { AppStackScreenProps } from '../../../navigation/types';
import { formatTime } from '../../../utils/format';
import { styles } from './styles';

interface Message {
  id: string;
  from: 'user' | 'agent';
  text: string;
  at: number;
}

/** Canned answers by keyword until the support desk API exists. */
const REPLIES: readonly { keywords: readonly string[]; text: string }[] = [
  {
    keywords: ['deposit', 'add inr', 'upi'],
    text: 'Deposits: Portfolio → Add INR. Pay from your linked bank account by UPI, IMPS or NEFT. Crypto deposits: Portfolio → Deposit, pick the coin and network.',
  },
  {
    keywords: ['withdraw'],
    text: 'Withdrawals: Portfolio → Withdraw. INR goes over IMPS (₹9 fee). For crypto, double-check the network — sending on the wrong network loses the funds.',
  },
  {
    keywords: ['kyc', 'pan', 'aadhaar', 'verify'],
    text: 'KYC takes a few seconds once you submit PAN, Aadhaar OTP, a selfie and a bank account. Start it from Account → KYC & Verification.',
  },
  {
    keywords: ['fee', 'charge'],
    text: 'Spot trading costs 0.2% per side, futures 0.05% of position size. Full details are under Account → Fee Structure.',
  },
  {
    keywords: ['order', 'cancel', 'limit'],
    text: 'Open orders are under Account → Coin Orders. Tap one to see its details or cancel it; cancelling releases the locked funds at once.',
  },
  {
    keywords: ['tds', 'tax'],
    text: '1% TDS applies to crypto sales. Your yearly summary is in Account → Tax Reports.',
  },
  {
    keywords: ['2fa', 'authenticator', 'security', 'pin'],
    text: 'Turn on Google Authenticator and an app PIN under Account → Security. We recommend the withdrawal whitelist too.',
  },
];

const FALLBACK =
  'Thanks! I have passed this to a specialist, who will reply here shortly. Is there anything else I can help with?';

const REPLY_DELAY_MS = 1200;

function replyTo(text: string): string {
  const lower = text.toLowerCase();
  return (
    REPLIES.find(reply => reply.keywords.some(word => lower.includes(word)))
      ?.text ?? FALLBACK
  );
}

let nextId = 0;
function message(from: Message['from'], text: string): Message {
  nextId += 1;
  return { id: String(nextId), from, text, at: Date.now() };
}

/** Support chat with an automatic first-line assistant. */
export function SupportChatScreen({
  navigation,
}: AppStackScreenProps<'SupportChat'>) {
  const theme = useTheme();
  const listRef = useRef<FlatList<Message>>(null);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    message(
      'agent',
      'Hi! I am Riya from CryptoEx support. Ask me about deposits, withdrawals, KYC, fees or orders.',
    ),
  ]);
  const pendingReply = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(pendingReply.current), []);

  const onSend = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    setDraft('');
    setMessages(current => [...current, message('user', text)]);
    setTyping(true);
    clearTimeout(pendingReply.current);
    pendingReply.current = setTimeout(() => {
      setTyping(false);
      setMessages(current => [...current, message('agent', replyTo(text))]);
    }, REPLY_DELAY_MS);
  };

  return (
    <Screen>
      <ScreenHeader title="Live Chat" onBack={navigation.goBack} />
      <KeyboardAvoidingView
        style={styles.grow}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.content}
          onContentSizeChange={() => listRef.current?.scrollToEnd()}
          renderItem={({ item }) => {
            const mine = item.from === 'user';
            return (
              <View
                style={[
                  styles.bubble,
                  mine ? styles.mine : styles.theirs,
                  {
                    backgroundColor: mine
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text variant="body" tone={mine ? 'inverted' : 'default'}>
                  {item.text}
                </Text>
                <Text
                  variant="caption"
                  tone={mine ? 'inverted' : 'muted'}
                  style={styles.time}
                >
                  {formatTime(item.at).slice(0, 5)}
                </Text>
              </View>
            );
          }}
          ListFooterComponent={
            typing ? (
              <Text variant="caption" tone="muted" style={styles.typing}>
                Riya is typing…
              </Text>
            ) : null
          }
        />
        <View
          style={[
            styles.composer,
            {
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <TextInput
            accessibilityLabel="Message"
            placeholder="Type your message"
            placeholderTextColor={theme.colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={onSend}
            returnKeyType="send"
            style={[
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            disabled={draft.trim() === ''}
            onPress={onSend}
            style={[
              styles.send,
              { backgroundColor: theme.colors.primary },
              draft.trim() === '' && styles.disabled,
            ]}
          >
            <Icon name="send" size={18} color={theme.colors.textInverted} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
