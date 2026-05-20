"use client";

import { ceToHijri, tickEvery } from "@/lib/timeline";

type Props = {
  yearAt: (px: number) => number;
  pxAt: (year: number) => number;
  width: number;
  pxPerYear: number;
};

/**
 * Dual-calendar axis. Major ticks show both CE and Hijri (approx.) years;
 * minor ticks are unlabeled. Important anchors (Hijra = 622, prophethood
 * start = 610) get bolded labels.
 */
export default function TimeAxis({ yearAt, pxAt, width, pxPerYear }: Props) {
  const { step, majorEvery } = tickEvery(pxPerYear);
  const startYear = Math.floor(yearAt(0));
  const endYear = Math.ceil(yearAt(width));
  const firstTick = Math.ceil(startYear / step) * step;

  const ticks: { year: number; major: boolean }[] = [];
  for (let y = firstTick; y <= endYear; y += step) {
    const major = ((y - firstTick) / step) % majorEvery === 0;
    ticks.push({ year: y, major });
  }

  return (
    <g className="time-axis">
      <line
        x1={0}
        x2={width}
        y1={0}
        y2={0}
        stroke="#0f172a22"
        strokeWidth={1}
      />
      {ticks.map(({ year, major }) => {
        const x = pxAt(year);
        const isAnchor = year === 610 || year === 622;
        return (
          <g key={year} transform={`translate(${x}, 0)`}>
            <line
              y1={-2}
              y2={major ? 8 : 4}
              stroke={isAnchor ? "#0d7c66" : "#0f172a44"}
              strokeWidth={isAnchor ? 1.5 : 1}
            />
            {major && (
              <>
                <text
                  y={22}
                  textAnchor="middle"
                  className={`fill-ink ${isAnchor ? "font-semibold" : ""}`}
                  fontSize={11}
                >
                  {year}
                </text>
                <text
                  y={36}
                  textAnchor="middle"
                  className="fill-ink-muted"
                  fontSize={10}
                >
                  {ceToHijri(year) >= 0 ? `${ceToHijri(year)} H` : `${-ceToHijri(year)} BH`}
                </text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}
