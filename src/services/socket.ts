import { io } from 'socket.io-client';

export const marketplaceSocket = io(window.location.origin, {
  autoConnect: false,
  transports: ['websocket'],
});
