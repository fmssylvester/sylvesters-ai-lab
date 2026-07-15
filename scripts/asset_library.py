#!/usr/bin/env python3
"""Asset Library index manager.

Maintains assets/LIBRARY_INDEX/library_index.csv with full metadata
(source, license, tags, quality score, usage history) and helps avoid
duplication. Mirrors the acquisition pipeline in BRAIN.md / ASSET architecture.

Commands:
  register <file> <rel_folder> [--source U] [--license L] [--tags a,b] [--score 0-100] [--notes N]
  search <term>
  list [--category C] [--sub S]
  used <id>
  dupes
  stats
  import <folder>
"""
import sys
import os
import csv
import shutil
import datetime
import argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
INDEX = os.path.join(ASSETS, "LIBRARY_INDEX", "library_index.csv")
FIELDS = [
    "id", "category", "subcategory", "filename", "rel_path", "source_url",
    "license", "tags", "quality_score", "date_added", "usage_count", "notes",
]


def _read():
    if not os.path.exists(INDEX):
        return []
    with open(INDEX, newline="") as f:
        return list(csv.DictReader(f))


def _write(rows):
    os.makedirs(os.path.dirname(INDEX), exist_ok=True)
    with open(INDEX, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)


def _next_id(rows):
    n = 0
    for r in rows:
        try:
            n = max(n, int(r["id"].replace("A", "")))
        except Exception:
            pass
    return f"A{n+1:04d}"


def register(path, rel_folder, source="", license_="Unknown", tags="", score="", notes=""):
    if not os.path.exists(path):
        print("file not found:", path); sys.exit(1)
    dest_dir = os.path.join(ASSETS, rel_folder)
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, os.path.basename(path))
    if os.path.abspath(path) != os.path.abspath(dest):
        shutil.move(path, dest)
    rows = _read()
    cat = rel_folder.split("/")[0]
    sub = "/".join(rel_folder.split("/")[1:]) or ""
    row = {
        "id": _next_id(rows), "category": cat, "subcategory": sub,
        "filename": os.path.basename(dest), "rel_path": f"{rel_folder}/{os.path.basename(dest)}",
        "source_url": source, "license": license_, "tags": tags,
        "quality_score": score, "date_added": datetime.date.today().isoformat(),
        "usage_count": "0", "notes": notes,
    }
    rows.append(row)
    _write(rows)
    print(f"registered {row['id']} -> {row['rel_path']}")


def search(term):
    rows = _read()
    t = term.lower()
    hit = [r for r in rows if t in (r["filename"] + r["category"] + r["subcategory"] + r["tags"] + r["notes"]).lower()]
    if not hit:
        print("no matches")
        return
    for r in hit:
        print(f"{r['id']}  {r['rel_path']}  [{r['license']}]  q={r['quality_score']}  tags={r['tags']}")


def list_cmd(category, sub):
    rows = _read()
    if category:
        rows = [r for r in rows if r["category"] == category]
    if sub:
        rows = [r for r in rows if r["subcategory"] == sub]
    for r in rows:
        print(f"{r['id']}  {r['rel_path']}  q={r['quality_score']}  used={r['usage_count']}")
    print(f"-- {len(rows)} assets --")


def used(aid):
    rows = _read()
    for r in rows:
        if r["id"] == aid:
            r["usage_count"] = str(int(r.get("usage_count") or 0) + 1)
            break
    else:
        print("id not found"); return
    _write(rows)
    print("usage incremented:", aid)


def dupes():
    rows = _read()
    seen = {}
    for r in rows:
        seen.setdefault(r["filename"], []).append(r["rel_path"])
    any_ = False
    for fn, paths in seen.items():
        if len(paths) > 1:
            any_ = True
            print(f"DUPLICATE {fn}: {paths}")
    if not any_:
        print("no duplicates")


def stats():
    rows = _read()
    counts = {}
    for r in rows:
        counts[r["category"]] = counts.get(r["category"], 0) + 1
    for k in sorted(counts):
        print(f"{k:24s} {counts[k]}")
    print(f"-- total {len(rows)} --")


def import_folder(folder):
    abs_folder = folder if os.path.isabs(folder) else os.path.join(ROOT, folder)
    if not os.path.isdir(abs_folder):
        print("folder not found:", abs_folder); sys.exit(1)
    rows = _read()
    existing = {r["rel_path"] for r in rows}
    added = 0
    last_rel = ""
    for root, _, files in os.walk(abs_folder):
        for fn in files:
            full = os.path.join(root, fn)
            rel = os.path.relpath(full, ASSETS)
            last_rel = rel
            if rel in existing:
                continue
            cat = rel.split("/")[0]
            sub = "/".join(rel.split("/")[1:-1])
            rows.append({
                "id": _next_id(rows), "category": cat, "subcategory": sub,
                "filename": fn, "rel_path": rel, "source_url": "", "license": "Unknown",
                "tags": "", "quality_score": "", "date_added": datetime.date.today().isoformat(),
                "usage_count": "0", "notes": "bulk import",
            })
            existing.add(rel)
            added += 1
    if added:
        _write(rows)
    print(f"imported {added} new assets from {last_rel}")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd")
    p = sub.add_parser("register"); p.add_argument("file"); p.add_argument("rel_folder")
    p.add_argument("--source", default=""); p.add_argument("--license", default="Unknown")
    p.add_argument("--tags", default=""); p.add_argument("--score", default="")
    p.add_argument("--notes", default="")
    p = sub.add_parser("search"); p.add_argument("term")
    p = sub.add_parser("list"); p.add_argument("--category"); p.add_argument("--sub")
    p = sub.add_parser("used"); p.add_argument("aid")
    sub.add_parser("dupes")
    sub.add_parser("stats")
    p = sub.add_parser("import"); p.add_argument("folder")
    a = ap.parse_args()
    if a.cmd == "register":
        register(a.file, a.rel_folder, a.source, a.license, a.tags, a.score, a.notes)
    elif a.cmd == "search":
        search(a.term)
    elif a.cmd == "list":
        list_cmd(a.category, a.sub)
    elif a.cmd == "used":
        used(a.aid)
    elif a.cmd == "dupes":
        dupes()
    elif a.cmd == "stats":
        stats()
    elif a.cmd == "import":
        import_folder(a.folder)
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
