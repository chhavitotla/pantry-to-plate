import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-chefmate-oat-deep bg-white/80 p-6 shadow-soft"
        >
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-4 h-8 w-3/4" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <Skeleton className="mt-8 h-12 w-full" />
        </div>
      ))}
    </div>
  );
}
