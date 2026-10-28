/* eslint-disable react-refresh/only-export-components */
import { createRoute } from '@tanstack/react-router';
import { CheckCircle2, Search, SlidersHorizontal, X } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { KurioArtwork } from '../components/KurioArtwork';
import NFTGrid from '../components/NFTGrid';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import type { NFTSort } from '../services/nftService';
import { rootRoute } from './__root';

const SORT_OPTIONS: NFTSort[] = ['recent', 'price-asc', 'price-desc', 'title-asc', 'title-desc'];
const categories = [
  ['Arte digital', 33], ['Fotografia', 12], ['Música', 65], ['Arte 3D', 39],
  ['Colecionáveis', 23], ['Generativa', 17], ['Jogos', 19], ['Assinaturas', 13], ['Utilidade', 18],
] as const;
const networks = [['Ethereum', 119], ['Polygon', 78], ['Solana', 86]] as const;

export interface CatalogSearch {
  search: string;
  category: string;
  sort: NFTSort;
  page: number;
  network: string;
  minPrice: string;
  maxPrice: string;
  purchase?: 'success';
  auth?: 'login';
}

export function validateCatalogSearch(value: unknown): CatalogSearch {
  const params = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const sort = typeof params.sort === 'string' && SORT_OPTIONS.includes(params.sort as NFTSort) ? params.sort as NFTSort : 'recent';
  const page = Number(params.page);
  return {
    search: typeof params.search === 'string' ? params.search : '',
    category: typeof params.category === 'string' ? params.category : 'all',
    sort,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    network: typeof params.network === 'string' ? params.network : 'all',
    minPrice: typeof params.minPrice === 'string' ? params.minPrice : '0.02',
    maxPrice: typeof params.maxPrice === 'string' ? params.maxPrice : '12.30',
    purchase: params.purchase === 'success' ? 'success' : undefined,
    auth: params.auth === 'login' ? 'login' : undefined,
  };
}

interface SidebarProps {
  filters: CatalogSearch;
  onChange: (updates: Partial<CatalogSearch>) => void;
  compact?: boolean;
}

