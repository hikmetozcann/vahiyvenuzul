"use client";

import { MAP_HEIGHT, MAP_WIDTH } from "./projection";

/**
 * Stylized parchment basemap of the Arabian peninsula + Red Sea region.
 *
 * Aesthetic: scholarly antique map, restrained palette. Coastlines are
 * approximated by hand-tuned bezier curves — recognizable as the peninsula
 * without being literal cartography. Topography is suggested by sparse
 * mountain glyphs and faint contour strokes along the western Hijaz.
 */
export default function BaseMap() {
  return (
    <g aria-hidden>
      <defs>
        <linearGradient id="map-sea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#bcc9d1" />
          <stop offset="100%" stopColor="#9eb3bf" />
        </linearGradient>
        <linearGradient id="map-land" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ede0c4" />
          <stop offset="100%" stopColor="#d8c69b" />
        </linearGradient>
        <pattern
          id="map-grain"
          x="0"
          y="0"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <rect width="3" height="3" fill="transparent" />
          <circle cx="1" cy="1" r="0.3" fill="#8a7350" opacity="0.18" />
        </pattern>
        <filter id="map-paper" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
          <feColorMatrix
            values="0 0 0 0 0.55
                    0 0 0 0 0.45
                    0 0 0 0 0.30
                    0 0 0 0.10 0"
          />
          <feComposite in="SourceGraphic" in2="paper" operator="in" />
        </filter>
      </defs>

      {/* Sea (full background) */}
      <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-sea)" />
      <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-grain)" />

      {/*
        Arabian Peninsula landmass. Path traced from the rough geography:
        starts at the Sinai/Levant border in the NW, runs along the eastern
        Med shore briefly, sweeps SE into Mesopotamia, down the Persian
        Gulf coast through Oman, around the southern Yemen coast, then
        back up the Red Sea coast to close.
      */}
      <path
        d="
          M 270 90
          C 305 120, 360 135, 410 130
          C 470 125, 530 140, 590 160
          C 660 175, 730 190, 800 210
          C 870 235, 935 270, 990 320
          C 1050 370, 1095 420, 1130 480
          C 1155 530, 1170 580, 1180 640
          C 1185 700, 1175 760, 1145 820
          C 1115 875, 1060 920, 990 945
          C 920 968, 840 970, 760 955
          C 700 940, 645 905, 600 870
          C 555 835, 500 815, 445 815
          C 395 815, 350 830, 320 855
          C 285 880, 255 895, 225 880
          C 195 860, 175 825, 165 780
          C 152 720, 140 660, 145 600
          C 152 540, 175 480, 195 420
          C 218 360, 240 300, 248 240
          C 252 195, 250 145, 270 90
          Z
        "
        fill="url(#map-land)"
        stroke="#8a7350"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Faint inland contour echo */}
      <path
        d="
          M 310 180
          C 380 200, 470 210, 560 220
          C 660 232, 760 250, 860 280
          C 950 310, 1020 360, 1080 420
          C 1120 470, 1140 530, 1140 600
          C 1140 670, 1115 740, 1070 800
          C 1015 870, 935 910, 850 920
          C 770 925, 690 905, 620 870
          C 550 835, 480 820, 420 830
        "
        fill="none"
        stroke="#a89472"
        strokeWidth="1"
        strokeOpacity="0.45"
        strokeDasharray="4 5"
      />

      {/* Hijaz mountain range — small triangular glyphs along western edge */}
      {[
        [255, 250],
        [248, 310],
        [255, 370],
        [270, 430],
        [285, 490],
        [305, 550],
        [325, 610],
        [350, 670],
        [380, 720],
        [415, 770],
        [455, 810],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`}>
          <path
            d="M -8 6 L 0 -8 L 8 6 Z"
            fill="#9c845a"
            opacity="0.85"
          />
          <path
            d="M -5 6 L 0 -3 L 5 6 Z"
            fill="#7d6948"
            opacity="0.6"
          />
        </g>
      ))}

      {/* Najd plateau — interior shading patches */}
      {[
        [620, 460, 80, 36],
        [780, 520, 95, 40],
        [720, 620, 70, 32],
        [880, 680, 90, 36],
        [820, 760, 75, 30],
      ].map(([cx, cy, rx, ry], i) => (
        <ellipse
          key={`naj-${i}`}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="#b89e72"
          opacity="0.22"
        />
      ))}

      {/* Empty Quarter (Rub' al-Khali) — broad faint sand band in south */}
      <ellipse
        cx={900}
        cy={870}
        rx={210}
        ry={55}
        fill="#c9b287"
        opacity="0.3"
      />

      {/* Red Sea label (subtle) */}
      <text
        x={140}
        y={460}
        fontSize="14"
        fill="#5a6c75"
        fontStyle="italic"
        opacity="0.55"
        transform="rotate(-70 140 460)"
      >
        Kızıldeniz
      </text>
      <text
        x={1150}
        y={300}
        fontSize="13"
        fill="#5a6c75"
        fontStyle="italic"
        opacity="0.55"
        transform="rotate(-40 1150 300)"
      >
        Basra Körfezi
      </text>
      <text
        x={680}
        y={1010}
        fontSize="13"
        fill="#5a6c75"
        fontStyle="italic"
        opacity="0.55"
      >
        Arap Denizi
      </text>

      {/* Habashah landmass (Ethiopian highlands — across the Red Sea) */}
      <path
        d="
          M -50 740
          C 0 720, 60 730, 110 770
          C 145 805, 165 855, 160 905
          C 150 960, 110 1000, 60 1020
          C 10 1035, -40 1030, -80 1010
          L -80 740 Z
        "
        fill="url(#map-land)"
        stroke="#8a7350"
        strokeWidth="2"
      />
      <text
        x={20}
        y={870}
        fontSize="11"
        fill="#5a4828"
        fontStyle="italic"
        opacity="0.6"
      >
        Habeşistan
      </text>
    </g>
  );
}
