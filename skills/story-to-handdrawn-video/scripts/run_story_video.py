#!/usr/bin/env python3
"""Portable Skill wrapper for the project's canonical renderer."""

from __future__ import annotations

import os
import runpy
from pathlib import Path


def find_project() -> Path:
    configured = os.environ.get("STORY_VIDEO_PROJECT")
    if configured:
        return Path(configured).expanduser().resolve()

    candidates = [Path.cwd(), *Path(__file__).resolve().parents]
    for candidate in candidates:
        renderer = candidate / "scripts/run_story_video.py"
        if (candidate / "package.json").exists() and renderer.exists():
            return candidate

    raise SystemExit(
        "Story video project not found. Run inside the project or set "
        "STORY_VIDEO_PROJECT=/absolute/path/to/project."
    )


if __name__ == "__main__":
    project = find_project()
    os.environ.setdefault("STORY_VIDEO_PROJECT", str(project))
    runpy.run_path(str(project / "scripts/run_story_video.py"), run_name="__main__")
