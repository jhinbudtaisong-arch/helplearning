import { useEffect, useMemo, useRef, useState } from "react";
import { UI_BLUR, UI_GLASS, UI_NOISE } from "./cat_study_blur_tokens";
import { isDesktopShell, triggerDesktopAction } from "./desktop_window_controls";
import trackerLevel0Image from "./level 0.png";
import trackerLevel1Image from "./level 1.png";
import trackerLevel2Image from "./level 2.png";
import trackerLevel3Image from "./level 3.png";
import trackerLevel4Image from "./level 4.png";
import trackerLevel5Image from "./level 5.png";
import trackerLevel6Image from "./level 6.png";

const SUBJECTS = [
  "THAI",
  "LAW",
  "MATH",
  "ENG",
  "BIO",
  "SOCIA",
  "PHY",
  "CHEM",
] as const;

type Subject = (typeof SUBJECTS)[number];

type SubjectStats = {
  total: number;
  completed: number;
};

const TOTAL_DAYS = 365;
const MAX_CARDS_PER_DAY = 50;
const LOOPED_SUBJECTS = [...SUBJECTS, ...SUBJECTS] as const;

const SUBJECT_CARD_LIBRARY: Record<Subject, SubjectStats> = {
  THAI: { total: 160, completed: 112 },
  LAW: { total: 220, completed: 146 },
  MATH: { total: 180, completed: 124 },
  ENG: { total: 150, completed: 98 },
  BIO: { total: 170, completed: 84 },
  SOCIA: { total: 140, completed: 90 },
  PHY: { total: 190, completed: 76 },
  CHEM: { total: 175, completed: 70 },
};

const SUBJECT_DAILY_CARD_LIBRARY: Record<Subject, number[]> = SUBJECTS.reduce(
  (acc, subject, subjectIndex) => {
    acc[subject] = Array.from({ length: TOTAL_DAYS }, (_, dayIndex) => {
      const wave = Math.sin((dayIndex + 1 + subjectIndex * 2) / 11) * 2.4;
      const drift = Math.cos((dayIndex + 3 + subjectIndex) / 21) * 1.6;
      const base = 2 + ((dayIndex + subjectIndex) % 6);
      return Math.max(0, Math.min(12, Math.round(base + wave + drift)));
    });
    return acc;
  },
  {} as Record<Subject, number[]>
);

const TRACKER_CAT_IMAGES = [
  trackerLevel0Image,
  trackerLevel1Image,
  trackerLevel2Image,
  trackerLevel3Image,
  trackerLevel4Image,
  trackerLevel5Image,
  trackerLevel6Image,
] as const;

