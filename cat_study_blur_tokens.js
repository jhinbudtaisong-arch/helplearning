// Tune these tokens to increase or decrease the glass blur and noise across the app.
export const UI_BLUR = {
  shell: "backdrop-blur-[84px] [backdrop-filter:blur(84px)_saturate(1.04)]",
  primaryCard: "backdrop-blur-[24px]",
  secondaryCard: "backdrop-blur-[18px]",
  microSurface: "backdrop-blur-[14px]",
  glow: "blur-[80px]",
  softGlow: "blur-[20px]",
};

export const UI_NOISE = {
  shellTexture:
    "mix-blend-soft-light [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_3px),repeating-linear-gradient(90deg,rgba(0,0,0,0.07)_0px,rgba(0,0,0,0.07)_1px,transparent_1px,transparent_4px),radial-gradient(rgba(255,255,255,0.9)_0.45px,transparent_0.45px)] [background-size:3px_3px,4px_4px,7px_7px]",
  shellTextureOpacity: {
    night: "opacity-[0.18]",
    day: "opacity-[0.14]",
  },
  shellDots:
    "[background-image:radial-gradient(rgba(255,255,255,0.95)_0.6px,transparent_0.6px)] [background-size:6px_6px]",
  shellDotsOpacity: {
    subtleNight: "opacity-[0.02]",
    subtleDay: "opacity-[0.04]",
    strongNight: "opacity-[0.04]",
    strongDay: "opacity-[0.08]",
  },
  cardDots:
    "mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.75)_0.45px,transparent_0.45px)] [background-size:5px_5px]",
  dashboardCardDots:
    "mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.72)_0.45px,transparent_0.45px)] [background-size:5px_5px]",
  cardDotsOpacity: {
    night: "opacity-[0.03]",
    loginDay: "opacity-[0.08]",
    dashboardDay: "opacity-[0.07]",
  },
};

