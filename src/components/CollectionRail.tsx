import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { getNFTs } from '../services/nftService';
import { KurioArtwork } from './KurioArtwork';

interface CollectionRailProps {
  title: string;
  excludeId?: string;
}

export function CollectionRail({ title, excludeId }: CollectionRailProps) {
  const { data, isPending } = useQuery({
    queryKey: ['nfts', 'collection-rail'],
    queryFn: () => getNFTs({ limit: 8 }),
  });
  const nfts = data?.data.filter((nft) => nft.id !== excludeId).slice(0, 5) ?? [];

  return (
    <section className="mt-24 pb-14">
      <h2 className="border-b border-border pb-2 text-base font-bold text-primary">{title}</h2>
      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {isPending
          ? Array.from({ length: 5 }, (_, index) => <div key={index} className="aspect-square animate-pulse bg-surface-raised" />)
          : nfts.map((nft) => (
            <Link key={nft.id} to="/nfts/$id" params={{ id: nft.id }} className="group min-w-0">
              <div className="bg-surface-raised p-3">
                <KurioArtwork variant={nft.artworkVariant} label={nft.title} className="aspect-square w-full rounded-[13px] transition duration-500 group-hover:scale-[1.02]" />
              </div>
              <h3 className="mt-3 truncate text-[13px] text-foreground group-hover:text-primary">{nft.title}</h3>
              <p className="text-sm font-bold text-primary">{nft.priceEth} ETH</p>
            </Link>
          ))}
      </div>
      <div className="mt-8 flex justify-center gap-2" aria-hidden="true">
        <span className="size-2.5 rounded-full border border-primary" />
        <span className="size-2.5 rounded-full bg-primary" />
        <span className="size-2.5 rounded-full border border-primary" />
      </div>
    </section>
  );
}
