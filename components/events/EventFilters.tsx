"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { SORT_OPTIONS } from "@/lib/constants";

const EventFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial values from URL — so state survives refresh + back button
  const [activeSort, setActiveSort] = useState(
    searchParams.get("sort") ?? "date_asc",
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  // Dropdown visibility for mobile
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Push current filter state to URL — triggers server re-fetch
  const applyFilters = useCallback(
    (sort: string, min: string, max: string) => {
      const params = new URLSearchParams();

      // Only add params that have a meaningful value
      if (sort && sort !== "date_asc") params.set("sort", sort);
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);

      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`);
    },
    [router, pathname],
  );

  // Handle sort change — apply immediately
  const handleSortChange = (value: string) => {
    setActiveSort(value);
    applyFilters(value, minPrice, maxPrice);
  };

  // Handle price change — apply on blur to avoid firing on every keystroke
  const handlePriceBlur = () => {
    applyFilters(activeSort, minPrice, maxPrice);
  };

  // Reset everything
  const handleReset = () => {
    setActiveSort("date_asc");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname); // clear all params
  };

  // Shared sort buttons — used in both mobile and desktop
  const SortOptions = () => (
    <div className="flex flex-col gap-1">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSortChange(option.value)}
          className={cn(
            "text-left px-3 py-2 rounded-lg text-sm transition-colors",
            activeSort === option.value
              ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  // Shared price inputs — used in both mobile and desktop
  const PriceInputs = () => (
    <div className="flex flex-col gap-2">
      <div>
        <label className="text-text-secondary text-xs mb-1 block">
          Min (ETH)
        </label>
        <input
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          onBlur={handlePriceBlur} // only fires query when user leaves the field
          className="input-base text-sm"
        />
      </div>
      <div>
        <label className="text-text-secondary text-xs mb-1 block">
          Max (ETH)
        </label>
        <input
          type="number"
          placeholder="10.00"
          step="0.01"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          onBlur={handlePriceBlur}
          className="input-base text-sm"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* ── MOBILE: Chips + Filter button ── */}
      <div className="lg:hidden flex gap-2">
        {/* Scrollable sort chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 flex-1 scrollbar-hide">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm border transition-colors whitespace-nowrap",
                activeSort === option.value
                  ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30"
                  : "text-text-secondary border-border hover:text-text-primary hover:border-border-hover",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Filter button + dropdown (price range only on mobile) */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors whitespace-nowrap",
              isDropdownOpen || minPrice || maxPrice
                ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30"
                : "text-text-secondary border-border hover:text-text-primary hover:border-border-hover",
            )}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 3h12M3 7h8M5 11h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Price
            {/* Show dot indicator when price filter is active */}
            {(minPrice || maxPrice) && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 w-64 card-elevated p-5 flex flex-col gap-5">
              <PriceInputs />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleReset();
                    setIsDropdownOpen(false);
                  }}
                  className="btn-ghost text-sm flex-1"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="btn-secondary text-sm flex-1"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP: Vertical sidebar ── */}
      <aside className="hidden lg:flex flex-col gap-6 w-full">
        {/* Sort */}
        <div className="card-surface p-5 flex flex-col gap-3">
          <h3 className="font-display font-bold text-text-primary text-sm uppercase tracking-wider">
            Sort By
          </h3>
          <SortOptions />
        </div>

        {/* Price Range */}
        <div className="card-surface p-5 flex flex-col gap-3">
          <h3 className="font-display font-bold text-text-primary text-sm uppercase tracking-wider">
            Price Range
          </h3>
          <PriceInputs />
        </div>

        {/* Reset */}
        <button onClick={handleReset} className="btn-ghost text-sm w-full">
          Reset Filters
        </button>
      </aside>
    </>
  );
};

export default EventFilters;
