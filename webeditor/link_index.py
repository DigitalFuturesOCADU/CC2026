#!/usr/bin/env python3
"""Add a "web editor" link after every "code" link in the index pages.

Reads the sketch IDs from webeditor/.sync/registry.json (written by
p5-webeditor-sync) and puts the Web Editor link right after the matching
GitHub "code" link. Run it after each sync. Links that are already there are
updated in place, so running it twice changes nothing.

    python3 webeditor/link_index.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEXES = [ROOT / "index.html", ROOT / "reference" / "index.html"]
REGISTRY = ROOT / "webeditor" / ".sync" / "registry.json"
CODE_BASE = "https://github.com/DigitalFuturesOCADU/CC2026/tree/main/"


def slug_for(path: str) -> str:
    parts = path.strip("/").split("/")
    if parts[0] == "experiment-2":
        parts = ["e2"] + parts[1:]
    return "-".join(parts)


def main() -> None:
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    account = registry["account"]
    projects = registry["projects"]
    code_link = re.compile(
        r'(<a class="code" href="' + re.escape(CODE_BASE) + r'([^"]+)">code</a>)'
        r'(?: <a class="code" href="https://editor\.p5js\.org/[^"]+">web editor</a>)?'
    )
    missing = []

    def add_editor_link(match: re.Match) -> str:
        slug = slug_for(match.group(2))
        project = projects.get(slug)
        if not project:
            missing.append(slug)
            return match.group(1)
        url = f"https://editor.p5js.org/{account}/sketches/{project['projectId']}"
        return f'{match.group(1)} <a class="code" href="{url}">web editor</a>'

    for index in INDEXES:
        page = code_link.sub(add_editor_link, index.read_text(encoding="utf-8"))
        index.write_text(page, encoding="utf-8")
        linked = page.count(">web editor</a>")
        print(f"{linked} web editor links in {index.relative_to(ROOT)}")
    if missing:
        print("Not synced yet:", ", ".join(missing))


if __name__ == "__main__":
    main()
