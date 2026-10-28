import type { CartItem, NFT, Order, Quote } from '../types';
import { api } from './api';

export async function toggleFavorite(id: NFT['id']): Promise<NFT> {
  const response = await api.put<NFT>(`/nfts/${encodeURIComponent(id)}/favorite`);
  return response.data;
}

export async function getCart(): Promise<CartItem[]> {
  const response = await api.get<CartItem[]>('/cart');
  return response.data;
}

export async function addToCart(nftId: NFT['id'], quantity: number, selectedEdition: string): Promise<CartItem[]> {
  const response = await api.post<CartItem[]>('/cart', { nftId, quantity, selectedEdition });
  return response.data;
}

export async function updateCartQuantity(nftId: NFT['id'], quantity: number): Promise<CartItem[]> {
  const response = await api.patch<CartItem[]>(`/cart/${encodeURIComponent(nftId)}`, { quantity });
  return response.data;
}

export async function removeFromCart(nftId: NFT['id']): Promise<CartItem[]> {
  const response = await api.delete<CartItem[]>(`/cart/${encodeURIComponent(nftId)}`);
  return response.data;
}

export async function clearCart(): Promise<CartItem[]> {
  const response = await api.delete<CartItem[]>('/cart');
  return response.data;
}

export async function getQuote(coupon?: string): Promise<Quote> {
  const response = await api.post<Quote>('/quote', { coupon });
  return response.data;
}

interface CreateOrderInput {
  coupon?: string;
  walletLabel: string;
}

export async function createOrder(input: CreateOrderInput, idempotencyKey = crypto.randomUUID()): Promise<Order> {
  const response = await api.post<Order>('/orders', input, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return response.data;
}
