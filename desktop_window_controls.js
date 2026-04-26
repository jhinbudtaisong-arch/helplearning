function getDesktopBridge() {
  if (typeof window === "undefined") {
    return null;
  }

  const bridge = window.__CAT_STUDY_DESKTOP__;
  return bridge && typeof bridge === "object" ? bridge : null;
}

export function isDesktopShell() {
  return Boolean(getDesktopBridge()?.isDesktopShell);
}

export function triggerDesktopAction(action) {
  const bridge = getDesktopBridge();
  const handler = bridge?.[action];

  if (typeof handler !== "function") {
    return false;
  }

  handler();
  return true;
}
