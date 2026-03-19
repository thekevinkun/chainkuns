export default function EventDetailLoading() {
  return (
    <main className="min-h-screen">
      {/* Hero banner skeleton */}
      <div className="relative w-full h-96 skeleton" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: event info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-9 w-3/4 rounded skeleton" />
            <div className="space-y-2">
              <div className="h-4 w-48 rounded skeleton" />
              <div className="h-4 w-36 rounded skeleton" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded skeleton" />
              <div className="h-4 w-full rounded skeleton" />
              <div className="h-4 w-2/3 rounded skeleton" />
            </div>
          </div>

          {/* Right: buy ticket card */}
          <div className="card-surface p-6 space-y-4 h-fit">
            <div className="h-6 w-24 rounded skeleton" />
            <div className="h-10 w-full rounded skeleton" />
            <div className="h-4 w-32 rounded skeleton" />
            <div className="h-12 w-full rounded-lg skeleton" />
          </div>
        </div>
      </div>
    </main>
  );
}
