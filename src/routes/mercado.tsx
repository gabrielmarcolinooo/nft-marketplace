/* eslint-disable react-refresh/only-export-components */
import { createRoute } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { type FormEvent, useCallback, useState } from 'react';
import NFTGrid from '../components/NFTGrid';
import { Input } from '../components/ui/input';
import type { NFTSort } from '../services/nftService';
import { rootRoute } from './__root';
import { CatalogSidebar, type CatalogSearch, validateCatalogSearch } from './index';

function MarketSearch({ initialValue, onSearch }: { initialValue: string; onSearch: (search: string) => void }) {
  const [value, setValue] = useState(initialValue);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(value.trim());
  }

  return <form onSubmit={submit} className="relative w-full lg:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Buscar no mercado" className="pl-10" /></form>;
}

function MercadoPage() {
  const filters = mercadoRoute.useSearch();
  const navigate = mercadoRoute.useNavigate();

  const updateFilters = useCallback((updates: Partial<CatalogSearch>) => {
    void navigate({ search: (previous) => ({ ...previous, ...updates }) });
  }, [navigate]);

  return (
    <section>
      <header className="mb-12 border-b border-border pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Mercado Kurio</p>
        <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div><h1 className="text-4xl font-bold uppercase tracking-tight">Descubra sua próxima obra</h1><p className="mt-3 text-sm text-muted">Explore arte digital verificada em múltiplas redes.</p></div>
          <MarketSearch key={filters.search} initialValue={filters.search} onSearch={(search) => updateFilters({ search, page: 1 })} />
        </div>
      </header>

      <div className="grid items-start gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <CatalogSidebar key={`${filters.minPrice}-${filters.maxPrice}`} filters={filters} onChange={updateFilters} />
        <div className="min-w-0">
          <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
            <span className="text-xs font-bold text-primary">TODOS OS NFTs</span>
            <label className="flex items-center gap-2 text-[11px] text-muted">Ordenar por:
              <select value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value as NFTSort, page: 1 })} className="bg-background text-foreground outline-none">
                <option value="recent">Mais recentes</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option>
              </select>
            </label>
          </div>
          <NFTGrid params={{ ...filters, category: filters.category === 'all' ? undefined : filters.category, network: filters.network === 'all' ? undefined : filters.network, limit: 9 }} onPageChange={(page) => updateFilters({ page })} />
        </div>
      </div>
    </section>
  );
}

export const mercadoRoute = createRoute({ getParentRoute: () => rootRoute, path: '/mercado', validateSearch: validateCatalogSearch, component: MercadoPage });
