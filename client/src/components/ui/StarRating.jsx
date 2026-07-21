import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: 14,
  md: 18,
  lg: 24,
};

/**
 * StarRating
 * ----------
 * Two modes:
 *  - Interactive: pass `onChange` — click (and hover-preview) to set a value.
 *  - Read-only: omit `onChange` (or pass `readOnly`) — supports fractional
 *    values (e.g. 3.5/5 averages) via a partial-fill overlay per star.
 *
 * Props:
 *  value     number   current rating (0–max)
 *  onChange  fn(n)    optional — presence makes the control interactive
 *  max       number   default 5
 *  size      'sm'|'md'|'lg'   default 'md'
 *  readOnly  bool     force read-only even if onChange is passed
 *  showValue bool     also render "x.x/max" text next to the stars
 *  className string
 */
export default function StarRating({
  value = 0,
  onChange,
  max = 5,
  size = "md",
  readOnly = false,
  showValue = false,
  className,
}) {
  const [hovered, setHovered] = useState(null);
  const interactive = !!onChange && !readOnly;
  const px = SIZES[size] || SIZES.md;
  const display = hovered ?? value;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className="inline-flex items-center gap-0.5"
        onMouseLeave={() => interactive && setHovered(null)}
        role={interactive ? "radiogroup" : "img"}
        aria-label={`Rating: ${value} out of ${max}`}
      >
        {Array.from({ length: max }, (_, i) => {
          const starIndex = i + 1;
          const fillPercent = Math.max(
            0,
            Math.min(1, display - i)
          ) * 100;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange(starIndex)}
              onMouseEnter={() => interactive && setHovered(starIndex)}
              className={cn(
                "relative leading-none",
                interactive
                  ? "cursor-pointer transition-transform hover:scale-110"
                  : "cursor-default"
              )}
              style={{ width: px, height: px }}
              aria-label={`${starIndex} star${starIndex > 1 ? "s" : ""}`}
            >
              {/* Empty (background) star */}
              <Star
                size={px}
                strokeWidth={1.5}
                style={{ color: "var(--border)" }}
                className="absolute inset-0"
              />
              {/* Filled star, clipped to the rated percentage */}
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <Star
                  size={px}
                  strokeWidth={1.5}
                  fill="var(--warning)"
                  style={{ color: "var(--warning)" }}
                />
              </span>
            </button>
          );
        })}
      </div>

      {showValue && (
        <span
          className="text-[12px] font-medium tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          {Number(value).toFixed(1)}/{max}
        </span>
      )}
    </div>
  );
}