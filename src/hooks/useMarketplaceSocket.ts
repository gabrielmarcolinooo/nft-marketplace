import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { GetNFTsResponse } from '../services/nftService';
import { marketplaceSocket } from '../services/socket';
import type { CartItem, NFT, Order } from '../types';

export function useMarketplaceSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    function handleNFTUpdated(updatedNFT: NFT) {
      queryClient.setQueryData<NFT>(['nft', updatedNFT.id], updatedNFT);
      
      queryClient.setQueriesData<GetNFTsResponse>({ queryKey: ['nfts'] }, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((nft) => nft.id === updatedNFT.id ? { ...nft, ...updatedNFT } : nft),
        };
      });
      
      queryClient.setQueryData<CartItem[]>(['cart'], (current) => current?.map((item) => (
        item.nft.id === updatedNFT.id
          ? { ...item, nft: { ...item.nft, ...updatedNFT } }
          : item
      )));
      // Removido o invalidateQueries(['nfts']) daqui
    }

    function handleOrderUpdated(updatedOrder: Order) {
      queryClient.setQueryData<Order>(['order', updatedOrder.id], updatedOrder);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Mantido apenas a invalidação da lista, já que o item específico foi atualizado acima
    }

    marketplaceSocket.on('nft.updated', handleNFTUpdated);
    marketplaceSocket.on('order.updated', handleOrderUpdated);
    marketplaceSocket.connect();

    return () => {
      marketplaceSocket.off('nft.updated', handleNFTUpdated);
      marketplaceSocket.off('order.updated', handleOrderUpdated);
      marketplaceSocket.disconnect();
    };
  }, [queryClient]);
}