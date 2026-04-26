from __future__ import annotations

import atexit
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

try:
    from PySide6.QtCore import QEvent, QRectF, Qt, QUrl
    from PySide6.QtGui import QColor, QPainterPath, QPalette, QRegion
    from PySide6.QtWebEngineCore import QWebEnginePage, QWebEngineProfile, QWebEngineScript, QWebEngineSettings
    from PySide6.QtWebEngineWidgets import QWebEngineView
    from PySide6.QtWidgets import QApplication, QMainWindow
except ImportError as error:
    raise SystemExit(
        "Missing desktop dependency 'PySide6'. Install it with: python -m pip install PySide6"
    ) from error


IS_FROZEN = getattr(sys, "frozen", False)
PROJECT_ROOT = Path(__file__).resolve().parent
RUNTIME_ROOT = Path(getattr(sys, "_MEIPASS", PROJECT_ROOT))
APP_ROOT = Path(sys.executable).resolve().parent if IS_FROZEN else PROJECT_ROOT
DIST_INDEX = RUNTIME_ROOT / "dist" / "index.html"
SERVER_SCRIPT = RUNTIME_ROOT / "cat_study_server.mjs"
BACKEND_HEALTH_URL = "http://127.0.0.1:3100/api/health"
FRONTEND_DEV_URL = "http://127.0.0.1:5173"
IS_DEV_MODE = "--dev" in sys.argv
APP_WIDTH = 390
APP_HEIGHT = 860
APP_RADIUS = 28
LOCKED_ZOOM_FACTOR = 1.0

backend_process: subprocess.Popen[str] | None = None

DESKTOP_BRIDGE_SCRIPT = """
window.__CAT_STUDY_API_URL__ = "http://127.0.0.1:3100";
window.__CAT_STUDY_DESKTOP__ = {
  isDesktopShell: true,
  close: function () {
    window.location.href = "catstudy://close";
  },
  minimize: function () {
    window.location.href = "catstudy://minimize";
  },
  drag: function () {
    window.location.href = "catstudy://drag";
  }
};
"""


def build_rounded_region(width: int, height: int, radius: int) -> QRegion:
    path = QPainterPath()
    path.addRoundedRect(QRectF(0, 0, width, height), radius, radius)
    return QRegion(path.toFillPolygon().toPolygon())


def is_zoom_shortcut(key: int, modifiers: Qt.KeyboardModifier) -> bool:
    if not modifiers & Qt.KeyboardModifier.ControlModifier:
        return False

    return key in {
        int(Qt.Key.Key_0),
        int(Qt.Key.Key_Equal),
        int(Qt.Key.Key_Plus),
        int(Qt.Key.Key_Minus),
        int(Qt.Key.Key_Underscore),
    }


def get_npm_command() -> str:
    npm_command = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm_command:
        raise RuntimeError("npm was not found in PATH.")
    return npm_command


def get_creation_flags() -> int:
    return getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0


def relaunch_with_pythonw_if_needed() -> None:
    if os.name != "nt" or IS_FROZEN:
        return

    if os.environ.get("CAT_STUDY_DESKTOP_RELAUNCHED") == "1":
        return

    executable_name = Path(sys.executable).name.lower()
    if executable_name != "python.exe":
        return

    pythonw_path = Path(sys.executable).with_name("pythonw.exe")
    if not pythonw_path.exists():
        return

    env = os.environ.copy()
    env["CAT_STUDY_DESKTOP_RELAUNCHED"] = "1"

    subprocess.Popen(
        [str(pythonw_path), str(Path(__file__).resolve()), *sys.argv[1:]],
        cwd=PROJECT_ROOT,
        env=env,
        creationflags=get_creation_flags(),
    )
    raise SystemExit(0)


def wait_for_url(url: str, timeout_seconds: float = 30.0) -> bool:
    started_at = time.time()

    while time.time() - started_at < timeout_seconds:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if 200 <= response.status < 500:
                    return True
        except (urllib.error.URLError, TimeoutError):
            time.sleep(0.35)

    return False


def run_build_if_needed() -> None:
    if DIST_INDEX.exists():
        return

    if IS_FROZEN:
        raise RuntimeError("The bundled frontend files are missing from the desktop package.")

    subprocess.run(
        [get_npm_command(), "run", "build"],
        cwd=PROJECT_ROOT,
        check=True,
        creationflags=get_creation_flags(),
    )


def get_storage_dir() -> Path:
    local_app_data = os.getenv("LOCALAPPDATA")
    base_dir = Path(local_app_data) if local_app_data else PROJECT_ROOT
    storage_dir = base_dir / "CatStudyApp"
    storage_dir.mkdir(parents=True, exist_ok=True)
    return storage_dir


def start_backend() -> None:
    global backend_process

    if wait_for_url(BACKEND_HEALTH_URL, timeout_seconds=1.0):
        return

    storage_dir = get_storage_dir()
    env = os.environ.copy()
    env["PORT"] = "3100"
    env["CAT_STUDY_DB_PATH"] = str(storage_dir / "cat_study_db.json")

    node_executable = shutil.which("node") if not IS_FROZEN else str(RUNTIME_ROOT / "node.exe")
    if not node_executable:
        raise RuntimeError("Node.js was not found for the bundled backend.")

    backend_process = subprocess.Popen(
        [node_executable, str(SERVER_SCRIPT)],
        cwd=APP_ROOT,
        env=env,
        creationflags=get_creation_flags(),
    )

    if not wait_for_url(BACKEND_HEALTH_URL, timeout_seconds=15.0):
        raise RuntimeError("Backend server did not start in time.")


