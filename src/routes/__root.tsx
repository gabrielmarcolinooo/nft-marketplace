/* eslint-disable react-refresh/only-export-components */
import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useMarketplaceSocket } from '../hooks/useMarketplaceSocket';

function RootLayout() {
  useMarketplaceSocket();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const hideFooter = pathname === '/perfil';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-[1600px] px-5 pb-28 pt-5 md:w-5/6 md:px-0 md:pb-10 md:pt-8">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export const rootRoute = createRootRoute({ component: RootLayout });
