import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-surface-secondary rounded-xl border border-border"></div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 h-[300px] bg-surface-secondary rounded-xl border border-border"></div>
        <div className="h-[300px] bg-surface-secondary rounded-xl border border-border"></div>
      </div>

      {/* Table Skeleton */}
      <div className="h-[600px] bg-surface-secondary rounded-xl border border-border p-6">
        <div className="h-8 bg-surface-tertiary rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-surface-tertiary rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatCardSkeletonProps {
  count?: number;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 rounded-xl border border-border bg-surface-primary animate-pulse">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="h-4 bg-surface-tertiary rounded w-24 mb-2"></div>
              <div className="h-8 bg-surface-tertiary rounded w-32"></div>
            </div>
            <div className="w-10 h-10 bg-surface-tertiary rounded-lg"></div>
          </div>
          <div className="mt-4 h-3 bg-surface-tertiary rounded w-20"></div>
        </div>
      ))}
    </>
  );
};
