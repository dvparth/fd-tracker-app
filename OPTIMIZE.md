Post-build optimization

Usage:

1. Build the app:
   npm run build
2. Run the optimizer (or use the combined script):
   node ./scripts/optimize-build.js
   # or
   npm run build:opt

What it does:

- Runs PurgeCSS against the production build HTML and JS to remove unused CSS rules.
- Minifies CSS using csso.
- Minifies JS using terser.

Caveats:

- PurgeCSS analyzes static HTML/JS for used classnames. If you use dynamic classnames (strings assembled at runtime), add them to the `safelist` in `scripts/optimize-build.js`.
- MUI generates class names at runtime; PurgeCSS safelists common prefixes (`Mui`) in the script but you should test the optimized build thoroughly.
- For images, prefer adding responsive images and WebP conversions at source; this optimizer does not convert images.

Recommendations:

- After running `build:opt` test the `build/` output in a local static server.
- Consider adding a CI step to run `npm run build:opt` for production artifacts.
