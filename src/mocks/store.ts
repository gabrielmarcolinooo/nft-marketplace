import type { CartItem, CollectorProfile, NFT, Order, Session, Wallet } from '../types';
import { initialNFTs } from './db';

const STORAGE_KEY = 'kurio:mock-state:v2';

export interface MockState {
  nfts: NFT[];
  session: Session | null;
  cart: CartItem[];
  profile: CollectorProfile;
  wallets: Wallet[];
  orders: Order[];
  idempotency: Record<string, string>;
}

const initialState: MockState = {
  nfts: initialNFTs.map((nft, index) => ({ ...nft, network: index % 3 === 0 ? 'Ethereum' : index % 3 === 1 ? 'Polygon' : 'Solana' })),
  session: null,
  cart: [],
  profile: { displayName: '', username: '', email: '', ensName: '', avatar: '', walletNickname: '' },
  wallets: [],
  orders: [],
  idempotency: {},
};

function cloneInitialState(): MockState {
  return structuredClone(initialState);
}

export function readMockState(): MockState {
  const rawState = localStorage.getItem(STORAGE_KEY);
  if (!rawState) return cloneInitialState();

  try {
    const stored = JSON.parse(rawState) as MockState;
    const base = cloneInitialState();
    const nfts = base.nfts.map((nft) => ({ ...nft, ...stored.nfts?.find((item) => item.id === nft.id) }));
    const cart = (stored.cart ?? []).map((item) => ({
      ...item,
      selectedEdition: item.selectedEdition ?? item.nft.edition,
      nft: { ...nfts.find((nft) => nft.id === item.nft.id), ...item.nft } as NFT,
    }));
    const profile = { ...base.profile, ...stored.profile };
    return { ...base, ...stored, nfts, cart, profile };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return cloneInitialState();
  }
}

export function writeMockState(state: MockState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function updateMockState(update: (state: MockState) => void) {
  const state = readMockState();
  update(state);
  return writeMockState(state);
}
