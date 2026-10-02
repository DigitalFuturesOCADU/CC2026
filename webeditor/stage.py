#!/usr/bin/env python3
"""Stage every example for the p5.js Web Editor.

Copies each example folder's index.html and .js files into
webeditor/projects/<slug>/ with a meta.json (slug and title, taken from the
page's <title>), then rewrites the batches in p5-webeditor.config.json so they
match the folders. Media is never copied: every example loads its images, GIFs
and sounds by full web address, so the Web Editor copies need no uploads.

    python3 webeditor/stage.py
    XDG_CONFIG_HOME=~/.config/p5-candc node ../p5-webeditor-sync/bin/p5-webeditor-sync.mjs sync --batch intro

The XDG_CONFIG_HOME prefix selects the saved session for the shared
creationcomputation account. The sync tool refuses to run if the session and
the config's "account" disagree.
"""
import html
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROJECTS = ROOT / "webeditor" / "projects"
CONFIG = ROOT / "p5-webeditor.config.json"

# batch name -> folders that each hold one sketch (index.html + sketch.js)
SOURCES = {
    "intro": ["experiment-2/*/*/"],
    "p5-phone": ["p5-phone/*/"],
    "motion": ["motion/*/"],
    "sound-in": ["sound-in/*/"],
    "touch": ["touch/*/"],
    "drawing": ["drawing/*/"],
    "images": ["images/*/"],
    "gifs": ["gifs/*/"],
    "sound-out": ["sound-out/*/"],
    "flashlight": ["flashlight/*/"],
    "connecting": ["connecting/*/"],
}


def slug_for(folder: Path) -> str:
    rel = folder.relative_to(ROOT).parts
    if rel[0] == "experiment-2":
        rel = ("e2",) + rel[1:]
    return "-".join(rel)


def title_for(folder: Path) -> str:
    page = (folder / "index.html").read_text(encoding="utf-8")
    found = re.search(r"<title>(.*?)</title>", page, re.S)
    if not found:
        raise SystemExit(f"No <title> in {folder}/index.html")
    return html.unescape(found.group(1)).strip()


def main() -> None:
    batches = {}
    for batch, patterns in SOURCES.items():
        slugs = []
        for pattern in patterns:
            for folder in sorted(ROOT.glob(pattern)):
                if not (folder / "index.html").exists() or not (folder / "sketch.js").exists():
                    continue
                slug = slug_for(folder)
                target = PROJECTS / slug
                target.mkdir(parents=True, exist_ok=True)
                for old in target.iterdir():
                    if old.is_file() and old.name != "meta.json":
                        old.unlink()
                shutil.copy2(folder / "index.html", target / "index.html")
                for js in sorted(folder.glob("*.js")):
                    shutil.copy2(js, target / js.name)
                meta = {"slug": slug, "title": title_for(folder)}
                (target / "meta.json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
                slugs.append(slug)
        if slugs:
            batches[batch] = slugs

    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    config["batches"] = batches
    CONFIG.write_text(json.dumps(config, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for batch, slugs in batches.items():
        print(f"{batch}: {len(slugs)} sketches")


if __name__ == "__main__":
    main()
