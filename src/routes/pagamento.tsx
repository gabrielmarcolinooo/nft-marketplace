/* eslint-disable react-refresh/only-export-components */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, createRoute, useNavigate } from '@tanstack/react-router';
import { type FormEvent, type ReactNode, useState } from 'react';
import { KurioArtwork } from '../components/KurioArtwork';
import { OrderConfirmationModal } from '../components/OrderConfirmationModal';
import { Button } from '../components/ui/button';
import { addEth, displayEth, multiplyEth } from '../lib/eth';
import { clearCart, createOrder, getCart, getQuote } from '../services/marketplaceService';
import type { Order } from '../types';
import { rootRoute } from './__root';

const fieldClass = 'h-10 w-full rounded-[3px] border border-border bg-surface px-3 text-xs text-foreground outline-none transition placeholder:text-[#a78662] focus:border-primary focus:ring-1 focus:ring-primary';

function CheckoutField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block text-[13px] text-foreground">
      <span className="mb-2 block">{label}{required && <span className="ml-1 text-primary">*</span>}</span>
      {children}
    </label>
  );
}

const walletOptions = [
  { value: 'metamask', label: 'MetaMask' },
  { value: 'walletconnect', label: 'WalletConnect' },
  { value: 'coinbase', label: 'Coinbase Wallet' },
] as const;

interface PaymentSearch {
  coupon?: string;
}

function validatePaymentSearch(value: unknown): PaymentSearch {
  const params = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const coupon = typeof params.coupon === 'string' ? params.coupon.trim().toUpperCase() : '';
  return { coupon: coupon === 'KURIO10' ? coupon : undefined };
}

