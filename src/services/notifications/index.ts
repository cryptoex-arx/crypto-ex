import { createPersistentStore } from '../storage/persistentStore';

export type NotificationKind = 'trade' | 'funds' | 'alert' | 'account';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

export interface NotificationsState {
  items: readonly AppNotification[];
}

/** Oldest notifications beyond this are dropped. */
const MAX_ITEMS = 50;

export const notificationsStore = createPersistentStore<NotificationsState>(
  'cryptoex/notifications/v1',
  {
    items: [
      {
        id: 'welcome',
        kind: 'account',
        title: 'Welcome to CryptoEx',
        body: 'Complete your KYC to start depositing and withdrawing INR.',
        createdAt: Date.now(),
        read: false,
      },
    ],
  },
);

/** Adds an in-app notification; the toast shows it while the app is open. */
export function notify(kind: NotificationKind, title: string, body: string) {
  const item: AppNotification = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    kind,
    title,
    body,
    createdAt: Date.now(),
    read: false,
  };
  notificationsStore.update(state => ({
    items: [item, ...state.items].slice(0, MAX_ITEMS),
  }));
}

export function markAllNotificationsRead() {
  notificationsStore.update(state =>
    state.items.some(item => !item.read)
      ? { items: state.items.map(item => ({ ...item, read: true })) }
      : state,
  );
}

export function clearNotifications() {
  notificationsStore.set({ items: [] });
}

export function unreadCount(state: NotificationsState): number {
  return state.items.filter(item => !item.read).length;
}