export function CatalogSidebar({ filters, onChange, compact }: SidebarProps) {
  const [minPrice, setMinPrice] = useState(Number(filters.minPrice));
  const [maxPrice, setMaxPrice] = useState(Number(filters.maxPrice));

  return (
    <aside className="flex w-full flex-col lg:w-72">
      <div className="bg-surface px-5 py-5">
        <h2 className="mb-4 text-[15px] font-bold">Coleções</h2>
        <div className="space-y-3">
          {categories.map(([name, count]) => (
            <button key={name} type="button" onClick={() => onChange({ category: filters.category === name ? 'all' : name, page: 1 })} className={`flex w-full justify-between text-left text-xs transition hover:text-primary ${filters.category === name ? 'font-bold text-primary' : 'text-muted'}`}>
              <span>{name}</span><span>({count})</span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-[15px] font-bold">Faixa de preço</h2>
          <div className="relative mb-5 h-5">
            <div className="absolute left-0 right-0 top-2 h-0.5 bg-border" />
            <input aria-label="Preço mínimo" type="range" min="0.02" max="12.30" step="0.01" value={minPrice} onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice - 0.01))} className="kurio-range absolute inset-x-0 top-0 w-full" />
            <input aria-label="Preço máximo" type="range" min="0.02" max="12.30" step="0.01" value={maxPrice} onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice + 0.01))} className="kurio-range absolute inset-x-0 top-0 w-full" />
          </div>
          <p className="mb-4 text-[11px] text-muted">Preço: {minPrice.toFixed(2).replace('.', ',')} - {maxPrice.toFixed(2).replace('.', ',')} ETH</p>
          <Button size="sm" onClick={() => onChange({ minPrice: minPrice.toFixed(2), maxPrice: maxPrice.toFixed(2), page: 1 })}>Aplicar</Button>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-[15px] font-bold">Rede</h2>
          <div className="space-y-3">
            {networks.map(([name, count]) => (
              <button key={name} type="button" onClick={() => onChange({ network: filters.network === name ? 'all' : name, page: 1 })} className={`flex w-full justify-between text-left text-xs transition hover:text-primary ${filters.network === name ? 'font-bold text-primary' : 'text-muted'}`}>
                <span>{name}</span><span>({count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {!compact && <div className="mt-8 overflow-hidden bg-surface text-center">
        <div className="px-4 py-4">
          <p className="font-bold text-primary">NFT EM DESTAQUE</p>
          <p className="mt-2 text-sm font-bold">OFERTA LIMITADA</p>
        </div>
        <KurioArtwork variant={1} label="NFT em destaque" className="aspect-square w-full rounded-[16px]" />
      </div>}
    </aside>
  );
}

const articles = [
  { title: 'Como funciona a propriedade de NFTs', description: 'Aprenda a colecionar, negociar e verificar ativos digitais.', meta: '12 de setembro | Leitura de 4 min', variant: 2 },
  { title: '10 artistas digitais para acompanhar', description: 'Conheça criadores que moldam a cultura digital.', meta: '13 de setembro | Leitura de 3 min', variant: 0 },
  { title: 'Raridade, atributos e procedência', description: 'Entenda raridade, procedência e direitos autorais.', meta: '15 de setembro | Leitura de 2 min', variant: 1 },
  { title: 'Como proteger sua carteira', description: 'Proteja sua carteira, seus ativos e sua identidade.', meta: '15 de setembro | Leitura de 2 min', variant: 3 },
] as const;

function HomePage() {
  const { openAuth } = useAuth();
  const filters = indexRoute.useSearch();
  const navigate = indexRoute.useNavigate();
  const [showPurchaseMessage, setShowPurchaseMessage] = useState(filters.purchase === 'success');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(filters.search);
  const updateFilters = useCallback((updates: Partial<CatalogSearch>) => {
    void navigate({ search: (previous) => ({ ...previous, ...updates }) });
  }, [navigate]);

  useEffect(() => {
    if (filters.purchase !== 'success') return;
    void navigate({ search: (previous) => ({ ...previous, purchase: undefined }), replace: true });
  }, [filters.purchase, navigate]);

  useEffect(() => {
    if (filters.auth !== 'login') return;
    openAuth('login');
    void navigate({ search: (previous) => ({ ...previous, auth: undefined }), replace: true });
  }, [filters.auth, navigate, openAuth]);

  useEffect(() => {
    if (!showPurchaseMessage) return;
    const timer = window.setTimeout(() => setShowPurchaseMessage(false), 6000);
    return () => window.clearTimeout(timer);
  }, [showPurchaseMessage]);

  function submitMobileSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters({ search: mobileSearch.trim(), page: 1 });
  }

  return (
    <>
      {showPurchaseMessage && (
        <div role="status" className="fixed right-5 top-[84px] z-50 flex w-[min(390px,calc(100vw-2.5rem))] items-start gap-3 border border-primary/60 bg-surface-raised px-4 py-3 text-sm shadow-glow">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0"><p className="font-bold text-foreground">Compra concluída</p><p className="mt-1 text-xs leading-5 text-[#cfb28c]">Seus NFTs já estão na sua carteira.</p></div>
          <button type="button" onClick={() => setShowPurchaseMessage(false)} aria-label="Fechar mensagem de compra concluída" className="ml-auto text-muted transition hover:text-primary"><X className="size-4" /></button>
        </div>
      )}
      <div className="mb-4 flex gap-2 md:hidden">
        <form onSubmit={submitMobileSearch} className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#cfb28c]" />
          <input value={mobileSearch} onChange={(event) => setMobileSearch(event.target.value)} aria-label="Explorar coleções" placeholder="Explorar coleções" className="h-12 w-full rounded-xl border border-border bg-surface pl-12 pr-3 text-xs outline-none focus:border-primary" />
        </form>
        <button type="button" onClick={() => setFiltersOpen(true)} aria-label="Filtrar NFTs" className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><SlidersHorizontal className="size-5" /></button>
      </div>

      <section className="grid items-center gap-6 rounded-[28px] bg-surface px-4 py-5 md:min-h-[430px] md:gap-12 md:bg-transparent md:px-0 md:pb-16 md:pt-2 lg:grid-cols-[1.3fr_0.8fr]">
        <div className="max-w-[680px] text-left">
          <p className="mb-3 text-[10px] font-bold tracking-[0.12em] text-muted md:mb-5 md:text-xs">Bem-vindo à Kurio</p>
          <h1 className="text-2xl font-bold uppercase leading-[1.28] tracking-[-0.045em] text-foreground md:text-[clamp(2.25rem,4vw,3.25rem)]">Seja dono da<br className="md:hidden" /> cultura digital</h1>
          <p className="mt-3 max-w-[620px] text-xs leading-5 text-muted md:mt-5 md:text-sm md:leading-7">Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.</p>
          <Button className="mt-4 px-5 uppercase md:mt-7 md:px-7" onClick={() => document.querySelector('#mercado')?.scrollIntoView()}>Explorar</Button>
        </div>
        <div className="relative mx-auto w-full max-w-[300px] md:max-w-[410px]">
          <KurioArtwork variant={0} label="Emerald Ape, destaque da coleção Kurio" className="aspect-square w-full rounded-[28px]" />
          <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 gap-2"><span className="size-2 rounded-full bg-primary" /><span className="size-2 rounded-full bg-primary" /><span className="size-2 rounded-full bg-primary/60" /></div>
        </div>
      </section>

      <section id="mercado" className="grid items-start gap-10 pt-7 md:pt-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="hidden lg:block"><CatalogSidebar key={`${filters.minPrice}-${filters.maxPrice}`} filters={filters} onChange={updateFilters} /></div>
        <div className="min-w-0">
          <div className="mb-7 flex flex-col gap-5 border-b border-border/70 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex gap-5 overflow-x-auto whitespace-nowrap text-[11px] font-bold md:gap-6 md:text-xs">
              <button type="button" className="border-b-2 border-primary pb-3 text-primary">Todos os NFTs</button>
              <button type="button" className="pb-3 text-muted hover:text-primary">Novos lançamentos</button>
              <button type="button" className="pb-3 text-muted hover:text-primary">Em alta</button>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-muted">Ordenar por:
              <select value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value as NFTSort, page: 1 })} className="bg-background text-foreground outline-none">
                <option value="recent">Listados recentemente</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="title-asc">Título A–Z</option><option value="title-desc">Título Z–A</option>
              </select>
            </label>
          </div>
          <NFTGrid params={{ ...filters, category: filters.category === 'all' ? undefined : filters.category, network: filters.network === 'all' ? undefined : filters.network, limit: 9 }} onPageChange={(page) => updateFilters({ page })} />
        </div>
      </section>

      {filtersOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 md:hidden" role="dialog" aria-modal="true" aria-label="Filtros do catálogo" onMouseDown={(event) => { if (event.target === event.currentTarget) setFiltersOpen(false); }}>
          <section className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto rounded-t-[30px] bg-surface-raised px-5 pb-8 pt-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Filtrar NFTs</h2><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Fechar filtros"><X className="size-5" /></button></div>
            <CatalogSidebar key={`mobile-${filters.minPrice}-${filters.maxPrice}`} compact filters={filters} onChange={(updates) => { updateFilters(updates); setFiltersOpen(false); }} />
          </section>
        </div>
      )}

      <section id="criadores" className="mt-24 grid gap-5 md:grid-cols-2">
        <article className="flex min-h-[240px] flex-col overflow-hidden rounded-xl bg-surface sm:flex-row">
          <div className="aspect-square w-full shrink-0 sm:w-1/2">
            <KurioArtwork variant={0} label="Emerald Ape" className="h-full w-full bg-cover bg-center" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-end justify-center p-6 text-right">
            <h2 className="text-[13px] font-bold leading-5 text-foreground">Lançamentos gênesis<br />de edição limitada</h2>
            <p className="mt-4 text-[11px] leading-5 text-muted">Colecione edições escassas diretamente dos criadores.</p>
            <Button asChild className="mt-4 px-7 uppercase">
              <a href="#mercado">Explorar</a>
            </Button>
          </div>
        </article>
        <article className="flex min-h-[240px] flex-col overflow-hidden rounded-xl bg-surface sm:flex-row">
          <div className="aspect-square w-full shrink-0 sm:w-1/2">
            <KurioArtwork variant={2} label="Ivory Baron" className="h-full w-full bg-cover bg-center" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-end justify-center p-6 text-right">
            <h2 className="text-[13px] font-bold leading-5 text-foreground">Arte digital selecionada<br />e muito mais</h2>
            <p className="mt-4 text-[11px] leading-5 text-muted">Explore novos artistas e obras digitais.</p>
            <Button asChild className="mt-4 px-7 uppercase">
              <a href="#mercado">Explorar</a>
            </Button>
          </div>
        </article>
      </section>

      <section id="aprenda" className="pb-28 pt-24">
        <div className="mb-10 text-center">
          <h2 className="font-mono text-2xl font-bold tracking-tight text-foreground">Diário da Cunhagem</h2>
          <p className="mx-auto mt-3 max-w-3xl text-xs leading-5 text-muted">Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <article key={article.title} className="flex h-full flex-col overflow-hidden rounded-xl bg-surface">
              <KurioArtwork variant={article.variant} label={article.title} className="aspect-square w-full shrink-0 rounded-t-xl bg-cover bg-center" />
              <div className="flex h-full flex-1 flex-col justify-between p-5">
                <div>
                  <p className="text-[9px] font-bold text-muted">{article.meta}</p>
                  <h3 className="mt-3 text-xs font-bold leading-5 text-foreground">{article.title}</h3>
                  <p className="mt-2 text-[10px] leading-4 text-muted">{article.description}</p>
                </div>
                <a href="#aprenda" className="pt-4 text-[10px] font-bold text-primary">Ler mais →</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', validateSearch: validateCatalogSearch, component: HomePage });
