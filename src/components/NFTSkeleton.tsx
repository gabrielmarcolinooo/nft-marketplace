export function NFTSkeleton() {
  const shimmer = 'relative overflow-hidden bg-surface-raised before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-primary/10 before:to-transparent';

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden bg-surface"
    >
      <div className={`aspect-square ${shimmer}`} />
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className={`h-3 w-24 rounded ${shimmer}`} />
          <div className={`h-6 w-3/4 rounded ${shimmer}`} />
        </div>
        <div className="flex items-end justify-between border-t border-border pt-4">
          <div className="space-y-2">
            <div className={`h-3 w-16 rounded ${shimmer}`} />
            <div className={`h-5 w-24 rounded ${shimmer}`} />
          </div>
          <div className={`h-10 w-24 rounded-lg ${shimmer}`} />
        </div>
      </div>
    </div>
  );
}

export default NFTSkeleton;
