import { type AccountState, accountStore } from '../services/account';
import { useStore } from './useStore';

/** The simulated account: balances, holdings, orders, futures and more. */
export function useAccount(): AccountState {
  return useStore(accountStore);
}
