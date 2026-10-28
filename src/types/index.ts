export interface NFT {
  id: string;
  title: string;
  description: string;
  image: string;
  priceEth: string;
  edition: string;
  availableQuantity: number;
  category: string;
  isFavorite: boolean;
  network?: 'Ethereum' | 'Polygon' | 'Solana';
  artworkVariant?: 0 | 1 | 2 | 3;
  tokenId?: string;
  collection?: string;
  attributes?: string[];
  contractAddress?: string;
  royaltyPercentage?: number;
  reviewCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface CartItem {
  nft: NFT;
  quantity: number;
  selectedEdition: string;
}

export interface Session {
  user: User;
  token: string;
}

export interface CollectorProfile {
  displayName: string;
  username: string;
  email: string;
  ensName: string;
  avatar: string;
  walletNickname: string;
}

export interface Wallet {
  id: string;
  label: string;
  address: string;
  network: 'Ethereum' | 'Polygon' | 'Solana';
  provider: 'MetaMask' | 'WalletConnect' | 'Coinbase Wallet';
  isPrimary: boolean;
}

export interface Quote {
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  coupon?: string;
  expiresAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Order {
  id: string;
  userId: User['id'];
  items: CartItem[];
  transactionHash: string;
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  coupon?: string;
  walletLabel: string;
  status: OrderStatus;
  createdAt: string;
}
