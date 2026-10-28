import { useQuery } from '@tanstack/react-query';

import { getNFTs, type GetNFTsParams } from '../services/nftService';
import NFTCard from './NFTCard';
import NFTSkeleton from './NFTSkeleton';
import Pagination from './Pagination';

interface NFTGridProps {
  params: GetNFTsParams;
  onPageChange: (page: number) => void;
}

const SKELETON_COUNT = 8;

export function NFTGrid({ params, onPageChange }: NFTGridProps) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['nfts', params],
    queryFn: () => getNFTs(params),
  });

  if (isError) {
    return (
    <div className="border border-border bg-surface p-8 text-center">
        <p className="font-medium text-foreground">
          Não foi possível carregar os NFTs.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-[3px] bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!isPending && data.data.length === 0) {
    return (
      <div className="border border-dashed border-border p-12 text-center text-muted">
        Nenhum NFT encontrado.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-7 md:gap-y-12">
        {isPending
          ? Array.from({ length: SKELETON_COUNT }, (_, index) => <NFTSkeleton key={index} />)
          : data.data.map((nft) => <NFTCard key={nft.id} nft={nft} />)}
      </div>
      {!isPending && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

export default NFTGrid;
