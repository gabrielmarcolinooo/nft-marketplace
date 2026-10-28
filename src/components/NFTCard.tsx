import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Heart, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { addToCart, toggleFavorite as toggleFavoriteRequest } from '../services/marketplaceService';
import type { GetNFTsResponse } from '../services/nftService';
import type { NFT } from '../types';
import { KurioArtwork } from './KurioArtwork';

interface NFTCardProps {
  nft: NFT;
  onBuy?: (nft: NFT) => void;
  onToggleFavorite?: (nft: NFT, isFavorite: boolean) => void;
}

export function NFTCard({ nft, onBuy, onToggleFavorite }: NFTCardProps) {
  const [favoriteError, setFavoriteError] = useState(false);
  const queryClient = useQueryClient();
  const isFavorite = nft.isFavorite;

  useEffect(() => {
    if (!favoriteError) return;
    const timer = window.setTimeout(() => setFavoriteError(false), 4500);
    return () => window.clearTimeout(timer);
  }, [favoriteError]);

  const cartMutation = useMutation({
    mutationFn: () => addToCart(nft.id, 1, nft.edition),
    onSuccess: (cart) => queryClient.setQueryData(['cart'], cart),
  });
  const favoriteMutation = useMutation({
    mutationFn: toggleFavoriteRequest,
    onMutate: async (nftId) => {
      setFavoriteError(false);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['nfts'] }),
        queryClient.cancelQueries({ queryKey: ['nft', nftId] }),
      ]);

      const previousLists = queryClient.getQueriesData<GetNFTsResponse>({ queryKey: ['nfts'] });
      const previousDetail = queryClient.getQueryData<NFT>(['nft', nftId]);
      const optimisticNFT = { ...nft, isFavorite: !nft.isFavorite };

      queryClient.setQueriesData<GetNFTsResponse>({ queryKey: ['nfts'] }, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((item) => item.id === nftId ? { ...item, isFavorite: optimisticNFT.isFavorite } : item),
        };
      });
      queryClient.setQueryData<NFT>(['nft', nftId], (current) => current
        ? { ...current, isFavorite: optimisticNFT.isFavorite }
        : optimisticNFT);

      return { previousLists, previousDetail };
    },
    onSuccess: (updated) => {
      queryClient.setQueriesData<GetNFTsResponse>({ queryKey: ['nfts'] }, (current) => {
        if (!current) return current;
        return { ...current, data: current.data.map((item) => item.id === updated.id ? { ...item, ...updated } : item) };
      });
      queryClient.setQueryData(['nft', updated.id], updated);
    },
    onError: (_error, nftId, context) => {
      context?.previousLists.forEach(([queryKey, previousData]) => queryClient.setQueryData(queryKey, previousData));
      if (context?.previousDetail) queryClient.setQueryData(['nft', nftId], context.previousDetail);
      else queryClient.removeQueries({ queryKey: ['nft', nftId], exact: true });
      setFavoriteError(true);
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: ['nfts'] }),
  });

  function toggleFavorite() {
    const next = !isFavorite;
    onToggleFavorite?.(nft, next);
    favoriteMutation.mutate(nft.id);
  }

  function addItem() {
    if (onBuy) onBuy(nft);
    else cartMutation.mutate();
  }

  return (
    <article className="group min-w-0 text-left">
      <div className="relative aspect-square overflow-hidden bg-surface-raised p-3">
        <Link to="/nfts/$id" params={{ id: nft.id }} aria-label={`Ver detalhes de ${nft.title}`} className="block size-full">
          <KurioArtwork variant={nft.artworkVariant} label={nft.title} className="size-full rounded-[14px] transition duration-500 group-hover:scale-[1.025]" />
        </Link>
        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 justify-end gap-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <button type="button" onClick={addItem} disabled={cartMutation.isPending} aria-label={`Adicionar ${nft.title} ao carrinho`} className="grid size-9 place-items-center border border-border bg-background/90 text-foreground hover:border-primary hover:text-primary disabled:opacity-50"><ShoppingCart className="size-4" /></button>
          <button type="button" onClick={toggleFavorite} disabled={favoriteMutation.isPending} aria-label={isFavorite ? `Remover ${nft.title} dos favoritos` : `Favoritar ${nft.title}`} aria-pressed={isFavorite} className="grid size-9 place-items-center border border-border bg-background/90 text-foreground hover:border-primary hover:text-primary disabled:opacity-50"><Heart className={`size-4 ${isFavorite ? 'fill-primary text-primary' : ''}`} /></button>
        </div>
      </div>
      <div className="pt-2">
        <h3 className="truncate text-[13px] font-normal text-foreground"><Link to="/nfts/$id" params={{ id: nft.id }} className="hover:text-primary">{nft.title}</Link></h3>
        <p className="mt-1 text-sm font-bold text-primary">{nft.priceEth} ETH</p>
      </div>
      {favoriteError && (
        <div role="alert" className="fixed bottom-6 right-6 z-[120] w-[min(360px,calc(100vw-3rem))] border border-red-300/50 bg-surface-raised px-4 py-3 text-xs text-red-200 shadow-2xl">
          Não foi possível atualizar o favorito. A alteração foi desfeita.
        </div>
      )}
    </article>
  );
}

export default NFTCard;
