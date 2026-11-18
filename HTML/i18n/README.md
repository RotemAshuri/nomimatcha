# Hebrew layer (i18n)

Every real page loads `i18n/he.js` (in `<head>`) and calls `NMHE.sweep()` before its first script.

- Language lives in `localStorage["nm-lang-v1"]` (`en` | `he`). `?lang=he` / `?lang=en` sets it. The EN / עב switches that already existed in the menu and the footer now work.
- In Hebrew the page gets `lang="he" dir="rtl"`, Adapter Hebrew Text is injected, every English string is swapped from the dictionary, and strings that page scripts add later are swapped too.
- English mode is untouched.

## Editing copy
Dictionary files are `src/dict-*.txt`, one entry per line: `English || עברית`.
- `A¦B¦C` in the Hebrew side = distribute to successive text nodes (for headlines built from one span per word/line).
- `/regex/ || replacement` = pattern rule (`$1` groups). `=>function(m,a){...}` for logic.
- `∅` = empty.
- Rebuild: `python3 i18n/build.py` (writes `he.js`).
- Find untranslated strings: open a page with `?lang=he&i18n=miss`; a hidden `<pre id="nm-miss">` lists them.

## Fonts
`src/fonts/ah-400|500|600|700.woff2` are subsets of the **TRIAL** Adapter Hebrew Text. The trial files replace final pe (ף) and final tsadi (ץ) with a box, so those two letters are excluded in `build.py` and fall back to the system font. Replace the four files with subsets of the licensed font, then remove the exclusion from `unicode-range`.

## Layout
`src/he.css`. Art-directed scenes (home hero + collection track) stay LTR, only their copy is RTL.
