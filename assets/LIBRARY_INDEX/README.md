# Asset Library Index

Searchable, metadata-rich index for the Sylvester AI Lab permanent asset library.
This is the single source of truth for what exists, where it lives, its license, and
how often it has been reused.

## Schema (`library_index.csv`)

| Column | Meaning |
|---|---|
| `id` | Stable unique id (e.g. `A0001`) |
| `category` | Top-level folder, e.g. `01_LOGOS` |
| `subcategory` | Sub-folder, e.g. `AI` |
| `filename` | File name |
| `rel_path` | Path relative to `assets/`, e.g. `01_LOGOS/AI/openai.svg` |
| `source_url` | Where it was acquired |
| `license` | CC0 / MIT / Apache / PublicDomain / RoyaltyFree / Commercial / Unknown |
| `tags` | Comma-separated tags for search |
| `quality_score` | 0–100 (from the acquisition pipeline vision ranking) |
| `date_added` | ISO date |
| `usage_count` | How many times reused (usage history) |
| `notes` | Free text |

## Usage

```
python3 scripts/asset_library.py register <file> <rel_folder> \
    [--source URL] [--license L] [--tags a,b,c] [--score 0-100] [--notes N]
        Move <file> into assets/<rel_folder>/ and index it.

python3 scripts/asset_library.py search <term>
        Case-insensitive search across filename/category/subcategory/tags/notes.

python3 scripts/asset_library.py list [--category 01_LOGOS] [--sub AI]
        List indexed assets, optionally filtered.

python3 scripts/asset_library.py used <id>
        Increment usage_count (call when an asset is reused in a video).

python3 scripts/asset_library.py dupes
        List duplicate filenames already in the library (avoid re-downloading).

python3 scripts/asset_library.py stats
        Count of assets per top-level category.

python3 scripts/asset_library.py import <folder>
        Walk a folder and index every file found (bulk import after a migration).
```

## Rules (from BRAIN.md / asset architecture)
- Place every asset in its correct category folder.
- Before downloading, run `dupes` / `search` to avoid duplication.
- Analyze candidates with `vision.py`; keep only the top quality tier.
- Never sacrifice quality to hit a numerical target.
