export function Skeleton({ height = 16, width = "100%", radius = 8, className = "" }) {
  return (
    <span
      className={`sf-skeleton ${className}`}
      style={{
        display: "inline-block",
        height,
        width,
        borderRadius: radius,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      className="rounded-xl flex flex-col overflow-hidden"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <Skeleton width="100%" height={110} radius={0} />
      <div className="flex flex-col gap-2 p-2">
        <Skeleton width="75%" height={13} />
        <Skeleton width="50%" height={11} />
        <Skeleton width="55%" height={20} radius={6} />
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(228,96,51,0.08)" }}
        >
          <Skeleton width={36} height={36} radius={999} />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton width="40%" />
            <Skeleton width="65%" height={12} />
          </div>
          <Skeleton width={80} height={28} radius={999} />
        </div>
      ))}
    </div>
  );
}