def stop_backend() -> None:
    global backend_process

    if backend_process is None:
        return

    if backend_process.poll() is None:
        backend_process.terminate()
        try:
            backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()

    backend_process = None


def get_start_url() -> str:
    if IS_DEV_MODE:
        if not wait_for_url(FRONTEND_DEV_URL, timeout_seconds=30.0):
            raise RuntimeError("Vite dev server did not start in time.")
        return FRONTEND_DEV_URL

    run_build_if_needed()
    return DIST_INDEX.resolve().as_uri()


class DesktopPage(QWebEnginePage):
    def __init__(self, host_window: QMainWindow) -> None:
        super().__init__(host_window)
        self.host_window = host_window

    def acceptNavigationRequest(self, url, nav_type, is_main_frame):  # type: ignore[override]
        if url.scheme() == "catstudy":
            action = url.host() or url.path().lstrip("/")
            window = self.host_window

            if window is not None:
                if action == "close":
                    window.close()
                elif action == "minimize":
                    window.showMinimized()
                elif action == "drag":
                    handle = window.windowHandle()
                    if handle is not None:
                        handle.startSystemMove()

            return False

        return super().acceptNavigationRequest(url, nav_type, is_main_frame)


class LockedWebView(QWebEngineView):
    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self.enforce_zoom_lock()

    def enforce_zoom_lock(self) -> None:
        if abs(self.zoomFactor() - LOCKED_ZOOM_FACTOR) > 0.001:
            self.setZoomFactor(LOCKED_ZOOM_FACTOR)

    def wheelEvent(self, event) -> None:  # type: ignore[override]
        if event.modifiers() & Qt.KeyboardModifier.ControlModifier:
            self.enforce_zoom_lock()
            event.accept()
            return

        super().wheelEvent(event)

    def keyPressEvent(self, event) -> None:  # type: ignore[override]
        if is_zoom_shortcut(event.key(), event.modifiers()):
            self.enforce_zoom_lock()
            event.accept()
            return

        super().keyPressEvent(event)

    def event(self, event) -> bool:  # type: ignore[override]
        if event.type() in {QEvent.Type.Gesture, QEvent.Type.NativeGesture}:
            self.enforce_zoom_lock()
            return True

        return super().event(event)


class CatStudyWindow(QMainWindow):
    def __init__(self, start_url: str, profile_dir: Path) -> None:
        super().__init__()
        self.setWindowTitle("Cat Study App")
        self.setWindowFlags(Qt.WindowType.Window | Qt.WindowType.FramelessWindowHint)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.resize(APP_WIDTH, APP_HEIGHT)
        self.setFixedSize(APP_WIDTH, APP_HEIGHT)
        self.setStyleSheet("background: transparent;")

        profile = QWebEngineProfile.defaultProfile()
        profile.setPersistentStoragePath(str(profile_dir / "qt-webengine-storage"))
        profile.setCachePath(str(profile_dir / "qt-webengine-cache"))

        page = DesktopPage(self)
        page.setBackgroundColor(QColor(0, 0, 0, 0))
        page.settings().setAttribute(
            QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls,
            True,
        )
        page.settings().setAttribute(
            QWebEngineSettings.WebAttribute.LocalContentCanAccessFileUrls,
            True,
        )

        bridge_script = QWebEngineScript()
        bridge_script.setName("cat-study-desktop-bridge")
        bridge_script.setInjectionPoint(QWebEngineScript.InjectionPoint.DocumentCreation)
        bridge_script.setWorldId(QWebEngineScript.ScriptWorldId.MainWorld)
        bridge_script.setRunsOnSubFrames(False)
        bridge_script.setSourceCode(DESKTOP_BRIDGE_SCRIPT)
        page.scripts().insert(bridge_script)

        browser = LockedWebView(self)
        browser.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        browser.setPage(page)
        browser.setUrl(QUrl(start_url))
        browser.loadStarted.connect(browser.enforce_zoom_lock)
        browser.loadFinished.connect(lambda _ok: browser.enforce_zoom_lock())
        browser.setStyleSheet(f"background: transparent; border: none; border-radius: {APP_RADIUS}px;")
        self.setCentralWidget(browser)
        self.browser = browser
        self.apply_rounded_mask()

    def apply_rounded_mask(self) -> None:
        rounded_region = build_rounded_region(self.width(), self.height(), APP_RADIUS)
        self.setMask(rounded_region)
        if hasattr(self, "browser"):
            self.browser.setMask(rounded_region)

    def resizeEvent(self, event) -> None:  # type: ignore[override]
        super().resizeEvent(event)
        self.apply_rounded_mask()

    def closeEvent(self, event) -> None:  # type: ignore[override]
        stop_backend()
        super().closeEvent(event)


def main() -> None:
    relaunch_with_pythonw_if_needed()
    atexit.register(stop_backend)
    start_backend()
    start_url = get_start_url()
    storage_dir = get_storage_dir()

    app = QApplication(sys.argv)
    app.setApplicationName("Cat Study App")

    palette = app.palette()
    palette.setColor(QPalette.Window, QColor("transparent"))
    palette.setColor(QPalette.Base, QColor("transparent"))
    app.setPalette(palette)

    window = CatStudyWindow(start_url, storage_dir)
    window.show()

    exit_code = app.exec()
    stop_backend()
    raise SystemExit(exit_code)


if __name__ == "__main__":
    main()
