/* eslint-disable react-refresh/only-export-components */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, createRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Heart, Mail, Share2, Star, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { CollectionRail } from '../../components/CollectionRail';
import { KurioArtwork } from '../../components/KurioArtwork';
import { QuantityControl } from '../../components/QuantityControl';
import { Button } from '../../components/ui/button';
import { addToCart, toggleFavorite } from '../../services/marketplaceService';
import { getNFTById } from '../../services/nftService';
import type { NFT } from '../../types';
import { rootRoute } from '../__root';

const EDITIONS = ['1/1', '1/10', '1/50', 'ABERTA'];

function NFTDetailsPage() {
  const { id } = nftDetailsRoute.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedEdition, setSelectedEdition] = useState('1/50');
  const [quantity, setQuantity] = useState(1);

  const { data: nft, isPending, isError, refetch } = useQuery({
    queryKey: ['nft', id],
    queryFn: () => getNFTById(id),
  });

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['nft', id] });
      const previous = queryClient.getQueryData<NFT>(['nft', id]);
      queryClient.setQueryData<NFT>(['nft', id], (current) => current ? { ...current, isFavorite: !current.isFavorite } : current);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(['nft', id], context.previous);
    },
    onSuccess: (updated) => queryClient.setQueryData(['nft', id], updated),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: ['nfts'] }),
  });

  const cartMutation = useMutation({
    mutationFn: () => addToCart(id, quantity, selectedEdition),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
      void navigate({ to: '/carrinho' });
    },
  });

  if (isPending) {
    return <div className="grid min-h-[620px] animate-pulse gap-10 lg:grid-cols-2"><div className="bg-surface-raised" /><div className="space-y-5 py-10"><div className="h-9 w-3/4 bg-surface-raised" /><div className="h-6 w-1/3 bg-surface-raised" /><div className="h-32 bg-surface-raised" /></div></div>;
  }

  if (isError || !nft) {
    return <section className="min-h-[540px] py-20 text-center"><h1 className="text-2xl font-bold">NFT não encontrado</h1><p className="mt-3 text-sm text-muted">Não foi possível carregar esta obra.</p><Button className="mt-6" onClick={() => refetch()}>Tentar novamente</Button></section>;
  }

  const galleryVariants = [0, 1, 2, 3].map((offset) => ((nft.artworkVariant ?? 0) + offset) % 4);
  const tokenId = nft.tokenId ?? nft.title.match(/#(\d+)/)?.[1] ?? nft.id;

  return (
    <>
      <nav className="mb-3 hidden text-sm font-bold sm:block" aria-label="Navegação estrutural">
        <Link to="/" search={{ search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' }} className="hover:text-primary">Início</Link>
        <span className="px-2">/</span>
        <Link to="/mercado" search={{ search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' }} className="hover:text-primary">Mercado</Link>
      </nav>
      <button type="button" onClick={() => window.history.back()} aria-label="Voltar" className="mb-3 grid size-10 place-items-center rounded-full border border-border text-primary sm:hidden"><ArrowLeft className="size-5" /></button>

      <section className="grid gap-0 sm:gap-8 lg:grid-cols-[minmax(0,572px)_minmax(420px,1fr)]">
        <div className="grid min-w-0 grid-cols-1 sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-7">
          <div className="hidden flex-col gap-4 sm:flex">
            {galleryVariants.map((variant, index) => (
              <button key={variant} type="button" onClick={() => setSelectedImage(index)} aria-label={`Exibir imagem ${index + 1}`} aria-pressed={selectedImage === index} className={`overflow-hidden rounded-lg border-2 bg-surface-raised transition ${selectedImage === index ? 'border-primary' : 'border-transparent hover:border-border'}`}>
                <KurioArtwork variant={variant} label={`${nft.title}, visual ${index + 1}`} className="aspect-square w-full" />
              </button>
            ))}
          </div>
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[28px] bg-surface-raised p-0 sm:rounded-md sm:p-5">
            <KurioArtwork variant={galleryVariants[selectedImage]} label={nft.title} className="size-full sm:rounded-[24px]" />
            <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-background/80 text-foreground"><ZoomIn className="size-5" /></span>
          </div>
        </div>

        <div className="relative -mt-7 flex min-w-0 flex-col rounded-t-[28px] bg-surface px-5 pb-6 pt-7 sm:mt-0 sm:rounded-none sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-1 lg:pl-1">
          <div className="border-b border-border pb-2">
            <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
              <div>
                <h1 className="break-words text-[clamp(1.45rem,2vw,1.7rem)] font-bold leading-tight text-foreground">{nft.title}</h1>
                <p className="mt-2 hidden text-xl font-bold text-primary sm:block">{nft.priceEth} ETH</p>
              </div>
              <div className="flex items-center gap-1 pb-1 text-primary" aria-label={`${nft.reviewCount ?? 19} avaliações, nota 4.5 de 5`}>
                {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-3.5 ${index < 4 ? 'fill-current' : index === 4 ? 'fill-current opacity-70' : ''}`} />)}
                <span className="ml-1 text-xs text-foreground">{nft.reviewCount ?? 19} avaliações de colecionadores</span>
              </div>
            </div>
          </div>

          <h2 className="mt-3 text-sm font-bold">Sobre este NFT:</h2>
          <p className="mt-2 text-[13px] leading-6 text-[#cfb28c]">{nft.description}</p>

          <fieldset className="mt-2">
            <legend className="mb-2 text-sm font-bold">Edição:</legend>
            <div className="flex flex-wrap gap-2">
              {EDITIONS.map((edition) => (
                <button key={edition} type="button" onClick={() => setSelectedEdition(edition)} className={`rounded-full border px-2 py-1 text-[11px] transition ${selectedEdition === edition ? 'border-primary text-primary' : 'border-border text-muted hover:border-primary'}`}>{edition}</button>
              ))}
            </div>
          </fieldset>

          <div className="mt-4 hidden flex-col gap-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
            <QuantityControl value={quantity} max={nft.availableQuantity} onChange={setQuantity} />
            <div className="flex gap-2 sm:min-w-[270px]">
              <Button className="flex-1 uppercase" disabled={cartMutation.isPending} onClick={() => cartMutation.mutate()}>{cartMutation.isPending ? 'Adicionando...' : 'Comprar'}</Button>
              <Button variant="outline" className="flex-1" aria-pressed={nft.isFavorite} disabled={favoriteMutation.isPending} onClick={() => favoriteMutation.mutate()}>
                <Heart className={`size-4 ${nft.isFavorite ? 'fill-current' : ''}`} />{nft.isFavorite ? 'Favoritado' : 'Favoritar'}
              </Button>
            </div>
          </div>
          {cartMutation.isError && <p role="alert" className="mt-2 text-xs text-red-300">Não foi possível adicionar a quantidade selecionada ao carrinho.</p>}

          <dl className="mt-4 space-y-2 text-[13px] text-[#b99468]">
            <div className="flex gap-2"><dt>ID do token:</dt><dd>#{tokenId}</dd></div>
            <div className="flex gap-2"><dt>Coleção:</dt><dd>{nft.collection ?? 'Kurio Apes'}</dd></div>
            <div className="flex gap-2"><dt>Atributos:</dt><dd>{nft.attributes?.join(', ') ?? 'Raro'}</dd></div>
          </dl>
          <div className="mt-2 flex items-center gap-2 text-sm font-bold">
            <span>Compartilhar este NFT:</span>
            <a href="#linkedin" aria-label="Compartilhar no LinkedIn" className="text-xs hover:text-primary">in</a>
            <a href={`mailto:?subject=${encodeURIComponent(nft.title)}`} aria-label="Compartilhar por e-mail" className="hover:text-primary"><Mail className="size-4" /></a>
            <a href="#twitter" aria-label="Compartilhar em rede social" className="hover:text-primary"><Share2 className="size-4" /></a>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-[80] rounded-t-[30px] border-t border-border bg-[#241612] px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-2xl sm:hidden">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm"><span className="text-[#cfb28c]">Qtd.</span><QuantityControl compact value={quantity} max={nft.availableQuantity} onChange={setQuantity} /></div>
          <strong className="text-lg text-primary">{nft.priceEth} ETH</strong>
        </div>
        <div className="flex gap-3">
          <Button className="h-14 flex-1 rounded-full text-sm" disabled={cartMutation.isPending} onClick={() => cartMutation.mutate()}>{cartMutation.isPending ? 'Adicionando...' : 'Comprar NFT'}</Button>
          <Button variant="outline" size="icon" className="size-14 shrink-0 rounded-full" aria-label="Favoritar NFT" aria-pressed={nft.isFavorite} disabled={favoriteMutation.isPending} onClick={() => favoriteMutation.mutate()}><Heart className={`size-5 ${nft.isFavorite ? 'fill-current' : ''}`} /></Button>
        </div>
      </div>

      <section className="mt-14 pb-36 text-[13px] leading-6 text-[#cfb28c] sm:mt-24 sm:pb-0">
        <div className="flex gap-8 border-b border-border">
          <h2 className="border-b-2 border-primary pb-2 font-bold text-primary">Detalhes do NFT</h2>
          <span className="pb-2 text-sm text-foreground">Avaliações de colecionadores ({nft.reviewCount ?? 19})</span>
        </div>
        <p className="mt-4">{nft.title} é uma obra digital {selectedEdition} finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na rede. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.</p>
        <p className="mt-5">A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência. Nova Sato recebe {nft.royaltyPercentage ?? 5}% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.</p>
        <dl className="mt-3 space-y-3">
          <div><dt className="font-bold text-foreground">Rede:</dt><dd>Cunhado na {nft.network ?? 'Ethereum'} com procedência imutável e metadados armazenados no IPFS.</dd></div>
          <div><dt className="font-bold text-foreground">Contrato ERC-721:</dt><dd>{nft.contractAddress ?? '0x7A42...19E8'} • Contrato inteligente verificado.</dd></div>
          <div><dt className="font-bold text-foreground">Direitos autorais:</dt><dd>{nft.royaltyPercentage ?? 5}% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.</dd></div>
        </dl>
      </section>

      <CollectionRail title="Mais desta coleção" excludeId={nft.id} />
    </>
  );
}

export const nftDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nfts/$id',
  component: NFTDetailsPage,
});
