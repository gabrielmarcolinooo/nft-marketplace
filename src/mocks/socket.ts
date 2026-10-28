import { toSocketIo } from '@mswjs/socket.io-binding';
import { ws } from 'msw';
import type { NFT, Order } from '../types';

interface MockSocketServer {
  emit: (event: string, ...data: unknown[]) => void;
}

const socketServers = new Set<MockSocketServer>();
const realtime = ws.link(/\/socket\.io\/?$/);

export const socketHandler = realtime.addEventListener('connection', (connection) => {
  const io = toSocketIo(connection);
  socketServers.add(io.server);
  io.server.emit('ready', { connectedAt: new Date().toISOString() });

  connection.client.addEventListener('close', () => {
    socketServers.delete(io.server);
  });
});

export function emitNFTUpdated(nft: NFT) {
  socketServers.forEach((server) => server.emit('nft.updated', nft));
}

export function emitOrderUpdated(order: Order) {
  socketServers.forEach((server) => server.emit('order.updated', order));
}
