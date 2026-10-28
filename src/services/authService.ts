import type { Session } from '../types';
import { api } from './api';

export async function createSession(email: string, password: string): Promise<Session> {
  const response = await api.post<Session>('/session', { email, password });
  return response.data;
}

export async function getSession(): Promise<Session | null> {
  const response = await api.get<Session | null>('/session');
  return response.data;
}

export async function deleteSession(): Promise<void> {
  await api.delete('/session');
}
