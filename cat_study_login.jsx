import { useEffect, useRef, useState } from "react";
import CatStudyDashboard from "./cat_study_app_dashboard";
import { UI_BLUR, UI_GLASS, UI_NOISE } from "./cat_study_blur_tokens";
import { isDesktopShell, triggerDesktopAction } from "./desktop_window_controls";
import {
  DEMO_VERIFICATION_CODE,
  getCurrentSessionUser,
  loginUser,
  logoutUser,
  registerUser,
  requestVerificationCode,
} from "./cat_study_auth";

type Screen = "login" | "signin";
type FieldState = "default" | "success" | "error";
const APP_SHELL_RADIUS_CLASS = "rounded-[28px]";
const APP_SHELL_INNER_RADIUS_CLASS = "rounded-[27px]";

function CatMascot({
  pupils,
  pupilScale,
  top = "top-[190px]",
  size = "w-[210px] h-[164px]",
}: {
  pupils: {
    left: { x: number; y: number };
    right: { x: number; y: number };
  };
  pupilScale: number;
  top?: string;
  size?: string;
}) {
  return (
    <div className={`pointer-events-none absolute left-1/2 ${top} z-30 -translate-x-1/2`}>
      <div className={`relative ${size}`}>
        <div className="absolute left-1/2 top-0 h-[110px] w-[205px] -translate-x-1/2 rounded-b-[24px] rounded-t-[999px] bg-black" />
        <div className="absolute left-[30px] top-[-30px] h-0 w-0 rotate-[-6deg] border-b-[60px] border-l-[30px] border-r-[8px] border-b-black border-l-transparent border-r-transparent" />
        <div className="absolute right-[10px] top-[-28px] h-0 w-0 rotate-[40deg] border-b-[80px] border-l-[30px] border-r-[40px] border-b-black border-l-transparent border-r-transparent" />
        <div className="absolute left-[66px] top-[58px] h-[30px] w-[30px] rounded-full bg-white" />
        <div className="absolute right-[64px] top-[58px] h-[30px] w-[30px] rounded-full bg-white" />
        <div
          className="absolute left-[76px] top-[66px] h-[8px] w-[8px] rounded-full bg-black transition-transform duration-100 ease-out"
          style={{ transform: `translate(${pupils.left.x}px, ${pupils.left.y}px) scale(${pupilScale})` }}
        />
        <div
          className="absolute right-[74px] top-[66px] h-[8px] w-[8px] rounded-full bg-black transition-transform duration-100 ease-out"
          style={{ transform: `translate(${pupils.right.x}px, ${pupils.right.y}px) scale(${pupilScale})` }}
        />
        <div className="absolute bottom-[8px] left-[42px] h-[50px] w-[30px] rounded-b-full bg-black" />
        <div className="absolute bottom-[8px] right-[40px] h-[50px] w-[30px] rounded-b-full bg-black" />
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
      className={`relative overflow-hidden ${APP_SHELL_RADIUS_CLASS} transition-colors duration-500 ${
        desktopShell
          ? `h-full w-full border border-white/10 ${UI_BLUR.shell}`
          : `h-[860px] w-[390px] border border-white/12 ${UI_BLUR.shell}`
      } ${
        isNightMode ? UI_GLASS.authShell.surface.night : UI_GLASS.authShell.surface.day
      }`}
      >
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isNightMode ? UI_GLASS.authShell.atmosphere.night : UI_GLASS.authShell.atmosphere.day
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          isNightMode ? UI_GLASS.authShell.wash.night : UI_GLASS.authShell.wash.day
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 ${UI_NOISE.shellTexture} ${
          isNightMode ? UI_NOISE.shellTextureOpacity.night : UI_NOISE.shellTextureOpacity.day
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
          isNightMode ? UI_NOISE.shellDotsOpacity.subtleNight : UI_NOISE.shellDotsOpacity.subtleDay
        }`}
      />
      {!desktopShell ? (
        <div
          className={`pointer-events-none absolute inset-[1px] ${APP_SHELL_INNER_RADIUS_CLASS} border ${
            isNightMode ? UI_GLASS.authShell.innerBorder.night : UI_GLASS.authShell.innerBorder.day
          }`}
        />
      ) : null}

      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

function FieldShell({
  children,
  isNightMode,
  onHover,
  state = "default",
}: {
  children: React.ReactNode;
  isNightMode: boolean;
  onHover: (value: boolean) => void;
  state?: FieldState;
}) {
  const tone =
    state === "success"
      ? isNightMode
        ? "border-emerald-400/60 bg-emerald-500/10"
        : "border-emerald-500/60 bg-emerald-50"
      : state === "error"
        ? isNightMode
          ? "border-red-400/60 bg-red-500/10"
          : "border-red-500/60 bg-red-50"
        : isNightMode
          ? "border-white/6 bg-[rgba(224,231,255,0.08)]"
          : "border-black/5 bg-[#f3f1f2]";

  const shadow =
    state === "default"
      ? isNightMode
        ? "shadow-[inset_0_3px_10px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.06)]"
        : "shadow-[inset_0_3px_10px_rgba(0,0,0,0.18),0_1px_0_rgba(255,255,255,0.7)]"
      : "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

  return (
    <div
      className={`relative h-[54px] rounded-[14px] border px-5 ${tone} ${shadow}`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {children}
    </div>
  );
}

function AuthFields({
  fields,
  isNightMode,
  onInputHover,
  values,
  onChange,
}: {
  fields: { placeholder: string; type?: string; key: string }[];
  isNightMode: boolean;
  onInputHover: (value: boolean) => void;
  values?: Record<string, string>;
  onChange?: (key: string, value: string) => void;
}) {
  return (
    <div className="relative space-y-4">
      {fields.map((field) => (
        <FieldShell key={field.placeholder} isNightMode={isNightMode} onHover={onInputHover}>
          <input
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            value={values?.[field.key] ?? ""}
            onChange={(e) => onChange?.(field.key, e.target.value)}
            className={`h-full w-full bg-transparent text-[20px] outline-none tracking-[0.02em] ${
              isNightMode ? "text-white/62 placeholder:text-white/28" : "text-black/40 placeholder:text-black/35"
            }`}
          />
        </FieldShell>
      ))}
    </div>
  );
}

function PrimaryCircleButton({
  ariaLabel,
  isNightMode,
  onClick,
  onHover,
  onPress,
}: {
  ariaLabel: string;
  isNightMode: boolean;
  onClick: () => void;
  onHover: (value: boolean) => void;
  onPress: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => {
        onHover(false);
        onPress(false);
      }}
      onMouseDown={() => onPress(true)}
      onMouseUp={() => onPress(false)}
      className={`absolute bottom-4 right-4 flex h-[56px] w-[56px] items-center justify-center rounded-full border transition-transform hover:scale-[1.02] active:scale-[0.98] ${
        isNightMode
          ? "border-white/10 bg-[linear-gradient(180deg,rgba(122,132,210,0.72),rgba(73,82,142,0.86))] shadow-[inset_0_1px_2px_rgba(255,255,255,0.18),inset_0_-10px_18px_rgba(0,0,0,0.22)]"
          : "border-black/10 bg-[linear-gradient(180deg,#d5d5d3,#cfcfcd)] shadow-[0_6px_12px_rgba(0,0,0,0.20),inset_0_1px_2px_rgba(255,255,255,0.95)]"
      }`}
    >
      <span
        className={`ml-1 inline-block h-0 w-0 border-y-[12px] border-l-[15px] border-y-transparent ${
          isNightMode ? "border-l-[#eef1ff]" : "border-l-white"
        }`}
      />
    </button>
  );
}

function LoginCard({
  onLogin,
  onGoSignIn,
  onInputHover,
  onButtonHover,
  onButtonPressed,
  isNightMode,
  loginStatus,
  loginMessage,
  loginId,
  loginPassword,
  onLoginFieldChange,
}: {
  onLogin: () => void;
  onGoSignIn: () => void;
  onInputHover: (value: boolean) => void;
  onButtonHover: (value: boolean) => void;
  onButtonPressed: (value: boolean) => void;
  isNightMode: boolean;
  loginStatus: "default" | "success" | "error";
  loginMessage: string;
  loginId: string;
  loginPassword: string;
  onLoginFieldChange: (key: "id" | "password", value: string) => void;
}) {
  return (
    <div
      className={`absolute left-1/2 top-[280px] z-20 w-[340px] -translate-x-1/2 rounded-[20px] border p-5 pb-20 ${UI_BLUR.primaryCard} ${
        isNightMode ? UI_GLASS.authCard.surface.night : UI_GLASS.authCard.surface.day
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 rounded-[20px] ${UI_NOISE.cardDots} ${
          isNightMode ? UI_NOISE.cardDotsOpacity.night : UI_NOISE.cardDotsOpacity.loginDay
        }`}
      />
      <div className={`absolute left-1/2 top-0 h-[86px] w-[184px] -translate-x-1/2 -translate-y-[22px] rounded-full ${UI_BLUR.glow} ${isNightMode ? UI_GLASS.authCard.glow.night : UI_GLASS.authCard.glow.day}`} />

      <h1
        className={`relative mb-7 mt-2 text-center text-[64px] font-black tracking-[-0.04em] ${
          isNightMode
            ? "text-[#e8ecff] [text-shadow:0_2px_0_rgba(255,255,255,0.08),0_0_1px_rgba(0,0,0,0.7),2px_4px_10px_rgba(0,0,0,0.28)]"
            : "text-[#f4f4f4] [text-shadow:0_2px_0_rgba(255,255,255,0.95),0_0_1px_rgba(0,0,0,0.7),2px_4px_10px_rgba(0,0,0,0.25)]"
        }`}
        style={{ fontFamily: "Arial Black, ui-sans-serif, system-ui, sans-serif" }}
      >
        Welcome
      </h1>

      <AuthFields
        fields={[
          { key: "id", placeholder: "Email / ID" },
          { key: "password", placeholder: "Password", type: "password" },
        ]}
        isNightMode={isNightMode}
        onInputHover={onInputHover}
        values={{ id: loginId, password: loginPassword }}
        onChange={(key, value) => onLoginFieldChange(key as "id" | "password", value)}
      />

      {loginStatus !== "default" && (
        <p
          className={`mt-3 px-1 text-[11px] leading-4 ${
            loginStatus === "success"
              ? "text-emerald-500"
              : "text-red-500"
          }`}
        >
          {loginMessage}
        </p>
      )}

      <div className="relative mt-4 min-h-[56px]">
        <button
          type="button"
          onClick={onGoSignIn}
          className={`absolute left-1 bottom-2 text-[17px] font-semibold tracking-[0.01em] ${
            isNightMode ? "text-white/58 hover:text-white/80" : "text-black/42 hover:text-black/62"
          }`}
        >
          Sign in
        </button>
      </div>

      <PrimaryCircleButton
        ariaLabel="Login"
        isNightMode={isNightMode}
        onClick={onLogin}
        onHover={onButtonHover}
        onPress={onButtonPressed}
      />
    </div>
  );
}

function SignInCard({
  onCreateAccount,
  onBack,
  onInputHover,
  onButtonHover,
  onButtonPressed,
  isNightMode,
  email,
  setEmail,
  verificationCode,
  setVerificationCode,
  name,
  setName,
  password,
  setPassword,
  onSendVerification,
  verificationStatus,
  isCodeSent,
  signUpStatus,
  signUpMessage,
}: {
  onCreateAccount: () => void;
  onBack: () => void;
  onInputHover: (value: boolean) => void;
  onButtonHover: (value: boolean) => void;
  onButtonPressed: (value: boolean) => void;
  isNightMode: boolean;
  email: string;
  setEmail: (value: string) => void;
  verificationCode: string;
  setVerificationCode: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  onSendVerification: () => void;
  verificationStatus: FieldState;
  isCodeSent: boolean;
  signUpStatus: "default" | "success" | "error";
  signUpMessage: string;
}) {
  const verificationTextColor =
    verificationStatus === "success"
      ? "text-emerald-500"
      : verificationStatus === "error"
        ? "text-red-500"
        : isNightMode
          ? "text-white/62"
          : "text-black/40";

  return (
    <div
      className={`absolute left-1/2 top-[280px] z-20 w-[340px] -translate-x-1/2 rounded-[22px] border p-5 pb-20 ${UI_BLUR.primaryCard} ${
        isNightMode ? UI_GLASS.authCard.surface.night : UI_GLASS.authCard.surface.day
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 rounded-[22px] ${UI_NOISE.cardDots} ${
          isNightMode ? UI_NOISE.cardDotsOpacity.night : UI_NOISE.cardDotsOpacity.loginDay
        }`}
      />
      <div className={`absolute left-1/2 top-0 h-[86px] w-[184px] -translate-x-1/2 -translate-y-[22px] rounded-full ${UI_BLUR.glow} ${isNightMode ? UI_GLASS.authCard.glow.night : UI_GLASS.authCard.glow.day}`} />

      <div className="relative mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className={`rounded-full border px-3 py-1.5 text-[12px] tracking-[0.08em] ${
            isNightMode
              ? "border-white/10 bg-[rgba(255,255,255,0.06)] text-white/54"
              : "border-white/40 bg-[rgba(255,255,255,0.44)] text-black/42"
          }`}
        >
          BACK
        </button>
        <p className={`text-[11px] tracking-[0.18em] ${isNightMode ? "text-white/28" : "text-black/28"}`}>
          EMAIL SIGN UP
        </p>
      </div>

      <h2
        className={`relative mb-5 text-center text-[38px] font-black tracking-[-0.04em] ${
          isNightMode
            ? "text-[#e8ecff] [text-shadow:0_2px_0_rgba(255,255,255,0.08),0_0_1px_rgba(0,0,0,0.7),2px_4px_10px_rgba(0,0,0,0.22)]"
            : "text-[#f4f4f4] [text-shadow:0_2px_0_rgba(255,255,255,0.95),0_0_1px_rgba(0,0,0,0.66),2px_4px_10px_rgba(0,0,0,0.18)]"
        }`}
        style={{ fontFamily: "Arial Black, ui-sans-serif, system-ui, sans-serif" }}
      >
        Sign in
      </h2>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <FieldShell isNightMode={isNightMode} onHover={onInputHover}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-full w-full bg-transparent pr-2 text-[20px] outline-none tracking-[0.02em] ${
                  isNightMode ? "text-white/62 placeholder:text-white/28" : "text-black/40 placeholder:text-black/35"
                }`}
              />
            </FieldShell>
          </div>

          <button
            type="button"
            aria-label="Verify email"
            onClick={onSendVerification}
            onMouseEnter={() => onInputHover(true)}
            onMouseLeave={() => onInputHover(false)}
            className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border transition-transform hover:scale-[1.03] active:scale-[0.97] ${
              isNightMode
                ? "border-white/10 bg-[linear-gradient(180deg,rgba(214,220,255,0.18),rgba(121,130,205,0.22))] text-white/90 shadow-[inset_0_1px_2px_rgba(255,255,255,0.18),inset_0_-10px_18px_rgba(0,0,0,0.2)]"
                : "border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(224,224,224,0.92))] text-black/55 shadow-[0_6px_12px_rgba(0,0,0,0.16),inset_0_1px_2px_rgba(255,255,255,0.95)]"
            }`}
          >
            <span className="text-[24px] leading-none">✓</span>
          </button>
        </div>

        <FieldShell isNightMode={isNightMode} onHover={onInputHover} state={verificationStatus}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Email verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className={`h-full w-full bg-transparent text-[20px] outline-none tracking-[0.08em] placeholder:tracking-[0.02em] ${verificationTextColor}`}
          />
        </FieldShell>

        <p
          className={`px-1 text-[11px] leading-4 ${
            verificationStatus === "success"
              ? "text-emerald-500"
              : verificationStatus === "error"
                ? "text-red-500"
                : isNightMode
                  ? "text-white/34"
                  : "text-black/32"
          }`}
        >
          {verificationStatus === "success"
            ? "Email verification successful"
            : verificationStatus === "error"
              ? "Verification code is incorrect"
              : isCodeSent
                ? "Code sent to your email. Please enter it below."
                : "Press ✓ to send the verification code to your email."}
        </p>

        <FieldShell isNightMode={isNightMode} onHover={onInputHover}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`h-full w-full bg-transparent text-[20px] outline-none tracking-[0.02em] ${
              isNightMode ? "text-white/62 placeholder:text-white/28" : "text-black/40 placeholder:text-black/35"
            }`}
          />
        </FieldShell>

        <FieldShell isNightMode={isNightMode} onHover={onInputHover}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`h-full w-full bg-transparent text-[20px] outline-none tracking-[0.02em] ${
              isNightMode ? "text-white/62 placeholder:text-white/28" : "text-black/40 placeholder:text-black/35"
            }`}
          />
        </FieldShell>

        {signUpStatus !== "default" && (
          <p
            className={`px-1 text-[11px] leading-4 ${
              signUpStatus === "success" ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {signUpMessage}
          </p>
        )}
      </div>

      <PrimaryCircleButton
        ariaLabel="Create account"
        isNightMode={isNightMode}
        onClick={onCreateAccount}
        onHover={onButtonHover}
        onPress={onButtonPressed}
      />
    </div>
  );
}