function PaymentPage() {
  const { coupon } = paymentRoute.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [walletProvider, setWalletProvider] = useState<(typeof walletOptions)[number]['value']>('coinbase');
  const [useAnotherWallet, setUseAnotherWallet] = useState(false);
  const [confirmation, setConfirmation] = useState<Order | null>(null);

  const { data: cart = [], isPending: cartPending } = useQuery({ queryKey: ['cart'], queryFn: getCart });
  const cartSignature = cart.map(({ nft, quantity, selectedEdition }) => `${nft.id}:${selectedEdition}:${quantity}`).join('|');
  const subtotal = addEth(...cart.map(({ nft, quantity }) => multiplyEth(nft.priceEth, quantity)));
  const { data: quote, isPending: quotePending } = useQuery({
    queryKey: ['quote', 'checkout', coupon, cartSignature],
    queryFn: () => getQuote(coupon),
    enabled: !cartPending && cart.length > 0,
  });
  const subtotalValue = quote?.subtotalEth ?? subtotal;
  const discountValue = quote?.discountEth ?? '0';
  const networkFeeValue = quote?.networkFeeEth ?? '0.016';
  const totalValue = quote?.totalEth ?? addEth(subtotalValue, networkFeeValue, `-${discountValue}`);

  const orderMutation = useMutation({
    mutationFn: () => createOrder({
      coupon,
      walletLabel: walletOptions.find((wallet) => wallet.value === walletProvider)?.label ?? 'MetaMask',
    }),
    onSuccess: async (order) => {
      setConfirmation(order);
      try {
        const emptyCart = await clearCart();
        queryClient.setQueryData(['cart'], emptyCart);
      } finally {
        queryClient.setQueryData(['cart'], []);
        queryClient.removeQueries({ queryKey: ['quote'] });
      }
    },
  });

  function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cart.length > 0) orderMutation.mutate();
  }

  async function finishCheckout() {
    setConfirmation(null);
    orderMutation.reset();
    await navigate({
      to: '/',
      search: { search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30', purchase: 'success' },
    });
  }

  return (
    <>
      <nav className="mb-7 hidden text-sm font-bold sm:block" aria-label="Navegação estrutural">
        <Link to="/" search={{ search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' }} className="hover:text-primary">Início</Link>
        <span className="px-2">/</span>
        <Link to="/mercado" search={{ search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' }} className="hover:text-primary">Mercado</Link>
        <span className="px-2">/</span><span>Pagamento</span>
      </nav>

      <form onSubmit={submitCheckout} className="grid items-start gap-6 pb-24 lg:gap-8 lg:grid-cols-[minmax(0,1.88fr)_minmax(360px,1fr)]">
        <section className="rounded-[24px] bg-surface p-5 sm:rounded-none sm:bg-transparent sm:p-0">
          <h1 className="mb-4 text-center text-xl font-bold sm:text-left sm:text-base">Pagamento com carteira</h1>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <CheckoutField label="Nome de exibição" required><input className={fieldClass} name="displayName" required /></CheckoutField>
            <CheckoutField label="Nome de usuário" required><input className={fieldClass} name="username" required /></CheckoutField>

            <CheckoutField label="Rede" required>
              <select className={`${fieldClass} text-[#b99468]`} name="network" defaultValue="" required>
                <option value="" disabled>Selecione uma rede</option><option>Ethereum</option><option>Polygon</option><option>Solana</option>
              </select>
            </CheckoutField>
            <CheckoutField label="Nome do perfil" required><input className={fieldClass} name="profileName" required /></CheckoutField>

            <CheckoutField label="Endereço da carteira" required><input className={fieldClass} name="walletAddress" placeholder="Endereço 0x da carteira" required /></CheckoutField>
            <CheckoutField label="ENS/carteira secundária"><input className={fieldClass} name="secondaryWallet" placeholder="ENS ou carteira secundária (opcional)" /></CheckoutField>

            <CheckoutField label="Tipo de carteira" required>
              <select className={`${fieldClass} text-[#b99468]`} name="walletType" value={walletProvider} onChange={(event) => setWalletProvider(event.target.value as typeof walletProvider)} required>
                {walletOptions.map((wallet) => <option key={wallet.value} value={wallet.value}>{wallet.label}</option>)}
              </select>
            </CheckoutField>
            <CheckoutField label="Código de indicação" required><input className={fieldClass} name="referralCode" required /></CheckoutField>

            <CheckoutField label="E-mail" required><input className={fieldClass} name="email" type="email" required /></CheckoutField>
            <CheckoutField label="Nome ENS" required>
              <div className="flex">
                <input className={`${fieldClass} min-w-0 rounded-r-none`} name="ensName" required />
                <span className="flex h-10 items-center rounded-r-[3px] border border-l-0 border-border bg-surface px-3 text-xs text-[#b99468]">.eth</span>
              </div>
            </CheckoutField>
          </div>

          <label className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={useAnotherWallet} onChange={(event) => setUseAnotherWallet(event.target.checked)} className="size-4 appearance-none rounded-full border border-primary bg-transparent checked:border-[4px] checked:border-primary" />
            Usar outra carteira?
          </label>
          {useAnotherWallet && <input className={`${fieldClass} mt-3 max-w-[350px]`} name="alternateWallet" placeholder="Endereço da outra carteira" aria-label="Endereço da outra carteira" />}

          <label className="mt-5 block max-w-[350px] text-[13px]">
            <span className="mb-2 block">Observação do colecionador (opcional)</span>
            <textarea name="collectorNote" className="h-36 w-full resize-none rounded-[3px] border border-border bg-surface p-3 text-xs text-foreground outline-none transition placeholder:text-[#a78662] focus:border-primary focus:ring-1 focus:ring-primary" />
          </label>
        </section>

        <aside className="rounded-[24px] bg-surface p-5 sm:rounded-none sm:bg-transparent sm:p-0">
          <h2 className="text-base font-bold">Seus NFTs</h2>
          <div className="mt-2 grid grid-cols-[1fr_auto] border-b border-border pb-2 text-sm font-bold"><span>NFTs</span><span>Subtotal</span></div>

          <div className="mt-3 space-y-3">
            {cartPending && Array.from({ length: 3 }, (_, index) => <div key={index} className="h-[70px] animate-pulse bg-surface-raised" />)}
            {!cartPending && cart.length === 0 && (
              <div className="border border-border px-4 py-8 text-center">
                <p className="text-sm font-bold">Nenhum NFT selecionado.</p>
                <Link to="/mercado" search={{ search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' }} className="mt-2 inline-block text-xs text-primary">Voltar ao mercado</Link>
              </div>
            )}
            {cart.map(({ nft, quantity, selectedEdition }) => {
              const tokenId = nft.tokenId ?? nft.title.match(/#(\d+)/)?.[1] ?? nft.id;
              return (
                <article key={nft.id} className="grid grid-cols-[68px_minmax(0,1fr)_auto] items-center gap-3 bg-surface-raised pr-3">
                  <KurioArtwork variant={nft.artworkVariant} label={nft.title} className="size-[68px] rounded-md" />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold">{nft.title}</h3>
                    <p className="mt-1 truncate text-xs text-[#b99468]">ID do token: #{tokenId} <span className="ml-1 text-foreground">{selectedEdition} (x {quantity})</span></p>
                  </div>
                  <strong className="whitespace-nowrap text-sm text-primary">{displayEth(multiplyEth(nft.priceEth, quantity))} ETH</strong>
                </article>
              );
            })}
          </div>

          <p className="my-3 text-center text-xs">{coupon ? <span className="text-primary">Cupom {coupon} aplicado.</span> : <>Tem um código promocional? <Link to="/carrinho" className="hover:text-primary">Aplique aqui</Link></>}</p>
          <dl className={`space-y-3 text-sm transition-opacity ${quotePending ? 'opacity-60' : ''}`} aria-live="polite">
            <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd>{displayEth(subtotalValue)} ETH</dd></div>
            <div className="flex justify-between gap-4"><dt>Desconto do lançamento</dt><dd>(-) {displayEth(discountValue)} ETH</dd></div>
            <div className="flex justify-between gap-4"><dt>Taxa de rede</dt><dd>{displayEth(networkFeeValue, 3)} ETH</dd></div>
            <p className="text-right text-[10px] text-primary">Taxa estimada</p>
            <div className="flex justify-between gap-4 border-t border-border pt-3 text-base font-bold"><dt className="pl-10">Total</dt><dd className="text-primary">{displayEth(totalValue)} ETH</dd></div>
          </dl>

          <fieldset className="mt-6">
            <legend className="mb-3 text-left text-base font-bold">Carteira e rede</legend>
            <div className="space-y-3">
              {walletOptions.map((wallet) => {
                const active = walletProvider === wallet.value;
                return (
                  <label key={wallet.value} className={`flex h-[64px] cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm transition sm:h-11 sm:rounded-[3px] sm:px-3 ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/70'}`}>
                    <input type="radio" name="walletProvider" value={wallet.value} checked={active} onChange={() => setWalletProvider(wallet.value)} className="size-4 appearance-none rounded-full border border-primary bg-transparent checked:border-[4px] checked:border-primary" />
                    <span>{wallet.label}</span>
                    {wallet.value === 'walletconnect' && <span className="ml-auto rounded border border-border bg-background px-2 py-1 text-[8px] font-bold text-primary">WALLETCONNECT</span>}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {orderMutation.isError && <p role="alert" className="mt-4 text-center text-xs text-red-300">Não foi possível confirmar a compra. Tente novamente.</p>}
          <Button type="submit" className="mt-8 h-14 w-full rounded-full sm:mt-6 sm:h-auto sm:rounded-[3px]" disabled={cart.length === 0 || cartPending || quotePending || orderMutation.isPending}>{orderMutation.isPending ? 'Confirmando...' : 'Confirmar compra'}</Button>
        </aside>
      </form>

      <OrderConfirmationModal
        open={Boolean(confirmation)}
        onClose={() => { void finishCheckout(); }}
        order={confirmation}
      />
    </>
  );
}

export const paymentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/pagamento', validateSearch: validatePaymentSearch, component: PaymentPage });
