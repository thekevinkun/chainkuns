"use client";

import Skeleton from "@/components/ui/Skeleton";

const ListingGridSkeleton = () => {
  return (
    // show 8 skeleton cards while data loads
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  );
};

export default ListingGridSkeleton;
