export default function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card bg-base-200 shadow-md animate-pulse">
          <div className="card-body">
            <div className="h-4 bg-base-300 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-base-300 rounded w-full mb-2"></div>
            <div className="h-3 bg-base-300 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
