import { EventCardSkeleton } from "@/components/ui/Skeleton";

export default function EventsLoading() {
  return (
    <main className="min-h-screen">
      {/* Matches BrowseEvents page header */}
      <section className="border-b border-border bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-3">
            <div className="h-3 w-28 rounded skeleton" />
            <div className="h-10 w-64 rounded skeleton" />
            <div className="h-4 w-96 rounded skeleton" />
          </div>
        </div>
      </section>

      {/* Matches filters + grid layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton — desktop only */}
          <div className="hidden lg:flex flex-col gap-6 w-56 shrink-0">
            <div className="card-surface p-5 space-y-3">
              <div className="h-4 w-16 rounded skeleton" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 rounded-lg skeleton" />
              ))}
            </div>
            <div className="card-surface p-5 space-y-3">
              <div className="h-4 w-24 rounded skeleton" />
              <div className="h-8 rounded-lg skeleton" />
              <div className="h-8 rounded-lg skeleton" />
            </div>
          </div>

          {/* Event grid skeleton */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
