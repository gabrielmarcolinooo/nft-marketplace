import { createRouter } from '@tanstack/react-router';

import { rootRoute } from './routes/__root';
import { indexRoute } from './routes';
import { mercadoRoute } from './routes/mercado';
import { criadoresRoute } from './routes/criadores';
import { aprendaRoute } from './routes/aprenda';
import { cartRoute } from './routes/carrinho';
import { nftDetailsRoute } from './routes/nfts/$id';
import { paymentRoute } from './routes/pagamento';
import { profileRoute } from './routes/perfil';

const routeTree = rootRoute.addChildren([indexRoute, mercadoRoute, criadoresRoute, aprendaRoute, nftDetailsRoute, cartRoute, paymentRoute, profileRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
