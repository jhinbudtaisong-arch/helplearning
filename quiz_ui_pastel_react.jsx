import { useEffect, useRef, useState } from "react";

const DEFAULT_QUESTION = {
  progressLabel: "Q: 102/1800",
  prompt: "What is the correct answer for this pastel-styled quiz interface?",
  helperText: "Replace this mock question with your actual content.",
  options: [
    { id: "a", label: "a.", text: "Choice A" },
    { id: "b", label: "b.", text: "Choice B" },
    { id: "c", label: "c.", text: "Choice C" },
    { id: "d", label: "d.", text: "Choice D" },
  ],
};

function normalizeQuestion(question = {}) {
  const normalizedOptions = Array.isArray(question.options) && question.options.length > 0
    ? question.options.map((option, index) => ({
        id: option.id ?? `option-${index + 1}`,
        label: option.label ?? `${String.fromCharCode(97 + index)}.`,
        text: option.text ?? "",
      }))
    : DEFAULT_QUESTION.options;

  return {
    progressLabel: question.progressLabel ?? DEFAULT_QUESTION.progressLabel,
    prompt: question.prompt ?? DEFAULT_QUESTION.prompt,
    helperText: question.helperText ?? DEFAULT_QUESTION.helperText,
    options: normalizedOptions,
  };
}

export function QuizQuestionCard({
  question = DEFAULT_QUESTION,
  onClose,
  onSelectOption,
  footerNote = "This card can be shown as a timed popup on top of the study screen.",
}) {
  const normalizedQuestion = normalizeQuestion(question);
  const frameRef = useRef(null);

  const [pupils, setPupils] = useState({
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
  });
  const [hoveredOptionId, setHoveredOptionId] = useState(null);
  const [pressedOptionId, setPressedOptionId] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAppClicked, setIsAppClicked] = useState(false);

  const pupilScale = pressedOptionId
    ? 2.8
    : isAppClicked
      ? 2.4
      : hoveredOptionId
        ? 1.8
        : 0.9;

  useEffect(() => {
    const handleMove = (event) => {
      const container = frameRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const eyeCenters = {
        left: { x: rect.width / 2 - 32, y: 76 },
        right: { x: rect.width / 2 + 32, y: 76 },
      };

      const maxOffset = 9.9;

      const getOffset = (eye) => {
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
      setPupils({
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 },
      });
      setHoveredOptionId(null);
      setPressedOptionId(null);
      setIsAppClicked(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(window.__quizCatEyeTimer);
    },
    []
  );

  const triggerAppClickEyes = () => {
    setIsAppClicked(true);

    window.clearTimeout(window.__quizCatEyeTimer);
    window.__quizCatEyeTimer = window.setTimeout(() => {
      setIsAppClicked(false);
    }, 180);
  };

  const handleOptionClick = (option) => {
    setSelectedOptionId(option.id);
    onSelectOption?.(option);
  };

  return (
    <div
      ref={frameRef}
      onClick={triggerAppClickEyes}
      className="relative w-full max-w-5xl pt-28"
    >
      <Mascot pupils={pupils} pupilScale={pupilScale} />

      <section
        className="relative rounded-[34px] border border-white/40 bg-[linear-gradient(90deg,rgba(233,208,218,0.95)_0%,rgba(214,219,221,0.95)_100%)] p-7 shadow-[0_16px_24px_rgba(0,0,0,0.10)] backdrop-blur-sm"
        aria-label="Quiz Card"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[34px] opacity-50 [background-image:radial-gradient(rgba(255,255,255,0.35)_0.7px,transparent_0.7px)] [background-size:8px_8px]" />

        <div className="relative z-10 mb-5 flex items-start justify-between gap-4 px-3 pt-1">
          <p className="text-[18px] font-medium tracking-tight text-black/80">
            {normalizedQuestion.progressLabel}
          </p>

          <div className="flex items-center gap-3 text-black/75">
            <IconButton label="Toggle sound">
              <SpeakerIcon />
            </IconButton>
            <IconButton label="Busy / sleeping status">
              <SleepBellIcon />
            </IconButton>
            {onClose ? (
              <IconButton label="Close question" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 rounded-[24px] border border-white/50 bg-[linear-gradient(90deg,rgba(242,221,226,0.80)_0%,rgba(227,227,235,0.88)_55%,rgba(223,222,244,0.92)_100%)] px-8 py-14 shadow-[inset_0_2px_8px_rgba(255,255,255,0.8),inset_0_-2px_10px_rgba(104,96,120,0.22),0_8px_18px_rgba(0,0,0,0.12)] sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0 rounded-[24px] opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.45)_0.8px,transparent_0.8px)] [background-size:9px_9px]" />
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <p className="text-balance text-xl font-semibold leading-relaxed text-slate-700/80 sm:text-2xl md:text-3xl">
              {normalizedQuestion.prompt}
            </p>
            <p className="mt-4 text-sm text-slate-500 sm:text-base">
              {normalizedQuestion.helperText}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-8 grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
          {normalizedQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setHoveredOptionId(option.id)}
                onMouseLeave={() => {
                  setHoveredOptionId(null);
                  setPressedOptionId(null);
                }}
                onMouseDown={() => setPressedOptionId(option.id)}
                onMouseUp={() => setPressedOptionId(null)}
                className={`group relative min-h-[78px] rounded-[28px] border px-7 py-5 text-left outline-none transition-all duration-200 ease-out hover:scale-[1.03] focus-visible:scale-[1.03] active:scale-[1.01] ${
                  isSelected
                    ? "border-white/50 bg-[linear-gradient(90deg,rgba(250,220,229,0.98)_0%,rgba(239,208,220,0.98)_45%,rgba(223,213,240,0.98)_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.26),0_0_24px_rgba(255,86,120,0.18),0_16px_28px_rgba(110,76,155,0.18)]"
                    : "border-white/40 bg-[linear-gradient(90deg,rgba(246,212,219,0.92)_0%,rgba(239,202,214,0.92)_45%,rgba(219,207,235,0.92)_100%)] shadow-[0_10px_16px_rgba(0,0,0,0.10),inset_0_1px_1px_rgba(255,255,255,0.65)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.22),0_0_22px_rgba(255,86,120,0.26),0_0_36px_rgba(139,92,246,0.24),0_16px_28px_rgba(110,76,155,0.20)] focus-visible:shadow-[0_0_0_1px_rgba(255,255,255,0.22),0_0_22px_rgba(255,86,120,0.26),0_0_36px_rgba(139,92,246,0.24),0_16px_28px_rgba(110,76,155,0.20)]"
                }`}
                aria-label={`Option ${option.id.toUpperCase()}`}
                aria-pressed={isSelected}
              >
                <span className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_48%,rgba(255,255,255,0)_78%)]" />

                <span className="relative flex items-center gap-4">
                  <span className="shrink-0 text-[32px] font-light lowercase leading-none tracking-tight text-white drop-shadow-[0_1px_0_rgba(95,86,109,0.5)] sm:text-[36px]">
                    {option.label}
                  </span>
                  {option.text ? (
                    <span className="text-sm font-medium tracking-[0.01em] text-slate-700/80 sm:text-base">
                      {option.text}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative z-10 mt-7 flex flex-col gap-4 rounded-[24px] border border-white/45 bg-white/20 px-5 py-4 text-sm text-slate-600/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)] sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-pretty">{footerNote}</p>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/55 bg-white/45 px-4 py-2 text-sm font-semibold tracking-[0.02em] text-slate-700 transition hover:bg-white/60"
            >
              Answer later
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function QuizQuestionOverlay({
  open,
  question = DEFAULT_QUESTION,
  onClose,
  onSelectOption,
  title = "Question Time",
  subtitle = "Your scheduled question has appeared on screen.",
}) {
  useEffect(() => {
    if (!open || !onClose) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Close question overlay"
        onClick={onClose}
        className="absolute inset-0 bg-[#0f0f14]/28 backdrop-blur-[6px]"
      />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-4 flex flex-col items-center gap-1 text-center text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
            {title}
          </p>
          <p className="text-sm text-white/82 sm:text-base">{subtitle}</p>
        </div>

        <QuizQuestionCard
          question={question}
          onClose={onClose}
          onSelectOption={onSelectOption}
          footerNote="This prompt is layered above the dashboard so it can pop up when the study timer reaches its trigger."
        />
      </div>
    </div>
  );
}

export default function QuizPastelUI() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#efefef] px-4 pb-16 pt-10 flex items-start justify-center">
      <QuizQuestionCard />
    </div>
  );
}

function IconButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-full text-black/75 transition hover:bg-white/30 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
    >
      {children}
    </button>
  );
}

function Mascot({ pupils, pupilScale }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
      <div className="relative h-[164px] w-[210px]">
        <div className="absolute left-1/2 top-0 h-[110px] w-[205px] -translate-x-1/2 rounded-b-[24px] rounded-t-[999px] bg-black" />
        <div className="absolute left-[30px] top-[-30px] h-0 w-0 rotate-[-6deg] border-b-[60px] border-l-[30px] border-r-[8px] border-b-black border-l-transparent border-r-transparent" />
        <div className="absolute right-[10px] top-[-28px] h-0 w-0 rotate-[40deg] border-b-[80px] border-l-[30px] border-r-[40px] border-b-black border-l-transparent border-r-transparent" />

        <div className="absolute left-[66px] top-[58px] h-[30px] w-[30px] rounded-full bg-white" />
        <div className="absolute right-[64px] top-[58px] h-[30px] w-[30px] rounded-full bg-white" />

        <div
          className="absolute left-[76px] top-[66px] h-[8px] w-[8px] rounded-full bg-black transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pupils.left.x}px, ${pupils.left.y}px) scale(${pupilScale})`,
          }}
        />
        <div
          className="absolute right-[74px] top-[66px] h-[8px] w-[8px] rounded-full bg-black transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pupils.right.x}px, ${pupils.right.y}px) scale(${pupilScale})`,
          }}
        />

        <div className="absolute bottom-[8px] left-[42px] h-[50px] w-[30px] rounded-b-full bg-black" />
        <div className="absolute bottom-[8px] right-[40px] h-[50px] w-[30px] rounded-b-full bg-black" />
      </div>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6.5 9H3v6h3.5L11 19z" />
      <path d="M15 9.5a4.5 4.5 0 0 1 0 5" />
      <path d="M17.5 7a8 8 0 0 1 0 10" />
    </svg>
  );
}

function SleepBellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a4 4 0 0 1 4 4v2.5c0 .9.28 1.78.8 2.5l.9 1.2H6.3l.9-1.2c.52-.72.8-1.6.8-2.5V9a4 4 0 0 1 4-4Z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
      <path d="M17.8 4.4h2.9l-2.9 3.1h2.9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}
