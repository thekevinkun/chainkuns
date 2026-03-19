import { ListingGridSkeleton } from "@/components/marketplace";

export default function MarketplaceLoading() {
  return (
    <main className="min-h-screen">
      {/* Matches Marketplace page header */}
      <section className="border-b border-border bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-3">
            <div className="h-3 w-36 rounded skeleton" />
            <div className="h-10 w-56 rounded skeleton" />
            <div className="h-4 w-96 rounded skeleton" />
          </div>
        </div>
      </section>

      {/* Listings grid skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ListingGridSkeleton />
      </section>
    </main>
  );
}
