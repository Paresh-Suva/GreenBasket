import React from "react";
import { Star, StarHalf } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  count?: number;
  showCount?: boolean;
  className?: string;
  starSize?: number;
}

export function RatingStars({
  rating,
  count = 0,
  showCount = false,
  className = "",
  starSize = 16
}: RatingStarsProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const roundedFull = rating % 1 >= 0.75 ? fullStars + 1 : fullStars;

  for (let i = 1; i <= 5; i++) {
    if (i <= roundedFull) {
      stars.push(
        <Star
          key={i}
          size={starSize}
          className="fill-amber-400 text-amber-400"
        />
      );
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(
        <StarHalf
          key={i}
          size={starSize}
          className="fill-amber-400 text-amber-400"
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          size={starSize}
          className="text-slate-300"
        />
      );
    }
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">{stars}</div>
      {showCount && (
        <span className="text-xs text-muted-foreground font-medium">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
