import type { CollectorProfile, Wallet } from '../types';
import { api } from './api';

export async function getProfile(): Promise<CollectorProfile> {
  const response = await api.get<CollectorProfile>('/profile');
  return response.data;
}

export async function updateProfile(profile: CollectorProfile): Promise<CollectorProfile> {
  const response = await api.put<CollectorProfile>('/profile', profile);
  return response.data;
}

export async function getWallets(): Promise<Wallet[]> {
  const response = await api.get<Wallet[]>('/wallets');
  return response.data;
}

export async function createWallet(wallet: Omit<Wallet, 'id'>): Promise<Wallet[]> {
  const response = await api.post<Wallet[]>('/wallets', wallet);
  return response.data;
}