export default function RecoveredCatStudyLogin() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const desktopShell = isDesktopShell();
  const [screen, setScreen] = useState<Screen>("login");
  const [isAuthBooting, setIsAuthBooting] = useState(true);
  const [authUser, setAuthUser] = useState<{
    id: string;
    name: string;
    email: string;
    loginId: string;
    createdAt: string;
  } | null>(null);
  const [pupils, setPupils] = useState({
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
  });
  const [isInputHover, setIsInputHover] = useState(false);
  const [isButtonHover, setIsButtonHover] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [isAppClicked, setIsAppClicked] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState<"default" | "success" | "error">("default");
  const [loginMessage, setLoginMessage] = useState("");
  const [signUpStatus, setSignUpStatus] = useState<"default" | "success" | "error">("default");
  const [signUpMessage, setSignUpMessage] = useState("");

  const pupilScale =
    isButtonPressed
      ? 2.8
      : isAppClicked
        ? 2.4
        : isButtonHover
          ? 2.5
          : isInputHover
            ? 1.8
            : 0.9;

  const verificationStatus: FieldState =
    verificationCode.length === 0
      ? "default"
      : verificationCode === DEMO_VERIFICATION_CODE
        ? "success"
        : "error";

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const sessionUser = await getCurrentSessionUser();

      if (!active) return;

      if (sessionUser) {
        setAuthUser(sessionUser);
      }

      setIsAuthBooting(false);
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authUser) return;

    const handleMove = (event: MouseEvent) => {
      const container = frameRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const eyeCenters =
        screen === "signin"
          ? {
              left: { x: 150, y: 272 },
              right: { x: 214, y: 272 },
            }
          : {
              left: { x: 150, y: 300 },
              right: { x: 214, y: 300 },
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
      setIsInputHover(false);
      setIsButtonHover(false);
      setIsButtonPressed(false);
      setIsAppClicked(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [authUser, screen]);

  const triggerAppClickEyes = () => {
    setIsAppClicked(true);

    window.clearTimeout((window as Window & { __catEyeClickTimer?: number }).__catEyeClickTimer);
    (window as Window & { __catEyeClickTimer?: number }).__catEyeClickTimer = window.setTimeout(() => {
      setIsAppClicked(false);
    }, 180);
  };

  const handleSendVerification = async () => {
    if (!email.trim()) {
      setSignUpStatus("error");
      setSignUpMessage("Please enter your email first.");
      return;
    }

    try {
      const result = await requestVerificationCode(email);
      setIsCodeSent(true);
      setSignUpStatus("success");
      setSignUpMessage(`Demo verification code: ${result.demoCode || DEMO_VERIFICATION_CODE}`);
    } catch (error) {
      setSignUpStatus("error");
      setSignUpMessage(error instanceof Error ? error.message : "Unable to send verification code.");
    }
  };

  const handleLoginFieldChange = (key: "id" | "password", value: string) => {
    if (key === "id") setLoginId(value);
    if (key === "password") setLoginPassword(value);
    if (loginStatus !== "default") setLoginStatus("default");
    if (loginMessage) setLoginMessage("");
  };

  const resetSignUpForm = () => {
    setEmail("");
    setVerificationCode("");
    setName("");
    setPassword("");
    setIsCodeSent(false);
    setSignUpStatus("default");
    setSignUpMessage("");
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginStatus("error");
      setLoginMessage("Please enter both ID and password.");
      return;
    }

    try {
      const user = await loginUser({
        identifier: loginId,
        password: loginPassword,
      });

      setLoginStatus("success");
      setLoginMessage("Login successful.");
      setAuthUser(user);
    } catch (error) {
      setLoginStatus("error");
      setLoginMessage(error instanceof Error ? error.message : "Unable to login right now.");
    }
  };

  const handleCreateAccount = async () => {
    if (!email.trim() || !name.trim() || !password.trim()) {
      setSignUpStatus("error");
      setSignUpMessage("Please complete every sign up field.");
      return;
    }

    if (verificationCode !== DEMO_VERIFICATION_CODE) {
      setSignUpStatus("error");
      setSignUpMessage("Verification code is incorrect.");
      return;
    }

    try {
      const user = await registerUser({
        email,
        name,
        password,
        verificationCode,
      });

      setSignUpStatus("success");
      setSignUpMessage("Account created successfully.");
      setLoginId(user.loginId);
      setLoginPassword("");
      resetSignUpForm();
      setAuthUser(user);
    } catch (error) {
      setSignUpStatus("error");
      setSignUpMessage(error instanceof Error ? error.message : "Unable to create your account.");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setAuthUser(null);
    setScreen("login");
    setLoginStatus("default");
    setLoginMessage("");
  };

  if (isAuthBooting) {
    return (
      <div
        className={`text-[14px] ${
          desktopShell
            ? "flex h-[860px] w-[390px] items-center justify-center bg-transparent text-black/45"
            : "flex min-h-screen items-center justify-center bg-[#efefef] p-6 text-black/45"
        }`}
      >
        Restoring session...
      </div>
    );
  }

  if (authUser) {
    return <CatStudyDashboard user={authUser} onLogout={handleLogout} />;
  }

  return (
    <div
      className={
        desktopShell
          ? `h-[860px] w-[390px] overflow-hidden bg-transparent ${APP_SHELL_RADIUS_CLASS}`
          : `flex min-h-screen items-center justify-center p-6 transition-colors duration-500 ${
              isNightMode ? "bg-[#10131b]" : "bg-[#efefef]"
            }`
      }
    >
      <div
        ref={frameRef}
        onClick={triggerAppClickEyes}
        className={desktopShell ? `h-full w-full overflow-hidden ${APP_SHELL_RADIUS_CLASS}` : undefined}
      >
        <ScreenShell isNightMode={isNightMode} onToggleNightMode={() => setIsNightMode((prev) => !prev)}>
          {screen === "login" && (
            <>
              <CatMascot pupils={pupils} pupilScale={pupilScale} />
              <LoginCard
                onLogin={handleLogin}
                onGoSignIn={() => setScreen("signin")}
                onInputHover={setIsInputHover}
                onButtonHover={setIsButtonHover}
                onButtonPressed={setIsButtonPressed}
                isNightMode={isNightMode}
                loginStatus={loginStatus}
                loginMessage={loginMessage}
                loginId={loginId}
                loginPassword={loginPassword}
                onLoginFieldChange={handleLoginFieldChange}
              />
            </>
          )}

          {screen === "signin" && (
            <>
              <CatMascot pupils={pupils} pupilScale={pupilScale} top="top-[190px]" size="w-[220px] h-[170px]" />
              <SignInCard
                onCreateAccount={handleCreateAccount}
                onBack={() => setScreen("login")}
                onInputHover={setIsInputHover}
                onButtonHover={setIsButtonHover}
                onButtonPressed={setIsButtonPressed}
                isNightMode={isNightMode}
                email={email}
                setEmail={setEmail}
                verificationCode={verificationCode}
                setVerificationCode={setVerificationCode}
                name={name}
                setName={setName}
                password={password}
                setPassword={setPassword}
                onSendVerification={handleSendVerification}
                verificationStatus={verificationStatus}
                isCodeSent={isCodeSent}
                signUpStatus={signUpStatus}
                signUpMessage={signUpMessage}
              />
            </>
          )}
        </ScreenShell>
      </div>
    </div>
  );
}
