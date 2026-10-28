/* eslint-disable react-refresh/only-export-components */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, createRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { CollectionRail } from '../components/CollectionRail';
import { KurioArtwork } from '../components/KurioArtwork';
import { QuantityControl } from '../components/QuantityControl';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { addEth, displayEth, multiplyEth } from '../lib/eth';
import { getCart, getQuote, removeFromCart, updateCartQuantity } from '../services/marketplaceService';
import { rootRoute } from './__root';

function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const { data: cart = [], isPending, isError, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  });
  const cartSignature = cart.map(({ nft, quantity, selectedEdition }) => `${nft.id}:${selectedEdition}:${quantity}`).join('|');
  const subtotal = addEth(...cart.map(({ nft, quantity }) => multiplyEth(nft.priceEth, quantity)));

  const { data: quote, isFetching: quotePending } = useQuery({
    queryKey: ['quote', appliedCoupon, cartSignature],
    queryFn: () => getQuote(appliedCoupon || undefined),
    enabled: !isPending,
  });

  const quantityMutation = useMutation({
    mutationFn: ({ nftId, quantity }: { nftId: string; quantity: number }) => updateCartQuantity(nftId, quantity),
    onSuccess: (updatedCart) => queryClient.setQueryData(['cart'], updatedCart),
  });

  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: (updatedCart) => queryClient.setQueryData(['cart'], updatedCart),
  });

  function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = couponInput.trim().toUpperCase();
    if (normalized !== 'KURIO10') {
      setCouponError('Código inválido. Confira e tente novamente.');
      setAppliedCoupon('');
      return;
    }
    setCouponError('');
    setCouponInput(normalized);
    setAppliedCoupon(normalized);
  }

  const subtotalValue = quote?.subtotalEth ?? subtotal;
  const discountValue = quote?.discountEth ?? '0';
  const networkFeeValue = quote?.networkFeeEth ?? '0.016';
  const totalValue = quote?.totalEth ?? addEth(subtotal, networkFeeValue);

  return (
    <>
      <nav className="mb-2 hidden text-sm font-bold sm:block" aria-label="Navegação estrutural">
        <Link to="/" search={{ search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' }} className="hover:text-primary">Início</Link>
        <span className="px-2">/</span>
        <Link to="/mercado" search={{ search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' }} className="hover:text-primary">Mercado</Link>
        <span className="px-2">/</span><span>Carrinho</span>
      </nav>
      <div className="mb-5 grid grid-cols-[40px_1fr_40px] items-center sm:hidden"><button type="button" onClick={() => window.history.back()} aria-label="Voltar" className="grid size-10 place-items-center rounded-full border border-border text-primary"><ArrowLeft className="size-5" /></button><h1 className="text-center text-xl font-bold">Carrinho de NFTs</h1><span /></div>

      <section className="grid min-h-[390px] items-start gap-12 lg:grid-cols-[minmax(0,2.35fr)_minmax(300px,1fr)] xl:gap-20">
        <div className="min-w-0">
          <div className="hidden grid-cols-[minmax(0,1.55fr)_.62fr_.62fr_.9fr_32px] gap-4 border-b border-border pb-2 text-sm font-bold sm:grid">
            <span>NFTs</span><span>Preço</span><span>Edições</span><span>Total</span><span />
          </div>

          {isPending && <div className="mt-3 space-y-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-[70px] animate-pulse bg-surface-raised" />)}</div>}
          {isError && <div className="border border-border p-8 text-center"><p>Não foi possível carregar o carrinho.</p><Button className="mt-4" size="sm" onClick={() => refetch()}>Tentar novamente</Button></div>}
          {!isPending && !isError && cart.length === 0 && (
            <div className="border-b border-border py-16 text-center">
              <p className="font-bold">Seu carrinho está vazio.</p>
              <p className="mt-2 text-xs text-muted">Explore a coleção e adicione uma obra para continuar.</p>
              <Button asChild className="mt-5"><Link to="/mercado" search={{ search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' }}>Explorar NFTs</Link></Button>
            </div>
          )}

          <div className="space-y-3 pt-3">
            {cart.map(({ nft, quantity, selectedEdition }) => {
              const tokenId = nft.tokenId ?? nft.title.match(/#(\d+)/)?.[1] ?? nft.id;
              return (
                <div key={nft.id} className="contents">
                <article className="grid min-h-[112px] grid-cols-[96px_minmax(0,1fr)] overflow-hidden rounded-2xl bg-surface-raised sm:hidden">
                  <Link to="/nfts/$id" params={{ id: nft.id }}><KurioArtwork variant={nft.artworkVariant} label={nft.title} className="h-full min-h-[112px] w-full" /></Link>
                  <div className="relative flex min-w-0 flex-col justify-between px-4 py-3">
                    <div className="pr-7"><Link to="/nfts/$id" params={{ id: nft.id }} className="block truncate text-sm font-bold">{nft.title}</Link><p className="mt-1 text-xs text-[#b99468]">Edição: {selectedEdition}</p></div>
                    <button type="button" aria-label={`Remover ${nft.title} do carrinho`} disabled={removeMutation.isPending} onClick={() => removeMutation.mutate(nft.id)} className="absolute right-3 top-3 text-primary"><Trash2 className="size-4" /></button>
                    <div className="mt-3 flex items-end justify-between gap-2"><strong className="text-base text-primary">{displayEth(multiplyEth(nft.priceEth, quantity))} ETH</strong><QuantityControl compact value={quantity} max={nft.availableQuantity} disabled={quantityMutation.isPending} onChange={(nextQuantity) => quantityMutation.mutate({ nftId: nft.id, quantity: nextQuantity })} /></div>
                  </div>
                </article>
                <article className="hidden grid-cols-[minmax(0,1.55fr)_.62fr_.62fr_.9fr_32px] items-center gap-4 bg-surface-raised pr-3 sm:grid">
                  <div className="col-span-2 flex min-w-0 items-center gap-4 sm:col-span-1">
                    <Link to="/nfts/$id" params={{ id: nft.id }} className="shrink-0"><KurioArtwork variant={nft.artworkVariant} label={nft.title} className="size-[70px] rounded-md" /></Link>
                    <div className="min-w-0">
                      <Link to="/nfts/$id" params={{ id: nft.id }} className="block truncate text-sm font-bold hover:text-primary">{nft.title}</Link>
                      <p className="mt-1 text-xs text-[#b99468]">ID do token: #{tokenId}</p>
                    </div>
                  </div>
                  <p className="hidden text-sm font-bold text-[#cfb28c] sm:block">{nft.priceEth} ETH</p>
                  <div className="col-span-2 ml-[86px] sm:col-span-1 sm:ml-0">
                    <p className="mb-1 text-[10px] text-[#b99468]">{selectedEdition}</p>
                    <QuantityControl compact value={quantity} max={nft.availableQuantity} disabled={quantityMutation.isPending} onChange={(nextQuantity) => quantityMutation.mutate({ nftId: nft.id, quantity: nextQuantity })} />
                  </div>
                  <p className="text-sm font-bold text-primary">{displayEth(multiplyEth(nft.priceEth, quantity))} ETH</p>
                  <button type="button" aria-label={`Remover ${nft.title} do carrinho`} disabled={removeMutation.isPending} onClick={() => removeMutation.mutate(nft.id)} className="text-[#b99468] transition hover:text-primary disabled:opacity-40"><Trash2 className="size-5" strokeWidth={1.6} /></button>
                </article>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="-mx-5 rounded-t-[30px] bg-surface px-5 pb-7 pt-6 sm:mx-0 sm:rounded-none sm:bg-transparent sm:p-0">
          <h1 className="border-b border-border pb-2 text-base font-bold">Resumo da carteira</h1>
          <form onSubmit={applyCoupon} className="mt-5">
            <label htmlFor="coupon" className="sr-only">Código promocional</label>
            <div className="mt-2 flex">
              <Input id="coupon" value={couponInput} onChange={(event) => { setCouponInput(event.target.value); setCouponError(''); }} placeholder="Digite o código promocional..." className="rounded-r-none border-primary text-xs" aria-invalid={Boolean(couponError)} />
              <Button type="submit" className="rounded-l-none px-5">Aplicar</Button>
            </div>
            {couponError && <p role="alert" className="mt-2 text-[11px] text-red-300">{couponError}</p>}
            {appliedCoupon && !couponError && <p className="mt-2 text-[11px] text-primary">KURIO10 aplicado: 10% de desconto.</p>}
          </form>

          <dl className={`mt-6 space-y-3 text-sm transition-opacity ${quotePending ? 'opacity-60' : ''}`} aria-live="polite">
            <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd>{displayEth(subtotalValue)} ETH</dd></div>
            <div className="flex justify-between gap-4"><dt>Desconto de lançamento</dt><dd>(-) {displayEth(discountValue)} ETH</dd></div>
            <div className="flex justify-between gap-4"><dt>Taxa de rede</dt><dd>{displayEth(networkFeeValue, 3)} ETH</dd></div>
            <p className="text-right text-[10px] text-primary">Taxa estimada</p>
            <div className="flex justify-between gap-4 border-t border-border pt-4 text-base font-bold"><dt>Total</dt><dd className="text-primary">{displayEth(totalValue)} ETH</dd></div>
          </dl>

          <Button className="mt-5 w-full" disabled={cart.length === 0 || quotePending} onClick={() => void navigate({ to: '/pagamento', search: { coupon: appliedCoupon || undefined } })}>Conectar e finalizar</Button>
          <Link to="/mercado" search={{ search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' }} className="mt-3 block text-center text-sm text-primary hover:text-primary-hover">Continuar explorando</Link>
        </aside>
      </section>

      <div className="hidden sm:block"><CollectionRail title="Colecionadores também viram" /></div>
    </>
  );
}

export const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/carrinho', component: CartPage });
