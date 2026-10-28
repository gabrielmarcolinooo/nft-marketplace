import { delay, http, HttpResponse } from 'msw';
import type { CollectorProfile, Wallet } from '../types';
import { addEth, multiplyEth, parseEth, percentageEth } from './decimal';
import { emitNFTUpdated, emitOrderUpdated, socketHandler } from './socket';
import { readMockState, updateMockState } from './store';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const NETWORK_FEE = '0.016';

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  return request.json() as Promise<Record<string, unknown>>;
}

function getQuote(coupon?: string) {
  const state = readMockState();
  const lineTotals = state.cart.map(({ nft, quantity }) => multiplyEth(nft.priceEth, quantity));
  const subtotalEth = addEth(...lineTotals);
  const normalizedCoupon = coupon?.trim().toUpperCase();
  const discountEth = normalizedCoupon === 'KURIO10' ? percentageEth(subtotalEth, 10) : '0';
  const totalEth = addEth(subtotalEth, NETWORK_FEE, `-${discountEth}`);

  return {
    subtotalEth,
    discountEth,
    networkFeeEth: NETWORK_FEE,
    totalEth,
    coupon: normalizedCoupon || undefined,
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
  };
}

export const handlers = [
  http.get('/api/nfts', async ({ request }) => {
    await delay(350);
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.trim().toLocaleLowerCase() ?? '';
    const category = url.searchParams.get('category')?.trim().toLocaleLowerCase() ?? '';
    const network = url.searchParams.get('network')?.trim().toLocaleLowerCase() ?? '';
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const sort = url.searchParams.get('sort') ?? '';
    const page = positiveInteger(url.searchParams.get('page'), DEFAULT_PAGE);
    const limit = Math.min(positiveInteger(url.searchParams.get('limit'), DEFAULT_LIMIT), MAX_LIMIT);

    const filtered = readMockState().nfts.filter((nft) => {
      const matchesSearch = !search || nft.title.toLocaleLowerCase().includes(search) || nft.description.toLocaleLowerCase().includes(search);
      const matchesCategory = !category || category === 'all' || nft.category.toLocaleLowerCase() === category;
      const matchesNetwork = !network || network === 'all' || nft.network?.toLocaleLowerCase() === network;
      const price = parseEth(nft.priceEth);
      const matchesMin = !minPrice || price >= parseEth(minPrice);
      const matchesMax = !maxPrice || price <= parseEth(maxPrice);
      return matchesSearch && matchesCategory && matchesNetwork && matchesMin && matchesMax;
    });

    const sorted = [...filtered].sort((first, second) => {
      if (sort === 'price-asc') return first.priceEth.localeCompare(second.priceEth, undefined, { numeric: true });
      if (sort === 'price-desc') return second.priceEth.localeCompare(first.priceEth, undefined, { numeric: true });
      if (sort === 'title-asc') return first.title.localeCompare(second.title, 'pt-BR');
      if (sort === 'title-desc') return second.title.localeCompare(first.title, 'pt-BR');
      return 0;
    });
    const total = sorted.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const start = (page - 1) * limit;

    return HttpResponse.json({ data: sorted.slice(start, start + limit), pagination: { page, limit, total, totalPages } });
  }),

  http.get('/api/nfts/:id', async ({ params }) => {
    await delay(250);
    const nft = readMockState().nfts.find((item) => item.id === params.id);
    return nft ? HttpResponse.json(nft) : HttpResponse.json({ message: 'NFT não encontrado.' }, { status: 404 });
  }),

  http.put('/api/nfts/:id/favorite', ({ params }) => {
    let updatedNFT;
    updateMockState((state) => {
      const nft = state.nfts.find((item) => item.id === params.id);
      if (nft) {
        nft.isFavorite = !nft.isFavorite;
        updatedNFT = { ...nft };
      }
    });
    if (!updatedNFT) return HttpResponse.json({ message: 'NFT não encontrado.' }, { status: 404 });
    emitNFTUpdated(updatedNFT);
    return HttpResponse.json(updatedNFT);
  }),

  http.get('/api/session', () => HttpResponse.json(readMockState().session)),
  http.post('/api/session', async ({ request }) => {
    const body = await jsonBody(request);
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (email !== 'usuario@kurio.com' || password !== '123456') {
      return HttpResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 });
    }
    const session = { user: { id: 'user-1', name: 'Usuário Kurio', email, avatar: '' }, token: crypto.randomUUID() };
    updateMockState((state) => { state.session = session; });
    return HttpResponse.json(session);
  }),
  http.delete('/api/session', () => {
    updateMockState((state) => { state.session = null; });
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/cart', () => HttpResponse.json(readMockState().cart)),
  http.post('/api/cart', async ({ request }) => {
    const body = await jsonBody(request);
    const nftId = String(body.nftId ?? '');
    const quantity = positiveInteger(String(body.quantity ?? 1), 1);
    const selectedEdition = String(body.selectedEdition ?? '');
    let error = '';
    const state = updateMockState((draft) => {
      const nft = draft.nfts.find((item) => item.id === nftId);
      if (!nft) { error = 'NFT não encontrado.'; return; }
      const item = draft.cart.find((entry) => entry.nft.id === nftId);
      const nextQuantity = (item?.quantity ?? 0) + quantity;
      if (nextQuantity > nft.availableQuantity) { error = 'Quantidade indisponível.'; return; }
      if (item) {
        item.quantity = nextQuantity;
        item.selectedEdition = selectedEdition || item.selectedEdition || nft.edition;
      } else {
        draft.cart.push({ nft: { ...nft }, quantity, selectedEdition: selectedEdition || nft.edition });
      }
    });
    return error ? HttpResponse.json({ message: error }, { status: 422 }) : HttpResponse.json(state.cart, { status: 201 });
  }),
  http.patch('/api/cart/:nftId', async ({ params, request }) => {
    const body = await jsonBody(request);
    const quantity = positiveInteger(String(body.quantity ?? 1), 1);
    const state = updateMockState((draft) => {
      const item = draft.cart.find((entry) => entry.nft.id === params.nftId);
      if (item) item.quantity = Math.min(quantity, item.nft.availableQuantity);
    });
    return HttpResponse.json(state.cart);
  }),
  http.delete('/api/cart', () => {
    const state = updateMockState((draft) => { draft.cart = []; });
    return HttpResponse.json(state.cart);
  }),
  http.delete('/api/cart/:nftId', ({ params }) => {
    const state = updateMockState((draft) => { draft.cart = draft.cart.filter((item) => item.nft.id !== params.nftId); });
    return HttpResponse.json(state.cart);
  }),

  http.post('/api/quote', async ({ request }) => {
    const body = await jsonBody(request);
    return HttpResponse.json(getQuote(typeof body.coupon === 'string' ? body.coupon : undefined));
  }),

  http.post('/api/orders', async ({ request }) => {
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (!idempotencyKey) return HttpResponse.json({ message: 'Idempotency-Key é obrigatória.' }, { status: 400 });
    const body = await jsonBody(request);
    const coupon = typeof body.coupon === 'string' ? body.coupon : undefined;
    const walletLabel = typeof body.walletLabel === 'string' && body.walletLabel.trim() ? body.walletLabel.trim() : 'MetaMask';
    const current = readMockState();
    const existingId = current.idempotency[idempotencyKey];
    if (existingId) return HttpResponse.json(current.orders.find((order) => order.id === existingId));
    if (current.cart.length === 0) return HttpResponse.json({ message: 'Carrinho vazio.' }, { status: 422 });

    const quote = getQuote(coupon);
    const transactionHash = `0x${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`.slice(0, 66);
    const order = {
      id: `order-${crypto.randomUUID()}`,
      userId: current.session?.user.id ?? 'guest',
      items: current.cart,
      transactionHash,
      subtotalEth: quote.subtotalEth,
      discountEth: quote.discountEth,
      networkFeeEth: quote.networkFeeEth,
      totalEth: quote.totalEth,
      coupon: quote.coupon,
      walletLabel,
      status: 'confirmed' as const,
      createdAt: new Date().toISOString(),
    };
    updateMockState((state) => {
      state.orders.push(order);
      state.idempotency[idempotencyKey] = order.id;
      state.cart = [];
    });
    emitOrderUpdated(order);
    return HttpResponse.json(order, { status: 201 });
  }),
  http.get('/api/orders/:id', ({ params }) => {
    const order = readMockState().orders.find((item) => item.id === params.id);
    return order ? HttpResponse.json(order) : HttpResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
  }),

  http.get('/api/profile', () => HttpResponse.json(readMockState().profile)),
  http.put('/api/profile', async ({ request }) => {
    const profile = await request.json() as CollectorProfile;
    updateMockState((state) => { state.profile = { ...state.profile, ...profile }; });
    return HttpResponse.json(readMockState().profile);
  }),
  http.get('/api/wallets', () => HttpResponse.json(readMockState().wallets)),
  http.post('/api/wallets', async ({ request }) => {
    const input = await request.json() as Omit<Wallet, 'id'>;
    const wallet: Wallet = { ...input, id: `wallet-${crypto.randomUUID()}` };
    const state = updateMockState((draft) => {
      if (wallet.isPrimary) draft.wallets = draft.wallets.filter((item) => !item.isPrimary);
      draft.wallets.push(wallet);
    });
    return HttpResponse.json(state.wallets, { status: 201 });
  }),

  socketHandler,
];
