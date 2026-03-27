export function SkeletonLine({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`}
      role="presentation"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonLine className="h-8 w-48" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-5/6" />
          <SkeletonLine className="h-4 w-4/6" />
        </div>
        <div className="space-y-3">
          <SkeletonLine className="h-24 w-full rounded-2xl" />
          <SkeletonLine className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
