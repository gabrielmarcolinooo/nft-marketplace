import type { NFT } from '../types';
import { api } from './api';

export type NFTSort = 'recent' | 'price-asc' | 'price-desc' | 'title-asc' | 'title-desc';

export interface GetNFTsParams {
  search?: string;
  category?: string;
  sort?: NFTSort;
  page?: number;
  limit?: number;
  network?: string;
  minPrice?: string;
  maxPrice?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetNFTsResponse {
  data: NFT[];
  pagination: Pagination;
}

export async function getNFTs(params: GetNFTsParams = {}): Promise<GetNFTsResponse> {
  const response = await api.get<GetNFTsResponse>('/nfts', { params });
  return response.data;
}

export async function getNFTById(id: NFT['id']): Promise<NFT> {
  const response = await api.get<NFT>(`/nfts/${encodeURIComponent(id)}`);
  return response.data;
}
