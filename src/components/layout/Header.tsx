import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useRouterState, useSearch } from '@tanstack/react-router';
import { Heart, Home, LogIn, Search, ShoppingCart, UserRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { getCart } from '../../services/marketplaceService';
import { AuthModal } from '../AuthModal';
import { useAuth } from '../../contexts/AuthContext';

const DEFAULT_SEARCH = { search: '', category: 'all', sort: 'recent' as const, page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' };
const navClass = 'relative flex items-center text-sm text-foreground/80 transition hover:text-primary';
const activeNavClass = 'text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary';

function SearchControl({ initialValue }: { initialValue: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigate({
      to: '/mercado',
      search: (previous) => ({
        search: value.trim(),
        category: previous.category ?? 'all',
        sort: previous.sort ?? 'recent',
        page: 1,
        network: previous.network ?? 'all',
        minPrice: previous.minPrice ?? '0.02',
        maxPrice: previous.maxPrice ?? '12.30',
      }),
    });
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <Button type="button" variant="ghost" size="icon" aria-label="Buscar NFTs" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
        <Search className="size-[19px]" />
      </Button>
      {isOpen && (
        <form onSubmit={submit} className="absolute right-0 top-12 z-50 flex w-[min(21rem,calc(100vw-2rem))] gap-2 border border-border bg-surface p-3 shadow-glow">
          <Input autoFocus value={value} onChange={(event) => setValue(event.target.value)} placeholder="Buscar NFTs" aria-label="Buscar NFTs" />
          <Button size="sm" type="submit">Buscar</Button>
        </form>
      )}
    </div>
  );
}

export function Header() {
  const { user, authOpen, authTab, openAuth, closeAuth } = useAuth();
  const currentSearch = useSearch({ strict: false }) as { search?: string };
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const marketIsActive = pathname === '/mercado' || pathname.startsWith('/nfts/') || pathname === '/carrinho' || pathname === '/pagamento';
  const homeIsActive = pathname === '/' || pathname === '/perfil';
  const hideBottomNavigation = pathname.startsWith('/nfts/') || pathname === '/carrinho' || pathname === '/pagamento';
  const { data: cart = [] } = useQuery({ queryKey: ['cart'], queryFn: getCart });
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 hidden bg-background/95 backdrop-blur-md md:block">
        <div className="relative mx-auto flex h-[68px] w-full max-w-[1600px] items-stretch border-b border-border/60 px-5 md:w-5/6 md:px-0">
        <Link to="/" search={DEFAULT_SEARCH} className="flex items-center text-[13px] font-bold tracking-[0.14em] text-foreground">KURIO</Link>

        <nav className="absolute left-1/2 top-0 hidden h-full -translate-x-1/2 items-stretch gap-10 md:flex" aria-label="Navegação principal">
          <Link to="/" search={DEFAULT_SEARCH} activeOptions={{ exact: true }} className={`${navClass} ${homeIsActive ? activeNavClass : ''}`}>Início</Link>
          <Link to="/mercado" search={DEFAULT_SEARCH} className={`${navClass} ${marketIsActive ? activeNavClass : ''}`}>Mercado</Link>
          <Link to="/criadores" className={navClass} activeProps={{ className: activeNavClass }}>Criadores</Link>
          <Link to="/aprenda" search={{ category: 'all' }} className={navClass} activeProps={{ className: activeNavClass }}>Aprenda</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <SearchControl key={currentSearch.search ?? ''} initialValue={currentSearch.search ?? ''} />
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/carrinho" aria-label={`Abrir carrinho com ${cartCount} item(ns)`}>
              <ShoppingCart className="size-[19px]" />
              {cartCount > 0 && <span className="absolute right-0.5 top-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>
          </Button>
          {user ? (
            <Button asChild size="sm" className="hidden max-w-[180px] sm:inline-flex"><Link to="/perfil"><UserRound className="size-4" /><span className="truncate">{user.name}</span></Link></Button>
          ) : (
            <Button type="button" size="sm" className="hidden sm:inline-flex" onClick={() => openAuth('login')}><LogIn className="size-4" />Entrar</Button>
          )}
        </div>
        </div>
      </header>
      {!hideBottomNavigation && (
        <nav data-testid="mobile-bottom-navigation" className="fixed inset-x-0 bottom-0 z-[70] mx-auto flex h-[86px] w-full max-w-[430px] items-center justify-around rounded-t-[30px] border-t border-border bg-[#241612] px-5 pb-[env(safe-area-inset-bottom)] shadow-2xl md:hidden" aria-label="Navegação principal móvel">
          <Link to="/" search={DEFAULT_SEARCH} aria-label="Início" className={`grid min-w-14 place-items-center gap-1 text-[10px] ${pathname === '/' ? 'text-primary' : 'text-[#cfb28c]'}`}><Home className="size-5" fill={pathname === '/' ? 'currentColor' : 'none'} /><span>Início</span></Link>
          <Link to="/mercado" search={DEFAULT_SEARCH} aria-label="Favoritos" className="grid min-w-14 place-items-center gap-1 text-[10px] text-[#cfb28c]"><Heart className="size-5" /><span>Favoritos</span></Link>
          <Link to="/carrinho" aria-label={`Carrinho com ${cartCount} item(ns)`} className="relative grid min-w-14 place-items-center gap-1 text-[10px] text-[#cfb28c]"><ShoppingCart className="size-5" /><span>Carrinho</span>{cartCount > 0 && <span className="absolute right-2 top-0 grid size-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground">{cartCount}</span>}</Link>
          {user ? <Link to="/perfil" aria-label="Perfil" className="grid min-w-14 place-items-center gap-1 text-[10px] text-[#cfb28c]"><UserRound className="size-5" /><span>Perfil</span></Link> : <button type="button" aria-label="Perfil" onClick={() => openAuth('login')} className="grid min-w-14 place-items-center gap-1 text-[10px] text-[#cfb28c]"><UserRound className="size-5" /><span>Perfil</span></button>}
        </nav>
      )}
      <AuthModal key={authTab} open={authOpen} initialTab={authTab} onClose={closeAuth} />
    </>
  );
}
