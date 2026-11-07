"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
  Adapted from Beautiful UI "Loading State" (MIT, Shane Levine).
  Localized: Dots variant, Chinese label, host tokens, no demo video.
*/

const delays = Array.from({ length: 9 }, (_, i) => {
  const r = Math.floor(i / 3);
  const c = i % 3;
  return (c + Math.abs(r - 1)) * 90;
});

export function useElapsed(active: boolean) {
  const [ds, setDs] = useState(0);

  useEffect(() => {
    if (!active) return;
    setDs(0);
    const t = setInterval(() => setDs((d) => d + 1), 100);
    return () => clearInterval(t);
  }, [active]);

  const total = ds / 10;
  if (total < 60) return `${total.toFixed(1)} 秒`;
  return `${Math.floor(total / 60)} 分 ${(total % 60).toFixed(1)} 秒`;
}

export default function RewriteLoader({
  label = "正在去掉套话",
}: {
  label?: string;
}) {
  const reduce = useReducedMotion();
  const elapsed = useElapsed(true);

  return (
    <div role="status" aria-live="polite" className="flex w-fit items-center gap-2.5">
      <span aria-hidden className="grid shrink-0 grid-cols-[repeat(3,4px)] gap-[1.5px]">
        {delays.map((delay, index) => (
          <span
            key={index}
            className="size-[4px] rounded-full bg-ink"
            style={{
              opacity: reduce ? 0.35 : 0.15,
              animation: reduce
                ? "none"
                : `pixel-on 650ms ease-in-out ${delay}ms infinite`,
            }}
          />
        ))}
      </span>
      <span
        className="text-[13px] font-medium text-muted"
        style={
          reduce
            ? undefined
            : {
                backgroundImage:
                  "linear-gradient(90deg, var(--muted) 35%, var(--ink) 50%, var(--muted) 65%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                animation: "shimmer-text 1.4s linear infinite",
              }
        }
      >
        {label}
      </span>
      <span className="font-mono text-[12px] tabular-nums text-muted">{elapsed}</span>
    </div>
  );
}
