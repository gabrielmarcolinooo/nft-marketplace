import { Mail, X } from 'lucide-react';
import { useEffect } from 'react';
import { displayEth, multiplyEth } from '../lib/eth';
import type { Order } from '../types';
import { KurioArtwork } from './KurioArtwork';
import { Button } from './ui/button';

interface OrderConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderConfirmationModal({ open, onClose, order }: OrderConfirmationModalProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose, open]);

  if (!open || !order) return null;
  const shortHash = order.transactionHash.length > 14 ? `${order.transactionHash.slice(0, 6)}...${order.transactionHash.slice(-4)}` : order.transactionHash;
  const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(order.createdAt));

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-[#0d0806]/90 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="order-confirmation-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="relative max-h-[calc(100vh-3rem)] w-full max-w-[578px] overflow-y-auto border border-primary/30 border-b-[9px] border-b-primary bg-[#241612] text-foreground shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Fechar confirmação" className="absolute right-4 top-4 z-10 text-primary transition hover:text-primary-hover"><X className="size-5" /></button>

        <header className="border-b border-primary px-6 pb-5 pt-5 text-center sm:px-11">
          <div className="relative mx-auto h-20 w-20 text-primary" aria-hidden="true">
            <Mail className="size-20" strokeWidth={1.4} />
            <span className="absolute inset-x-0 top-[21px] text-[10px] font-bold leading-[10px]">THANK<br />YOU</span>
          </div>
          <h2 id="order-confirmation-title" className="mt-1 text-sm font-bold text-[#cfb28c]">Seus NFTs agora estão na sua carteira</h2>
        </header>

        <dl className="grid grid-cols-2 border-b border-primary px-6 py-4 text-xs text-[#cfb28c] sm:grid-cols-[1.25fr_1.15fr_1fr_1fr] sm:px-9">
          <div className="border-r border-primary pr-3"><dt className="font-bold">ID da transação</dt><dd className="mt-1">{shortHash}</dd></div>
          <div className="pl-4 sm:border-r sm:border-primary"><dt>Data</dt><dd className="mt-1">{date}</dd></div>
          <div className="mt-4 border-r border-primary pr-3 sm:mt-0 sm:pl-4"><dt>Total</dt><dd className="mt-1">{displayEth(order.totalEth)} ETH</dd></div>
          <div className="mt-4 pl-4 sm:mt-0"><dt className="font-bold">Carteira</dt><dd className="mt-1">{order.walletLabel}</dd></div>
        </dl>

        <div className="px-6 pb-12 pt-5 sm:px-11">
          <h3 className="text-sm font-bold">Detalhes da transação</h3>
          <div className="mt-2 hidden grid-cols-[minmax(0,1fr)_70px_105px] border-b border-border pb-2 text-sm font-bold sm:grid"><span>NFTs</span><span>Edições</span><span className="text-right">Subtotal</span></div>
          <div className="mt-3 space-y-3">
            {order.items.map(({ nft, quantity, selectedEdition }) => {
              const tokenId = nft.tokenId ?? nft.title.match(/#(\d+)/)?.[1] ?? nft.id;
              return (
                <article key={nft.id} className="grid grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[70px_minmax(0,1fr)_70px_105px]">
                  <KurioArtwork variant={nft.artworkVariant} label={nft.title} className="size-[70px] rounded-md" />
                  <div className="min-w-0"><h4 className="truncate text-sm font-bold">{nft.title}</h4><p className="mt-1 text-xs text-[#b99468]">ID do token: #{tokenId}</p></div>
                  <span className="hidden text-xs text-[#cfb28c] sm:block">{selectedEdition} (x {quantity})</span>
                  <strong className="whitespace-nowrap text-right text-sm text-primary">{displayEth(multiplyEth(nft.priceEth, quantity))} ETH</strong>
                </article>
              );
            })}
          </div>

          <dl className="ml-auto mt-4 max-w-[320px] space-y-2 border-b border-border pb-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{displayEth(order.subtotalEth)} ETH</dd></div>
            {order.discountEth !== '0' && <div className="flex justify-between"><dt>Desconto{order.coupon ? ` (${order.coupon})` : ''}</dt><dd>(-) {displayEth(order.discountEth)} ETH</dd></div>}
            <div className="flex justify-between"><dt>Taxa de rede</dt><dd>{displayEth(order.networkFeeEth, 3)} ETH</dd></div>
            <div className="flex justify-between font-bold"><dt>Total</dt><dd className="text-primary">{displayEth(order.totalEth)} ETH</dd></div>
          </dl>
          <p className="mx-auto mt-4 max-w-[460px] text-center text-xs leading-5 text-[#b99468]">Transação confirmada na Ethereum. A propriedade foi transferida para sua carteira conectada e registrada na rede.</p>
          <div className="mt-5 text-center">
            <Button asChild className="px-8">
              <a href={`https://etherscan.io/tx/${order.transactionHash}`} target="_blank" rel="noreferrer">Ver no Etherscan</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
