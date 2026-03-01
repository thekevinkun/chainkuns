"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { CATEGORIES, SORT_OPTIONS } from "@/lib/constants";

const EventFilters = () => {
  // Active category filter
  const [activeCategory, setActiveCategory] = useState("all");
  // Active sort option
  const [activeSort, setActiveSort] = useState("date_asc");

  // State to control dropdown visibility on mobile
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Ref to detect clicks outside the dropdown to close it
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

  return (
    <>
      {/* ── MOBILE: Chips + Filter button ── */}
      <div className="lg:hidden flex gap-2">
        {/* Scrollable category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 flex-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm border transition-colors whitespace-nowrap",
                activeCategory === cat.value
                  ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30"
                  : "text-text-secondary border-border hover:text-text-primary hover:border-border-hover",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter button + dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors whitespace-nowrap",
              isDropdownOpen
                ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30"
                : "text-text-secondary border-border hover:text-text-primary hover:border-border-hover",
            )}
          >
            {/* Filter icon */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 3h12M3 7h8M5 11h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Filters
          </button>

          {/* Dropdown panel */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 card-elevated p-5 flex flex-col gap-5">
              {/* Sort options */}
              <div className="flex flex-col gap-2">
                <h3 className="font-display font-bold text-text-primary text-sm uppercase tracking-wider">
                  Sort By
                </h3>
                <div className="flex flex-col gap-1">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setActiveSort(option.value)}
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
              </div>

              {/* Price range */}
              <div className="flex flex-col gap-2">
                <h3 className="font-display font-bold text-text-primary text-sm uppercase tracking-wider">
                  Price Range
                </h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-text-secondary text-xs mb-1 block">
                      Min (ETH)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="input-base text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-text-secondary text-xs mb-1 block">
                      Max (ETH)
                    </label>
                    <input
                      type="number"
                      placeholder="10.00"
                      step="0.01"
                      min="0"
                      className="input-base text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Reset + Close buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setActiveSort("date_asc");
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
        {/* Categories */}
        <div className="card-surface p-5 flex flex-col gap-3">
          <h3 className="font-display font-bold text-text-primary text-sm uppercase tracking-wider">
            Category
          </h3>
          <div className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  activeCategory === cat.value
                    ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="card-surface p-5 flex flex-col gap-3">
          <h3 className="font-display font-bold text-text-primary text-sm uppercase tracking-wider">
            Sort By
          </h3>
          <div className="flex flex-col gap-1">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveSort(option.value)}
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
        </div>

        {/* Price Range */}
        <div className="card-surface p-5 flex flex-col gap-3">
          <h3 className="font-display font-bold text-text-primary text-sm uppercase tracking-wider">
            Price Range
          </h3>
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
                className="input-base text-sm"
              />
            </div>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setActiveCategory("all");
            setActiveSort("date_asc");
          }}
          className="btn-ghost text-sm w-full"
        >
          Reset Filters
        </button>
      </aside>
    </>
  );
};

export default EventFilters;
