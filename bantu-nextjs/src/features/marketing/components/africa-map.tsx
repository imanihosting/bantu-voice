"use client";

import { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";

import type { CountryData } from "../data/africa-map-data";
import {
  AFRICA_BACKGROUND_PATHS,
  SOUTHERN_AFRICA_COUNTRIES,
} from "../data/africa-map-data";

export function AfricaMap() {
  const [activeCountry, setActiveCountry] = useState<CountryData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handlePointerEnter = useCallback(
    (country: CountryData, e: React.PointerEvent<SVGPathElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 12,
      });
      setActiveCountry(country);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGPathElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 12,
      });
    },
    [],
  );

  const handlePointerLeave = useCallback(() => {
    setActiveCountry(null);
  }, []);

  const handleClick = useCallback(
    (country: CountryData) => {
      setActiveCountry((prev) => (prev?.id === country.id ? null : country));
    },
    [],
  );

  return (
    <div className="relative w-full">
      {/* SVG Map */}
      <svg
        ref={svgRef}
        viewBox="340 420 210 210"
        className="h-auto w-full"
        role="img"
        aria-label="Interactive map of Africa highlighting supported language regions"
      >
        {/* Background Africa countries (dimmed, non-interactive) */}
        <g>
          {AFRICA_BACKGROUND_PATHS.map((region) => (
            <path
              key={region.id}
              d={region.d}
              fill="white"
              fillOpacity={0.05}
              stroke="white"
              strokeOpacity={0.08}
              strokeWidth={0.3}
            />
          ))}
        </g>

        {/* Southern Africa countries (interactive) */}
        <g>
          {SOUTHERN_AFRICA_COUNTRIES.map((country) => {
            const isActive = activeCountry?.id === country.id;
            const isComingSoon = country.languages.every((l) => l.comingSoon);

            return (
              <path
                key={country.id}
                d={country.svgPath}
                role="button"
                tabIndex={0}
                aria-label={`${country.name}: ${country.languages.map((l) => l.name).join(", ")}`}
                className="cursor-pointer outline-none transition-all duration-200"
                fill={
                  isActive
                    ? isComingSoon
                      ? "rgba(251, 191, 36, 0.4)"
                      : "rgba(251, 191, 36, 0.6)"
                    : isComingSoon
                      ? "rgba(251, 191, 36, 0.1)"
                      : "rgba(251, 191, 36, 0.25)"
                }
                stroke="rgba(251, 191, 36, 0.5)"
                strokeWidth={isActive ? 1.0 : 0.5}
                style={
                  isActive
                    ? { filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))" }
                    : undefined
                }
                onPointerEnter={(e) => handlePointerEnter(country, e)}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onClick={() => handleClick(country)}
                onFocus={() => setActiveCountry(country)}
                onBlur={() => setActiveCountry(null)}
              />
            );
          })}
        </g>
      </svg>

      {/* Tooltip — desktop (follows cursor) */}
      {activeCountry && (
        <div
          className="pointer-events-none absolute z-10 hidden min-w-[180px] -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-black/90 px-4 py-3 shadow-xl backdrop-blur-sm md:block"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <p className="mb-2 text-sm font-semibold text-white">
            {activeCountry.name}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeCountry.languages.map((lang) => (
              <Badge
                key={lang.name}
                variant="outline"
                className={
                  lang.comingSoon
                    ? "border-white/10 bg-white/5 text-xs text-white/40"
                    : "border-amber-500/30 bg-amber-500/10 text-xs text-amber-300"
                }
              >
                {lang.name}
                {lang.comingSoon && (
                  <span className="ml-1 text-[10px] text-white/30">Soon</span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tooltip — mobile (fixed card below map) */}
      {activeCountry && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 md:hidden">
          <p className="mb-2 text-sm font-semibold text-white">
            {activeCountry.name}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeCountry.languages.map((lang) => (
              <Badge
                key={lang.name}
                variant="outline"
                className={
                  lang.comingSoon
                    ? "border-white/10 bg-white/5 text-xs text-white/40"
                    : "border-amber-500/30 bg-amber-500/10 text-xs text-amber-300"
                }
              >
                {lang.name}
                {lang.comingSoon && (
                  <span className="ml-1 text-[10px] text-white/30">Soon</span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
