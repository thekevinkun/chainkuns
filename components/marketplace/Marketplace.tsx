import { Suspense } from "react";
import { getListings } from "@/app/actions/listing";
import { ListingGrid, ListingGridSkeleton } from "@/components/marketplace";

// ListingsContent
// Fetches and renders listings — wrapped in Suspense
const ListingsContent = async () => {
  const result = await getListings();

  // if fetch failed show error state
  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="text-5xl">⚠️</span>
        <p className="text-text-secondary text-center">
          Failed to load listings. Please try again later.
        </p>
      </div>
    );
  }

  return <ListingGrid listings={result.data} />;
};

const Marketplace = () => {
  return (
    <main className="min-h-screen">
      {/* Page header */}
      <section className="border-b border-border bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-3">
            {/* Badge */}
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-cyan">
              Resale Marketplace
            </span>

            <h1 className="section-heading text-text-primary">
              Buy & Sell Tickets
            </h1>

            <p className="text-text-secondary max-w-xl">
              Browse peer-to-peer ticket listings from other fans. Every resale
              automatically pays royalties to the organizer — enforced on-chain,
              no middleman needed.
            </p>
          </div>
        </div>
      </section>

      {/* Listings grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<ListingGridSkeleton />}>
          <ListingsContent />
        </Suspense>
      </section>
    </main>
  );
};

export default Marketplace;