const SKILL_POINTS = [
  { label: "Analysis", value: 86 },
  { label: "Memory", value: 78 },
  { label: "Speed", value: 80 },
  { label: "Accuracy", value: 62 },
  { label: "Understanding", value: 84 },
  { label: "Efficiency", value: 71 },
  { label: "Volume", value: 66 },
  { label: "Consistency", value: 52 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatCompletionDate(daysToComplete: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysToComplete);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTrackerDate(dayOffset: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getTrackerLevel(cards: number) {
  if (cards <= 0) return 0;
  return clamp(Math.ceil(cards / 3), 0, TRACKER_CAT_IMAGES.length - 1);
}

function runDashboardSanityChecks() {
  console.assert(SUBJECTS.length === 8, "Expected 8 subjects");
  console.assert(LOOPED_SUBJECTS.length === SUBJECTS.length * 2, "Looped subjects should duplicate subjects");
  console.assert(
    SUBJECTS.every((subject) => SUBJECT_DAILY_CARD_LIBRARY[subject].length === TOTAL_DAYS),
    "Each subject should have 365 tracking entries"
  );
  console.assert(getTrackerLevel(0) === 0, "0 cards should map to level 0");
  console.assert(getTrackerLevel(5) === 2, "5 cards should map to level 2");
  console.assert(getTrackerLevel(15) === 5, "15 cards should map to level 5");
  console.assert(getTrackerLevel(20) === 6, "20 cards should map to level 6");
  console.assert(clamp(120, 0, 100) === 100, "Clamp should cap values");
  console.assert(clamp(-10, 0, 100) === 0, "Clamp should floor values");
  console.assert(formatCompletionDate(1).length > 0, "Completion date should format correctly");
  console.assert(formatTrackerDate(0).length > 0, "Tracker date should format correctly");
  console.assert(TRACKER_CAT_IMAGES.length === 7, "Expected 7 tracker cat images");
}

if (typeof window !== "undefined") {
  runDashboardSanityChecks();
}

function CatMascot({
  pupils,
  pupilScale,
}: {
  pupils: {
    left: { x: number; y: number };
    right: { x: number; y: number };
  };
  pupilScale: number;
}) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[118px] z-30 -translate-x-1/2">
      <div className="relative h-[180px] w-[230px]">
        <div className="absolute left-1/2 top-0 h-[118px] w-[215px] -translate-x-1/2 rounded-b-[24px] rounded-t-[999px] bg-black" />
        <div className="absolute left-[30px] top-[-28px] h-0 w-0 rotate-[-6deg] border-b-[66px] border-l-[30px] border-r-[8px] border-b-black border-l-transparent border-r-transparent" />
        <div className="absolute right-[10px] top-[-28px] h-0 w-0 rotate-[40deg] border-b-[84px] border-l-[30px] border-r-[40px] border-b-black border-l-transparent border-r-transparent" />
        <div className="absolute left-[72px] top-[63px] h-[32px] w-[32px] rounded-full bg-white" />
        <div className="absolute right-[69px] top-[63px] h-[32px] w-[32px] rounded-full bg-white" />
        <div
          className="absolute left-[82px] top-[71px] h-[8px] w-[8px] rounded-full bg-black transition-transform duration-100 ease-out"
          style={{ transform: `translate(${pupils.left.x}px, ${pupils.left.y}px) scale(${pupilScale})` }}
        />
        <div
          className="absolute right-[79px] top-[71px] h-[8px] w-[8px] rounded-full bg-black transition-transform duration-100 ease-out"
          style={{ transform: `translate(${pupils.right.x}px, ${pupils.right.y}px) scale(${pupilScale})` }}
        />
        <div className="absolute bottom-[10px] left-[46px] h-[54px] w-[32px] rounded-b-full bg-black" />
        <div className="absolute bottom-[10px] right-[44px] h-[54px] w-[32px] rounded-b-full bg-black" />
      </div>
    </div>
  );
}

function RadarChart({
  points,
  isNightMode,
}: {
  points: { label: string; value: number }[];
  isNightMode: boolean;
}) {
  const size = 268;
  const center = size / 2;
  const radius = 88;

  const polygonPoints = useMemo(() => {
    return points
      .map((point, index) => {
        const angle = -Math.PI / 2 + (index / points.length) * Math.PI * 2;
        const r = (point.value / 100) * radius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        return `${x},${y}`;
      })
      .join(" ");
  }, [points]);

  return (
    <div
      className={`relative mx-auto mt-3 h-[272px] w-[272px] rounded-full border ${UI_BLUR.secondaryCard} ${
        isNightMode ? UI_GLASS.radar.night : UI_GLASS.radar.day
      }`}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 h-full w-full">
        {[0.25, 0.5, 0.75, 1].map((step) => {
          const ring = points
            .map((_, index) => {
              const angle = -Math.PI / 2 + (index / points.length) * Math.PI * 2;
              const x = center + Math.cos(angle) * radius * step;
              const y = center + Math.sin(angle) * radius * step;
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <polygon
              key={step}
              points={ring}
              fill="none"
              stroke={isNightMode ? "rgba(230,235,255,0.10)" : "rgba(0,0,0,0.12)"}
              strokeWidth="1"
            />
          );
        })}

        {points.map((_, index) => {
          const angle = -Math.PI / 2 + (index / points.length) * Math.PI * 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke={isNightMode ? "rgba(230,235,255,0.14)" : "rgba(0,0,0,0.18)"}
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill={isNightMode ? "rgba(160,170,255,0.12)" : "rgba(255,255,255,0.22)"}
          stroke={isNightMode ? "rgba(212,220,255,0.62)" : "rgba(0,0,0,0.52)"}
          strokeWidth="2"
        />

        {points.map((point, index) => {
          const angle = -Math.PI / 2 + (index / points.length) * Math.PI * 2;
          const x = center + Math.cos(angle) * (point.value / 100) * radius;
          const y = center + Math.sin(angle) * (point.value / 100) * radius;
          return (
            <g key={point.label}>
              <circle cx={x} cy={y} r="4" fill={isNightMode ? "#d9deff" : "black"} />
              <text
                x={center + Math.cos(angle) * (radius + 18)}
                y={center + Math.sin(angle) * (radius + 18)}
                fontSize="11"
                fill={isNightMode ? "rgba(223,228,255,0.44)" : "rgba(0,0,0,0.34)"}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {point.label}
              </text>
              <text
                x={center + Math.cos(angle) * ((point.value / 100) * radius - 18)}
                y={center + Math.sin(angle) * ((point.value / 100) * radius - 8)}
                fontSize="11"
                fill={isNightMode ? "rgba(236,240,255,0.58)" : "rgba(0,0,0,0.36)"}
                textAnchor="middle"
              >
                {point.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function AnalyticsFoldout({
  isNightMode,
  open,
  onToggle,
}: {
  isNightMode: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-[4px] z-30 flex justify-center">
      <div className="relative flex w-[320px] flex-col items-center">
        <div
          className={`grid w-[300px] overflow-hidden transition-all duration-500 ${
            open ? "mb-8 grid-rows-[1fr] opacity-100" : "mb-0 grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">
            <div
              className={`transition-all duration-500 ${
                open ? "translate-y-[10px] scale-100" : "translate-y-[6px] scale-95"
              }`}
            >
              <RadarChart points={SKILL_POINTS} isNightMode={isNightMode} />
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Hide analysis" : "Show analysis"}
          onClick={onToggle}
          className={`relative z-20 flex h-[26px] w-[54px] items-center justify-center overflow-hidden rounded-t-[999px] rounded-b-[14px] border px-0 transition-all duration-300 ${
            isNightMode
              ? `${UI_GLASS.analyticsToggle.night} ${UI_BLUR.microSurface}`
              : `${UI_GLASS.analyticsToggle.day} ${UI_BLUR.microSurface}`
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <div
          className={`pointer-events-none absolute bottom-[6px] h-[8px] w-[46px] rounded-full ${UI_BLUR.softGlow} ${
            isNightMode ? "bg-[#1a1d2e]/14" : "bg-black/5"
          }`}
        />
      </div>
    </div>
  );
}

function ScreenShell({
  children,
  isNightMode,
  onToggleNightMode,
}: {
  children: React.ReactNode;
  isNightMode: boolean;
  onToggleNightMode: () => void;
}) {
  const desktopShell = isDesktopShell();

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] transition-colors duration-500 ${
        desktopShell
          ? `h-full w-full border border-white/10 ${UI_BLUR.shell}`
          : `h-[860px] w-[390px] border border-white/18 ${UI_BLUR.shell}`
      } ${
        isNightMode ? UI_GLASS.dashboardShell.surface.night : UI_GLASS.dashboardShell.surface.day
      }`}
      >
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isNightMode ? UI_GLASS.dashboardShell.atmosphere.night : UI_GLASS.dashboardShell.atmosphere.day
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-x-6 top-0 h-24 rounded-b-[28px] ${UI_BLUR.softGlow} ${
          isNightMode ? UI_GLASS.dashboardShell.topGlow.night : UI_GLASS.dashboardShell.topGlow.day
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 ${
          isNightMode ? UI_GLASS.dashboardShell.accent.night : UI_GLASS.dashboardShell.accent.day
        }`}
      />

      {desktopShell ? (
        <button
          type="button"
          aria-label="Drag window"
          onMouseDown={() => triggerDesktopAction("drag")}
          className="absolute inset-x-[92px] top-4 z-10 h-12 cursor-move rounded-full bg-transparent"
        />
      ) : null}

      <div className="absolute left-7 top-5 z-20">
        <button
          type="button"
          aria-label="Toggle day and night mode"
          aria-pressed={isNightMode}
          onClick={onToggleNightMode}
          className={`relative flex h-[34px] w-[68px] items-center rounded-full border px-[4px] transition-all duration-500 ${
            isNightMode ? UI_GLASS.themeToggle.surface.night : UI_GLASS.themeToggle.surface.day
          }`}
        >
          <div className="absolute inset-x-[9px] flex items-center justify-between text-[12px]">
            <span className={isNightMode ? "text-white/35" : "text-[#f3b23c]"}>☀</span>
            <span className={isNightMode ? "text-[#cfd5ff]" : "text-black/22"}>☾</span>
          </div>
          <div
            className={`relative z-10 h-[24px] w-[24px] rounded-full border transition-all duration-500 ${
              isNightMode ? UI_GLASS.themeToggle.knob.night : UI_GLASS.themeToggle.knob.day
            }`}
          />
        </button>
      </div>

      <div className="absolute right-9 top-6 z-20 flex gap-4">
        <button
          type="button"
          aria-label="Minimize app"
          onClick={() => triggerDesktopAction("minimize")}
          className="h-5 w-5 rounded-full bg-[#18d8a3] shadow-[0_4px_10px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.7)] transition-transform hover:scale-110"
        />
        <button
          type="button"
          aria-label="Close app"
          onClick={() => triggerDesktopAction("close")}
          className="h-5 w-5 rounded-full bg-[#c40000] shadow-[0_4px_10px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.45)] transition-transform hover:scale-110"
        />
      </div>

      <div
        className={`pointer-events-none absolute inset-0 ${UI_NOISE.shellDots} ${
          isNightMode ? UI_NOISE.shellDotsOpacity.strongNight : UI_NOISE.shellDotsOpacity.strongDay
        }`}
      />
      {!desktopShell ? (
        <div
          className={`pointer-events-none absolute inset-[1px] rounded-[28px] border ${
            isNightMode ? UI_GLASS.dashboardShell.innerBorder.night : UI_GLASS.dashboardShell.innerBorder.day
          }`}
        />
      ) : null}
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  max,
  hint,
  knobLabel,
  isNightMode,
}: {
  label: string;
  value: number;
  max: number;
  hint: string;
  knobLabel?: string;
  isNightMode: boolean;
}) {
  const safeMax = Math.max(max, 1);
  const percent = clamp((value / safeMax) * 100, 0, 100);
  const renderedKnobLabel = knobLabel ?? String(value);
  const knobHalfWidth = renderedKnLabelWidth(renderedKnobLabel);

  return (
    <div className="space-y-2">
      {(label || hint) && (
        <div className={`flex items-center justify-between text-[12px] ${isNightMode ? "text-white/52" : "text-black/45"}`}>
          <span>{label}</span>
          <span>{hint}</span>
        </div>
      )}

      <div className="relative">
        <div
          className={`relative h-[22px] overflow-hidden rounded-full border ${
            isNightMode
              ? "border-white/10 bg-[linear-gradient(180deg,rgba(216,225,255,0.08),rgba(60,67,95,0.20))] shadow-[inset_0_3px_8px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-2px_6px_rgba(255,255,255,0.03)]"
              : "border-white/40 bg-[linear-gradient(180deg,rgba(245,245,245,0.98),rgba(208,208,208,0.98))] shadow-[inset_0_3px_8px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-2px_6px_rgba(0,0,0,0.06)]"
          }`}
        >
          <div
            className={`absolute inset-y-[1px] left-[1px] rounded-full ${
              isNightMode
                ? "bg-[linear-gradient(90deg,#6d7bff_0%,#6d56ff_18%,#7d3cff_38%,#bb42ff_58%,#ea62b7_78%,#ff9e9e_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_0_8px_rgba(144,116,255,0.20)]"
                : "bg-[linear-gradient(90deg,#7b84f6_0%,#625bff_18%,#732cff_36%,#a132ff_56%,#df5ba7_78%,#f48e9c_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_0_8px_rgba(132,95,255,0.18)]"
            }`}
            style={{ width: `calc(${percent}% - 2px)` }}
          />

          <div
            className={`absolute top-1/2 z-20 rounded-[12px] border px-[10px] py-[4px] text-[13px] font-semibold leading-none ${UI_BLUR.microSurface} ${
              isNightMode ? UI_GLASS.progressKnob.night : UI_GLASS.progressKnob.day
            }`}
            style={{
              left: `clamp(${knobHalfWidth}px, ${percent}%, calc(100% - ${knobHalfWidth}px))`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {renderedKnobLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderedKnLabelWidth(label: string) {
  return label.length >= 4 ? 26 : label.length >= 3 ? 23 : 20;
}

function DashboardCard({
  selectedSubjects,
  setSelectedSubjects,
  onSliderInteraction,
  isNightMode,
  analyticsOpen,
  onToggleAnalytics,
  userName,
  userEmail,
  onLogout,
}: {
  selectedSubjects: Subject[];
  setSelectedSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  onSliderInteraction: (active: boolean) => void;
  isNightMode: boolean;
  analyticsOpen: boolean;
  onToggleAnalytics: () => void;
  userName: string;
  userEmail: string;
  onLogout?: () => void;
}) {
  const trackerScrollRef = useRef<HTMLDivElement | null>(null);
  const subjectScrollRef = useRef<HTMLDivElement | null>(null);
  const [cardsPerDay, setCardsPerDay] = useState(12);
  const [hoveredDay, setHoveredDay] = useState<{
    index: number;
    cards: number;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredTrackerIndex, setHoveredTrackerIndex] = useState<number | null>(null);

  const enableHorizontalWheelScroll = (
    event: React.WheelEvent<HTMLDivElement>,
    targetRef: React.RefObject<HTMLDivElement | null>
  ) => {
    const target = targetRef.current;
    if (!target) return;
    if (Math.abs(event.deltaY) > 0 || Math.abs(event.deltaX) > 0) {
      event.preventDefault();
      target.scrollLeft += event.deltaY + event.deltaX;
    }
  };

  useEffect(() => {
    const target = subjectScrollRef.current;
    if (!target) return;

    const syncLoopPosition = () => {
      const halfWidth = target.scrollWidth / 2;
      const maxVisibleStart = target.scrollWidth - target.clientWidth;
      if (target.scrollLeft <= 8) {
        target.scrollLeft += halfWidth;
      } else if (target.scrollLeft >= maxVisibleStart - 8) {
        target.scrollLeft -= halfWidth;
      }
    };

    target.scrollLeft = target.scrollWidth / 2;
    target.addEventListener("scroll", syncLoopPosition, { passive: true });
    return () => target.removeEventListener("scroll", syncLoopPosition);
  }, []);

  const toggleSubject = (subject: Subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((item) => item !== subject) : [...prev, subject]
    );
  };

  const selectedSubjectStats = useMemo(
    () => selectedSubjects.map((subject) => SUBJECT_CARD_LIBRARY[subject]),
    [selectedSubjects]
  );

  const totalCards = useMemo(
    () => selectedSubjectStats.reduce((sum, subject) => sum + subject.total, 0),
    [selectedSubjectStats]
  );

  const studiedCards = useMemo(
    () => selectedSubjectStats.reduce((sum, subject) => sum + subject.completed, 0),
    [selectedSubjectStats]
  );

  const selectedDailyCards = useMemo(() => {
    if (selectedSubjects.length === 0) {
      return Array.from({ length: TOTAL_DAYS }, () => 0);
    }

    return Array.from({ length: TOTAL_DAYS }, (_, dayIndex) =>
      selectedSubjects.reduce(
        (sum, subject) => sum + (SUBJECT_DAILY_CARD_LIBRARY[subject][dayIndex] ?? 0),
        0
      )
    );
  }, [selectedSubjects]);

  const trackerLevels = useMemo(
    () => selectedDailyCards.map((value) => getTrackerLevel(value)),
    [selectedDailyCards]
  );

  const totalProgress = Math.min(totalCards, studiedCards);
  const totalProgressPercent = totalCards > 0 ? Math.round((totalProgress / totalCards) * 100) : 0;
  const remainingCards = Math.max(0, totalCards - totalProgress);
  const daysToComplete = remainingCards === 0 ? 0 : Math.ceil(remainingCards / cardsPerDay);
  const completionDate = useMemo(() => formatCompletionDate(daysToComplete), [daysToComplete]);
  const cardsPerDayPercent = clamp((cardsPerDay / MAX_CARDS_PER_DAY) * 100, 0, 100);

  return (
    <>
      <div
        className={`absolute left-1/2 top-[108px] z-20 w-[340px] -translate-x-1/2 rounded-[24px] border p-5 pb-4 ${UI_BLUR.primaryCard} ${
          isNightMode ? UI_GLASS.dashboardCard.surface.night : UI_GLASS.dashboardCard.surface.day
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 rounded-[24px] ${UI_NOISE.dashboardCardDots} ${
            isNightMode ? UI_NOISE.cardDotsOpacity.night : UI_NOISE.cardDotsOpacity.dashboardDay
          }`}
        />

        <div className="relative mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-[10px] tracking-[0.16em] ${isNightMode ? "text-white/34" : "text-black/35"}`}>
              DAY TRACKING
            </p>
            <p
              className={`mt-1 truncate text-[13px] font-semibold tracking-[0.01em] ${
                isNightMode ? "text-white/72" : "text-black/62"
              }`}
            >
              {userName}
            </p>
            <p className={`truncate text-[11px] ${isNightMode ? "text-white/34" : "text-black/36"}`}>
              {userEmail}
            </p>
          </div>

          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] transition-colors ${
                isNightMode ? UI_GLASS.dashboardSoftButton.night : UI_GLASS.dashboardSoftButton.day
              }`}
            >
              LOG OUT
            </button>
          ) : null}
        </div>

        <div
          ref={trackerScrollRef}
          onWheel={(event) => enableHorizontalWheelScroll(event, trackerScrollRef)}
          className={`relative overflow-x-auto overflow-y-hidden rounded-[16px] border p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isNightMode
              ? `cursor-ew-resize ${UI_GLASS.trackerPanel.night}`
              : `cursor-grab active:cursor-grabbing ${UI_GLASS.trackerPanel.day}`
          }`}
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
        >
          <div className="grid w-max min-w-[1440px] grid-flow-col grid-rows-7 gap-3 pr-8">
            {trackerLevels.map((level, index) => {
              const imageSrc = TRACKER_CAT_IMAGES[Math.min(level, TRACKER_CAT_IMAGES.length - 1)];
              const isHovered = hoveredTrackerIndex === index;

              return (
                <button
                  key={index}
                  type="button"
                  className={`group relative flex h-[34px] w-[34px] items-center justify-center overflow-visible rounded-[12px] bg-transparent transition-all duration-200 ${
                    isHovered ? "z-20 scale-[1.06]" : "z-0"
                  }`}
                  onMouseEnter={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    setHoveredTrackerIndex(index);
                    setHoveredDay({
                      index,
                      cards: selectedDailyCards[index],
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseMove={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    setHoveredTrackerIndex(index);
                    setHoveredDay({
                      index,
                      cards: selectedDailyCards[index],
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredTrackerIndex(null);
                    setHoveredDay(null);
                  }}
                >
                  <span
                    className={`pointer-events-none absolute inset-x-[8px] bottom-[4px] h-[5px] rounded-full opacity-0 blur-[4px] transition-all duration-200 ${
                      isNightMode
                        ? isHovered
                          ? "bg-[#7384ff]/30"
                          : "bg-white/12"
                        : isHovered
                          ? "bg-[#f09ab8]/32"
                          : "bg-black/10"
                    } ${isHovered ? "opacity-100" : "opacity-0"}`}
                  />
                  <img
                    src={imageSrc}
                    alt={`Tracker level ${level}`}
                    className={`pointer-events-none relative z-10 h-[28px] w-[28px] select-none object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.16)] transition-transform duration-200 ${
                      isHovered ? "scale-[2.4] drop-shadow-[0_10px_12px_rgba(0,0,0,0.22)]" : "scale-100"
                    }`}
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
          {hoveredDay && (
            <div
              className={`pointer-events-none fixed z-[60] -translate-x-1/2 rounded-[12px] border px-3 py-2 text-center text-[11px] ${UI_BLUR.secondaryCard} ${
                isNightMode ? UI_GLASS.tooltip.night : UI_GLASS.tooltip.day
              }`}
              style={{ left: hoveredDay.x, top: hoveredDay.y - 66 }}
            >
              <div>{formatTrackerDate(hoveredDay.index)}</div>
              <div>Day {hoveredDay.index + 1}</div>
              <div>{hoveredDay.cards} cards</div>
            </div>
          )}
        </div>

        <div className="relative mt-4">
          <div
            ref={subjectScrollRef}
            onWheel={(event) => enableHorizontalWheelScroll(event, subjectScrollRef)}
            className={`flex w-full gap-5 overflow-x-auto overflow-y-hidden pb-3 pr-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              isNightMode ? "cursor-ew-resize" : "cursor-grab active:cursor-grabbing"
            }`}
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
          >
            {LOOPED_SUBJECTS.map((subject, index) => {
              const active = selectedSubjects.includes(subject);
              return (
                <button
                  key={`${subject}-${index}`}
                  onClick={() => toggleSubject(subject)}
                  className={`shrink-0 min-w-[82px] rounded-[24px] border px-5 py-[18px] text-[15px] font-black tracking-[0.01em] ${UI_BLUR.microSurface} transition-all ${
                    isNightMode
                      ? active
                        ? UI_GLASS.subjectChip.activeNight
                        : UI_GLASS.subjectChip.inactiveNight
                      : active
                        ? UI_GLASS.subjectChip.activeDay
                        : UI_GLASS.subjectChip.inactiveDay
                  }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`grid overflow-hidden transition-all duration-500 ${
            analyticsOpen ? "mt-0 grid-rows-[0fr] opacity-0" : "mt-4 grid-rows-[1fr] opacity-100"
          }`}
        >
          <div className="min-h-0">
            <div className="space-y-4">
              <ProgressBar
                label="All subjects progress"
                value={totalProgress}
                max={Math.max(totalCards, 1)}
                hint={`${totalProgress} / ${totalCards || 0}`}
                knobLabel={`${totalProgressPercent}%`}
                isNightMode={isNightMode}
              />

              <div className="space-y-2">
                <div className={`flex items-center justify-between text-[12px] ${isNightMode ? "text-white/50" : "text-black/45"}`}>
                  <span>Cards per day</span>
                  <span />
                </div>
                <div className="relative h-[18px]">
                  <div className="pointer-events-none absolute inset-0 z-10">
                    <ProgressBar
                      label=""
                      value={cardsPerDay}
                      max={MAX_CARDS_PER_DAY}
                      hint=""
                      knobLabel={`${cardsPerDay}`}
                      isNightMode={isNightMode}
                    />
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={MAX_CARDS_PER_DAY}
                    value={cardsPerDay}
                    onChange={(event) => setCardsPerDay(Number(event.target.value))}
                    onMouseDown={() => onSliderInteraction(true)}
                    onMouseUp={() => onSliderInteraction(false)}
                    onTouchStart={() => onSliderInteraction(true)}
                    onTouchEnd={() => onSliderInteraction(false)}
                    onPointerDown={() => onSliderInteraction(true)}
                    onPointerUp={() => onSliderInteraction(false)}
                    aria-label="Cards per day"
                    className="absolute inset-0 z-20 h-[18px] w-full cursor-pointer opacity-0"
                    style={{ backgroundSize: `${cardsPerDayPercent}% 100%` }}
                  />
                </div>
              </div>

              <div className={`text-center text-[12px] ${isNightMode ? "text-white/38" : "text-black/34"}`}>
                {selectedSubjects.length === 0
                  ? "Select at least 1 subject to calculate your goal."
                  : remainingCards === 0
                    ? "All selected subjects are completed."
                    : `Your goal will be completed in ${daysToComplete} days, by ${completionDate}.`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnalyticsFoldout
        isNightMode={isNightMode}
        open={analyticsOpen}
        onToggle={onToggleAnalytics}
      />
    </>
  );
}

export default function CatStudyDashboard({
  user,
  onLogout,
}: {
  user?: { name: string; email: string };
  onLogout?: () => void;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const desktopShell = isDesktopShell();
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>(["MATH"]);
  const [pupils, setPupils] = useState({
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
  });
  const [isAppClicked, setIsAppClicked] = useState(false);
  const [isSliderActive, setIsSliderActive] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const pupilScale = isSliderActive ? 2.8 : isAppClicked ? 2.4 : 0.9;

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const container = frameRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const eyeCenters = {
        left: { x: 150, y: 178 },
        right: { x: 214, y: 178 },
      };

      const maxOffset = 9.9;

      const getOffset = (eye: { x: number; y: number }) => {
        const dx = pointer.x - eye.x;
        const dy = pointer.y - eye.y;
        const distance = Math.hypot(dx, dy) || 1;
        const limited = Math.min(maxOffset, distance * 0.12);
        return {
          x: (dx / distance) * limited,
          y: (dy / distance) * limited,
        };
      };

      setPupils({
        left: getOffset(eyeCenters.left),
        right: getOffset(eyeCenters.right),
      });
    };

    const handleLeave = () => {
      setPupils({ left: { x: 0, y: 0 }, right: { x: 0, y: 0 } });
      setIsAppClicked(false);
      setIsSliderActive(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const triggerAppClickEyes = () => {
    setIsAppClicked(true);
    window.clearTimeout((window as Window & { __catEyeClickTimer?: number }).__catEyeClickTimer);
    (window as Window & { __catEyeClickTimer?: number }).__catEyeClickTimer = window.setTimeout(() => {
      setIsAppClicked(false);
    }, 180);
  };

  return (
    <div
      className={
        desktopShell
          ? "relative h-[860px] w-[390px] overflow-hidden bg-transparent"
          : `flex min-h-screen items-center justify-center p-6 transition-colors duration-500 ${
              isNightMode ? "bg-[#10131b]" : "bg-[#efefef]"
            }`
      }
    >
      <div
        ref={frameRef}
        onClick={triggerAppClickEyes}
        className={desktopShell ? "h-full w-full" : undefined}
      >
        <ScreenShell
          isNightMode={isNightMode}
          onToggleNightMode={() => setIsNightMode((prev) => !prev)}
        >
          <div className="h-full overflow-hidden">
            <div className="relative h-full pb-[24px]">
              <CatMascot pupils={pupils} pupilScale={pupilScale} />
              <DashboardCard
                selectedSubjects={selectedSubjects}
                setSelectedSubjects={setSelectedSubjects}
                onSliderInteraction={setIsSliderActive}
                isNightMode={isNightMode}
                analyticsOpen={analyticsOpen}
                onToggleAnalytics={() => setAnalyticsOpen((prev) => !prev)}
                userName={user?.name ?? "Student"}
                userEmail={user?.email ?? "Guest mode"}
                onLogout={onLogout}
              />
            </div>
          </div>
        </ScreenShell>
      </div>
    </div>
  );
}
