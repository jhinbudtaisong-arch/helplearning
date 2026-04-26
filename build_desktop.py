from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent
DESKTOP_DIST = PROJECT_ROOT / "desktop-dist"
PYINSTALLER_WORK = PROJECT_ROOT / "build" / "pyinstaller"
APP_NAME = "CatStudyApp"


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=PROJECT_ROOT, check=True)


def get_npm_command() -> str:
    npm_command = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm_command:
        raise SystemExit("npm was not found in PATH. Install Node.js before packaging the desktop app.")
    return npm_command


def main() -> None:
    node_path = shutil.which("node")

    if not node_path:
        raise SystemExit("Node.js was not found in PATH. Install Node.js before packaging the desktop app.")

    run([sys.executable, "-m", "pip", "install", "PyInstaller"])
    run([get_npm_command(), "run", "build"])

    if DESKTOP_DIST.exists():
        shutil.rmtree(DESKTOP_DIST)

    if PYINSTALLER_WORK.exists():
        shutil.rmtree(PYINSTALLER_WORK)

    PYINSTALLER_WORK.mkdir(parents=True, exist_ok=True)

    command = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--noconfirm",
        "--clean",
        "--windowed",
        "--name",
        APP_NAME,
        "--distpath",
        str(DESKTOP_DIST),
        "--workpath",
        str(PYINSTALLER_WORK / "work"),
        "--specpath",
        str(PYINSTALLER_WORK / "spec"),
        "--add-data",
        f"{(PROJECT_ROOT / 'dist').resolve()};dist",
        "--add-data",
        f"{(PROJECT_ROOT / 'cat_study_server.mjs').resolve()};.",
        "--add-binary",
        f"{Path(node_path).resolve()};.",
        "desktop_launcher.py",
    ]

    run(command)

    app_path = DESKTOP_DIST / APP_NAME / f"{APP_NAME}.exe"
    print(f"Desktop app built at: {app_path}")


if __name__ == "__main__":
    main()
