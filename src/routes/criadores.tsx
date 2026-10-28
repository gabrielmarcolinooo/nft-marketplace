/* eslint-disable react-refresh/only-export-components */
import { Link, createRoute } from '@tanstack/react-router';
import { KurioArtwork } from '../components/KurioArtwork';
import { Button } from '../components/ui/button';
import { rootRoute } from './__root';

const creators = [
  { name: 'Nova Sato', handle: '@novasato', volume: '128.40', items: 42, followers: '18,2 mil', variant: 0 },
  { name: 'Kurio Studios', handle: '@kuriostudios', volume: '96.18', items: 68, followers: '15,7 mil', variant: 2 },
  { name: 'CyberApe Lab', handle: '@cyberapelab', volume: '84.70', items: 31, followers: '12,9 mil', variant: 1 },
  { name: 'Golden Frequency', handle: '@goldenfreq', volume: '72.35', items: 57, followers: '10,4 mil', variant: 3 },
  { name: 'Ivory Lab', handle: '@ivorylab', volume: '61.09', items: 24, followers: '8,8 mil', variant: 2 },
  { name: 'Genesis Club', handle: '@genesisclub', volume: '49.82', items: 39, followers: '7,3 mil', variant: 0 },
] as const;

const marketSearch = { search: '', category: 'all', sort: 'recent' as const, page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' };

function CriadoresPage() {
  return (
    <>
      <section className="grid min-h-[430px] items-center gap-12 pb-16 pt-2 lg:grid-cols-[1.3fr_0.8fr]">
        <div className="max-w-[680px] text-left">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.12em] text-muted">Artistas em destaque</p>
          <h1 className="text-[clamp(2.25rem,4vw,3.25rem)] font-bold uppercase leading-[1.28] tracking-[-0.045em] text-foreground">Conheça as mentes<br />por trás da arte</h1>
          <p className="mt-5 max-w-[620px] text-sm leading-7 text-muted">Descubra artistas e estúdios independentes que transformam ideias em coleções verificadas e moldam a nova cultura digital.</p>
          <Button asChild className="mt-7 px-7 uppercase"><a href="#ranking">Explorar criadores</a></Button>
        </div>
        <div className="relative mx-auto w-full max-w-[410px]">
          <KurioArtwork variant={3} label="Criador da coleção Kurio" className="aspect-square w-full rounded-[28px]" />
          <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 gap-2"><span className="size-2 rounded-full bg-primary" /><span className="size-2 rounded-full bg-primary" /><span className="size-2 rounded-full bg-primary/60" /></div>
        </div>
      </section>

      <section id="ranking" className="pt-10">
        <div className="mb-8 border-b border-border/70 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Ranking de criadores</p>
          <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight text-foreground">Perfis que estão moldando o futuro</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator, index) => (
            <article key={creator.name} className="group overflow-hidden rounded-xl bg-surface">
              <div className="relative overflow-hidden">
                <KurioArtwork variant={creator.variant} label={creator.name} className="aspect-square w-full transition duration-500 group-hover:scale-[1.025]" />
                <span className="absolute left-4 top-4 grid size-9 place-items-center rounded-full bg-background/90 text-xs font-bold text-primary">#{index + 1}</span>
              </div>
              <div className="p-6">
                <p className="text-[10px] text-muted">{creator.handle}</p>
                <h3 className="mt-1 text-lg font-bold text-foreground">{creator.name}</h3>
                <div className="my-5 grid grid-cols-3 border-y border-border py-4">
                  <div><p className="text-[8px] uppercase text-muted">Volume</p><p className="mt-1 font-mono text-xs font-bold text-primary">{creator.volume} ETH</p></div>
                  <div className="border-l border-border pl-3"><p className="text-[8px] uppercase text-muted">Itens</p><p className="mt-1 font-mono text-xs font-bold text-foreground">{creator.items}</p></div>
                  <div className="border-l border-border pl-3"><p className="text-[8px] uppercase text-muted">Seguidores</p><p className="mt-1 font-mono text-xs font-bold text-foreground">{creator.followers}</p></div>
                </div>
                <Button asChild className="w-full uppercase"><Link to="/mercado" search={marketSearch}>Ver coleção →</Link></Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export const criadoresRoute = createRoute({ getParentRoute: () => rootRoute, path: '/criadores', component: CriadoresPage });