export const UI_GLASS = {
  authShell: {
    surface: {
      night:
        "bg-[linear-gradient(180deg,rgba(23,27,39,0.48),rgba(12,15,24,0.34))] shadow-[0_18px_38px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.05)]",
      day:
        "bg-[linear-gradient(180deg,rgba(205,211,221,0.34),rgba(173,181,194,0.24))] shadow-[0_16px_32px_rgba(94,102,120,0.14),inset_0_1px_0_rgba(255,255,255,0.12)]",
    },
    atmosphere: {
      night:
        "bg-[radial-gradient(circle_at_top,rgba(132,144,255,0.12),transparent_32%),linear-gradient(180deg,rgba(40,46,68,0.26),rgba(14,16,24,0.12))]",
      day:
        "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_28%),linear-gradient(180deg,rgba(226,231,239,0.20),rgba(190,197,208,0.10))]",
    },
    wash: {
      night: "bg-black/10 opacity-100",
      day: "bg-white/8 opacity-100",
    },
    innerBorder: {
      night: "border-white/8",
      day: "border-white/20",
    },
  },
  dashboardShell: {
    surface: {
      night:
        "bg-[linear-gradient(180deg,rgba(34,39,61,0.34),rgba(16,18,30,0.22))] shadow-[0_20px_45px_rgba(4,6,14,0.24),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-20px_30px_rgba(0,0,0,0.16)]",
      day:
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(244,245,250,0.14))] shadow-[0_20px_40px_rgba(120,126,148,0.18),inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-20px_30px_rgba(170,174,190,0.10)]",
    },
    atmosphere: {
      night:
        "bg-[radial-gradient(circle_at_top_left,rgba(189,200,255,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(108,134,255,0.18),transparent_28%),linear-gradient(180deg,rgba(56,64,98,0.38),rgba(16,18,28,0.20))]",
      day:
        "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_34%),radial-gradient(circle_at_top_right,rgba(226,233,255,0.36),transparent_28%),linear-gradient(180deg,rgba(246,248,255,0.34),rgba(229,232,241,0.10))]",
    },
    topGlow: {
      night: "bg-white/12",
      day: "bg-white/65",
    },
    accent: {
      night:
        "bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.10),transparent_18%),radial-gradient(circle_at_82%_22%,rgba(160,178,255,0.12),transparent_20%)]",
      day:
        "bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.72),transparent_18%),radial-gradient(circle_at_82%_22%,rgba(218,228,255,0.42),transparent_20%)]",
    },
    innerBorder: {
      night: "border-white/8",
      day: "border-white/20",
    },
  },
  themeToggle: {
    surface: {
      night:
        "border-white/10 bg-[linear-gradient(180deg,rgba(33,39,58,0.88),rgba(18,22,36,0.92))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_-10px_14px_rgba(0,0,0,0.22)]",
      day:
        "border-white/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.44),rgba(237,232,241,0.26))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.62),inset_0_-10px_14px_rgba(0,0,0,0.08)]",
    },
    knob: {
      night:
        "translate-x-[34px] border-white/14 bg-[linear-gradient(180deg,rgba(214,220,255,0.92),rgba(154,163,220,0.92))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]",
      day:
        "translate-x-0 border-white/55 bg-[linear-gradient(180deg,rgba(255,244,200,0.98),rgba(255,206,112,0.94))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.72)]",
    },
  },
  authCard: {
    surface: {
      night:
        "border-white/10 bg-[linear-gradient(180deg,rgba(47,54,78,0.34),rgba(20,22,34,0.26))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.10),inset_0_-12px_18px_rgba(0,0,0,0.18)]",
      day:
        "border-white/32 bg-[linear-gradient(180deg,rgba(255,255,255,0.36),rgba(246,242,247,0.24))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.52),inset_0_-12px_18px_rgba(0,0,0,0.08)]",
    },
    glow: {
      night: "bg-[#1b2038]/50",
      day: "bg-black/28",
    },
  },
  dashboardCard: {
    surface: {
      night:
        "border-white/10 bg-[linear-gradient(180deg,rgba(42,49,76,0.34),rgba(18,20,32,0.22))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.10),inset_0_-14px_18px_rgba(0,0,0,0.18)]",
      day:
        "border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(246,242,247,0.20))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.48),inset_0_-14px_18px_rgba(0,0,0,0.08)]",
    },
  },
  radar: {
    night:
      "border-white/10 bg-[linear-gradient(180deg,rgba(60,68,98,0.18),rgba(20,22,34,0.18))] shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),inset_0_-8px_20px_rgba(0,0,0,0.18)]",
    day:
      "border-white/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(236,236,236,0.08))] shadow-[inset_0_1px_2px_rgba(255,255,255,0.34),inset_0_-8px_20px_rgba(0,0,0,0.06)]",
  },
  analyticsToggle: {
    night:
      "border-white/10 bg-white/6 text-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]",
    day:
      "border-white/45 bg-white/18 text-black/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]",
  },
  progressKnob: {
    night:
      "border-white/16 bg-[linear-gradient(180deg,rgba(220,225,255,0.95),rgba(141,149,214,0.96))] text-[#1a1d2e] shadow-[0_4px_10px_rgba(0,0,0,0.16),inset_0_1px_1px_rgba(255,255,255,0.72)]",
    day:
      "border-white/60 bg-[linear-gradient(180deg,rgba(255,211,221,0.98),rgba(231,176,196,0.98))] text-white shadow-[0_4px_10px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.82)]",
  },
  dashboardSoftButton: {
    night: "border-white/10 bg-[rgba(255,255,255,0.06)] text-white/62 hover:text-white/82",
    day: "border-white/38 bg-[rgba(255,255,255,0.44)] text-black/46 hover:text-black/70",
  },
  trackerPanel: {
    night:
      "border-white/10 bg-[rgba(219,226,255,0.05)] shadow-[inset_0_1px_3px_rgba(255,255,255,0.08)]",
    day:
      "border-white/24 bg-white/10 shadow-[inset_0_1px_3px_rgba(255,255,255,0.32)]",
  },
  tooltip: {
    night:
      "border-white/10 bg-[linear-gradient(180deg,rgba(44,50,76,0.92),rgba(20,22,36,0.88))] text-white/72 shadow-[inset_0_1px_1px_rgba(255,255,255,0.10),inset_0_-10px_18px_rgba(0,0,0,0.18)]",
    day:
      "border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(245,240,247,0.82))] text-black/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-10px_18px_rgba(0,0,0,0.06)]",
  },
  subjectChip: {
    activeNight:
      "border-white/14 bg-[linear-gradient(145deg,rgba(188,196,255,0.24),rgba(255,144,214,0.18))] text-[#eef1ff] shadow-[0_4px_10px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.12),inset_0_-6px_10px_rgba(0,0,0,0.12)]",
    inactiveNight:
      "border-white/10 bg-[rgba(255,255,255,0.035)] text-white/38 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),inset_0_-6px_10px_rgba(0,0,0,0.08)]",
    activeDay:
      "border-white/40 bg-[linear-gradient(145deg,rgba(214,210,255,0.94),rgba(250,157,200,0.86))] text-[#8b4fc6] shadow-[0_5px_10px_rgba(0,0,0,0.10),inset_0_1px_1px_rgba(255,255,255,0.75),inset_0_-6px_10px_rgba(214,102,170,0.10)]",
    inactiveDay:
      "border-white/26 bg-[rgba(255,255,255,0.12)] text-black/32 shadow-[inset_0_1px_1px_rgba(255,255,255,0.52),inset_0_-6px_10px_rgba(0,0,0,0.03)]",
  },
};
