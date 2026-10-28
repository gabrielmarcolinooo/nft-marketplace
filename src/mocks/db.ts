import kurioCollection from '../assets/kurio-ape-collection.png';
import type { NFT } from '../types';

const sharedMetadata = {
  collection: 'Kurio Apes',
  contractAddress: '0x7A42...19E8',
  royaltyPercentage: 5,
  reviewCount: 19,
} satisfies Partial<NFT>;

export const initialNFTs: NFT[] = [
  { ...sharedMetadata, id: 'nft-1', tokenId: '0042', title: 'Emerald Ape #042', description: 'Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.', image: kurioCollection, priceEth: '1.19', edition: '1/50', availableQuantity: 7, category: 'Arte digital', attributes: ['Óculos', 'Esmeralda', 'Raro'], isFavorite: true, network: 'Ethereum', artworkVariant: 0 },
  { ...sharedMetadata, id: 'nft-2', tokenId: '0009', title: 'Sage Nomad #009', description: 'Viajante digital de edição limitada.', image: kurioCollection, priceEth: '1.69', edition: '1/25', availableQuantity: 4, category: 'Colecionáveis', attributes: ['Chapéu', 'Sálvia'], isFavorite: false, network: 'Polygon', artworkVariant: 1 },
  { ...sharedMetadata, id: 'nft-3', tokenId: '0552', title: 'Neon Vessel #552', description: 'Retrato raro da série Vessel.', image: kurioCollection, priceEth: '1.99', edition: '1/10', availableQuantity: 2, category: 'Arte 3D', attributes: ['Marfim', 'Raro'], isFavorite: false, network: 'Ethereum', artworkVariant: 2 },
  { ...sharedMetadata, id: 'nft-4', tokenId: '0118', title: 'Cosmic Bloom #118', description: 'Uma edição cósmica de tiragem limitada.', image: kurioCollection, priceEth: '1.29', edition: '4/30', availableQuantity: 8, category: 'Arte digital', attributes: ['Cósmico', 'Violeta'], isFavorite: false, network: 'Solana', artworkVariant: 1 },
  { ...sharedMetadata, id: 'nft-5', tokenId: '0314', title: 'Violet Nomad #314', description: 'Nômade da coleção Genesis.', image: kurioCollection, priceEth: '1.39', edition: '2/20', availableQuantity: 6, category: 'Colecionáveis', attributes: ['Violeta', 'Nômade'], isFavorite: true, network: 'Polygon', artworkVariant: 1 },
  { ...sharedMetadata, id: 'nft-6', tokenId: '0088', title: 'Ivory Baron #088', description: 'Barão digital de procedência verificada.', image: kurioCollection, priceEth: '1.79', edition: '1/15', availableQuantity: 9, category: 'Fotografia', attributes: ['Marfim', 'Barão'], isFavorite: false, network: 'Ethereum', artworkVariant: 2 },
  { ...sharedMetadata, id: 'nft-7', tokenId: '0207', title: 'Golden Beat #207', description: 'Som, cultura e arte digital em uma edição.', image: kurioCollection, priceEth: '0.99', edition: '8/50', availableQuantity: 12, category: 'Música', attributes: ['Dourado', 'Som'], isFavorite: false, network: 'Solana', artworkVariant: 3 },
  { ...sharedMetadata, id: 'nft-8', tokenId: '0071', title: 'Golden Frequency #071', description: 'Frequência rara da coleção Kurio Beats.', image: kurioCollection, priceEth: '0.59', edition: '11/75', availableQuantity: 17, category: 'Música', attributes: ['Dourado', 'Frequência'], isFavorite: false, network: 'Polygon', artworkVariant: 3 },
  { ...sharedMetadata, id: 'nft-9', tokenId: '0160', title: 'Golden Signal #160', description: 'Sinal dourado cunhado na rede Ethereum.', image: kurioCollection, priceEth: '0.39', edition: '16/100', availableQuantity: 20, category: 'Utilidade', attributes: ['Dourado', 'Sinal'], isFavorite: true, network: 'Ethereum', artworkVariant: 3 },
  { ...sharedMetadata, id: 'nft-10', tokenId: '0010', title: 'Cyber Ape #010', description: 'NFT exclusivo da coleção Kurio.', image: kurioCollection, priceEth: '1.49', edition: '1/20', availableQuantity: 5, category: 'Arte digital', attributes: ['Cyber', 'Esmeralda'], isFavorite: false, network: 'Ethereum', artworkVariant: 0 },
];
